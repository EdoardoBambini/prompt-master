import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { processReasoningStep } from "./reasoning";
import { storage } from "./storage";
import { hashPassword, verifyPassword, generateToken, authMiddleware, optionalAuthMiddleware, type AuthenticatedRequest } from "./auth";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({ email, password: hashedPassword });

      const token = generateToken({ userId: user.id, email: user.email });

      res.status(201).json({
        message: "Account created successfully",
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { email, password } = parsed.data;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = generateToken({ userId: user.id, email: user.email });

      res.json({
        message: "Login successful",
        token,
        user: { id: user.id, email: user.email },
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Failed to login" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ id: user.id, email: user.email });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  app.get("/api/sessions", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const sessions = await storage.getSessionsByUser(req.user.userId);
      res.json(sessions);
    } catch (error) {
      console.error("Get sessions error:", error);
      res.status(500).json({ error: "Failed to get sessions" });
    }
  });

  app.get("/api/sessions/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const session = await storage.getSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (session.userId !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      res.json(session);
    } catch (error) {
      console.error("Get session error:", error);
      res.status(500).json({ error: "Failed to get session" });
    }
  });

  app.post("/api/sessions", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const { id, problemStatement, mode } = req.body;

      if (!id || !problemStatement || !mode) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const session = await storage.createSession({
        id,
        userId: req.user.userId,
        problemStatement,
        mode,
        status: "in_progress",
        currentStep: 0,
        completedSteps: [],
        stepData: {},
        evidenceCardIds: [],
        hypothesisCardIds: [],
      });

      res.status(201).json(session);
    } catch (error) {
      console.error("Create session error:", error);
      res.status(500).json({ error: "Failed to create session" });
    }
  });

  app.put("/api/sessions/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const existingSession = await storage.getSession(req.params.id);
      if (!existingSession) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (existingSession.userId !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      const session = await storage.updateSession(req.params.id, req.body);
      res.json(session);
    } catch (error) {
      console.error("Update session error:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  app.delete("/api/sessions/:id", authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const existingSession = await storage.getSession(req.params.id);
      if (!existingSession) {
        return res.status(404).json({ error: "Session not found" });
      }

      if (existingSession.userId !== req.user.userId) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.deleteSession(req.params.id);
      res.json({ message: "Session deleted" });
    } catch (error) {
      console.error("Delete session error:", error);
      res.status(500).json({ error: "Failed to delete session" });
    }
  });

  app.post("/api/reasoning/process-step", optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
      const { sessionId, currentStep, problemStatement, mode, previousStepData } = req.body;

      if (!sessionId || currentStep === undefined || !problemStatement || !mode) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const result = await processReasoningStep({
        sessionId,
        currentStep,
        problemStatement,
        mode,
        previousStepData: previousStepData || {},
      });

      if (req.user) {
        const session = await storage.getSession(sessionId);
        if (session && session.userId === req.user.userId) {
          const stepId = `step${currentStep}`;
          await storage.updateSession(sessionId, {
            currentStep: currentStep + 1,
            completedSteps: [...(session.completedSteps || []), currentStep],
            stepData: {
              ...(session.stepData || {}),
              [stepId]: result.data,
            },
            status: result.status === "STOP" ? "stopped" : (currentStep >= (mode === "evidence" ? 6 : 8) ? "completed" : "in_progress"),
            stopReason: result.status === "STOP" ? result.reason : undefined,
          });
        }
      }

      res.json(result);
    } catch (error) {
      console.error("Error processing reasoning step:", error);
      res.status(500).json({ 
        status: "STOP",
        reason: "SafetyConstraint",
        stepId: `step${req.body?.currentStep || 0}`,
        whatIsNeededNext: ["Try again with a clearer research question"],
        suggestedQueries: [],
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
