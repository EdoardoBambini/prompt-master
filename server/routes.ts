import type { Express } from "express";
import { createServer, type Server } from "node:http";
import { processReasoningStep } from "./reasoning";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/reasoning/process-step", async (req, res) => {
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
