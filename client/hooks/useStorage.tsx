import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, EvidenceCard, HypothesisCard, RoadmapCard, SessionMode } from "@/types/reasoning";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { useAuth } from "@/hooks/useAuth";

const SESSIONS_KEY = "@scireason_sessions";
const EVIDENCE_KEY = "@scireason_evidence";
const HYPOTHESES_KEY = "@scireason_hypotheses";
const ROADMAPS_KEY = "@scireason_roadmaps";

interface StorageContextType {
  sessions: Session[];
  evidenceCards: EvidenceCard[];
  hypothesisCards: HypothesisCard[];
  roadmapCards: RoadmapCard[];
  currentSession: Session | null;
  isProcessing: boolean;
  createSession: (problemStatement: string, mode: SessionMode) => Promise<Session>;
  getSession: (id: string) => Session | undefined;
  updateSession: (session: Session) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getEvidenceCard: (id: string) => EvidenceCard | undefined;
  getHypothesisCard: (id: string) => HypothesisCard | undefined;
  processNextStep: (sessionId: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export function StorageProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [evidenceCards, setEvidenceCards] = useState<EvidenceCard[]>([]);
  const [hypothesisCards, setHypothesisCards] = useState<HypothesisCard[]>([]);
  const [roadmapCards, setRoadmapCards] = useState<RoadmapCard[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { token, isAuthenticated } = useAuth();

  useEffect(() => {
    loadData();
  }, [isAuthenticated, token]);

  const loadData = async () => {
    try {
      if (isAuthenticated && token) {
        try {
          const response = await fetch(`${getApiUrl()}/api/sessions`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const apiSessions = await response.json();
            const formattedSessions: Session[] = apiSessions.map((s: any) => ({
              ...s,
              createdAt: s.createdAt || new Date().toISOString(),
              updatedAt: s.updatedAt || new Date().toISOString(),
            }));
            setSessions(formattedSessions);
            return;
          }
        } catch (error) {
          console.log("Failed to load from API, falling back to local storage");
        }
      }
      
      const [sessionsData, evidenceData, hypothesesData, roadmapsData] = await Promise.all([
        AsyncStorage.getItem(SESSIONS_KEY),
        AsyncStorage.getItem(EVIDENCE_KEY),
        AsyncStorage.getItem(HYPOTHESES_KEY),
        AsyncStorage.getItem(ROADMAPS_KEY),
      ]);

      if (sessionsData) setSessions(JSON.parse(sessionsData));
      if (evidenceData) setEvidenceCards(JSON.parse(evidenceData));
      if (hypothesesData) setHypothesisCards(JSON.parse(hypothesesData));
      if (roadmapsData) setRoadmapCards(JSON.parse(roadmapsData));
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const saveSessions = async (data: Session[]) => {
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(data));
    setSessions(data);
  };

  const saveEvidenceCards = async (data: EvidenceCard[]) => {
    await AsyncStorage.setItem(EVIDENCE_KEY, JSON.stringify(data));
    setEvidenceCards(data);
  };

  const saveHypothesisCards = async (data: HypothesisCard[]) => {
    await AsyncStorage.setItem(HYPOTHESES_KEY, JSON.stringify(data));
    setHypothesisCards(data);
  };

  const createSession = useCallback(async (problemStatement: string, mode: SessionMode): Promise<Session> => {
    const newSession: Session = {
      id: `session_${Date.now()}`,
      problemStatement,
      mode,
      status: "in_progress",
      currentStep: 0,
      completedSteps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stepData: {},
      evidenceCardIds: [],
      hypothesisCardIds: [],
    };

    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${getApiUrl()}/api/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newSession),
        });
        if (response.ok) {
          const savedSession = await response.json();
          setSessions([savedSession, ...sessions]);
          setCurrentSession(savedSession);
          processNextStep(savedSession.id);
          return savedSession;
        }
      } catch (error) {
        console.log("Failed to save to API, falling back to local storage");
      }
    }

    const updatedSessions = [newSession, ...sessions];
    await saveSessions(updatedSessions);
    setCurrentSession(newSession);

    processNextStep(newSession.id);

    return newSession;
  }, [sessions, isAuthenticated, token]);

  const getSession = useCallback((id: string): Session | undefined => {
    return sessions.find(s => s.id === id);
  }, [sessions]);

  const updateSession = useCallback(async (session: Session): Promise<void> => {
    const updatedSession = { ...session, updatedAt: new Date().toISOString() };
    
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${getApiUrl()}/api/sessions/${session.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedSession),
        });
        if (response.ok) {
          const savedSession = await response.json();
          setSessions(sessions.map(s => s.id === session.id ? savedSession : s));
          if (currentSession?.id === session.id) {
            setCurrentSession(savedSession);
          }
          return;
        }
      } catch (error) {
        console.log("Failed to update on API, falling back to local storage");
      }
    }
    
    const updatedSessions = sessions.map(s => s.id === session.id ? updatedSession : s);
    await saveSessions(updatedSessions);
    if (currentSession?.id === session.id) {
      setCurrentSession(updatedSession);
    }
  }, [sessions, currentSession, isAuthenticated, token]);

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    if (isAuthenticated && token) {
      try {
        const response = await fetch(`${getApiUrl()}/api/sessions/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setSessions(sessions.filter(s => s.id !== id));
          if (currentSession?.id === id) {
            setCurrentSession(null);
          }
          return;
        }
      } catch (error) {
        console.log("Failed to delete on API, falling back to local storage");
      }
    }
    
    const updatedSessions = sessions.filter(s => s.id !== id);
    await saveSessions(updatedSessions);
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  }, [sessions, currentSession, isAuthenticated, token]);

  const getEvidenceCard = useCallback((id: string): EvidenceCard | undefined => {
    return evidenceCards.find(c => c.id === id);
  }, [evidenceCards]);

  const getHypothesisCard = useCallback((id: string): HypothesisCard | undefined => {
    return hypothesisCards.find(c => c.id === id);
  }, [hypothesisCards]);

  const processNextStep = useCallback(async (sessionId: string): Promise<void> => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || isProcessing) return;

    setIsProcessing(true);

    try {
      const response = await apiRequest("POST", "/api/reasoning/process-step", {
        sessionId: session.id,
        currentStep: session.currentStep,
        problemStatement: session.problemStatement,
        mode: session.mode,
        previousStepData: session.stepData,
      });

      const result = await response.json();

      if (result.status === "STOP") {
        const updatedSession: Session = {
          ...session,
          status: "stopped",
          stopReason: result.reason,
          stepData: { ...session.stepData, [result.stepId]: result },
          updatedAt: new Date().toISOString(),
        };
        await updateSession(updatedSession);
      } else {
        const updatedSession: Session = {
          ...session,
          currentStep: session.currentStep + 1,
          completedSteps: [...session.completedSteps, session.currentStep],
          stepData: { ...session.stepData, [result.stepId]: result.data },
          updatedAt: new Date().toISOString(),
        };

        if (result.evidenceCards) {
          const newCards = result.evidenceCards as EvidenceCard[];
          await saveEvidenceCards([...evidenceCards, ...newCards]);
          updatedSession.evidenceCardIds = [...updatedSession.evidenceCardIds, ...newCards.map(c => c.id)];
        }

        if (result.hypothesisCards) {
          const newCards = result.hypothesisCards as HypothesisCard[];
          await saveHypothesisCards([...hypothesisCards, ...newCards]);
          updatedSession.hypothesisCardIds = [...updatedSession.hypothesisCardIds, ...newCards.map(c => c.id)];
        }

        const maxStep = session.mode === "evidence" ? 7 : 10;
        if (updatedSession.currentStep >= maxStep) {
          updatedSession.status = "completed";
        }

        await updateSession(updatedSession);
      }
    } catch (error) {
      console.error("Failed to process step:", error);
      const updatedSession: Session = {
        ...session,
        status: "stopped",
        stopReason: "Failed to process. Please try again.",
        updatedAt: new Date().toISOString(),
      };
      await updateSession(updatedSession);
    } finally {
      setIsProcessing(false);
    }
  }, [sessions, isProcessing, evidenceCards, hypothesisCards, updateSession]);

  const clearAllData = useCallback(async (): Promise<void> => {
    await Promise.all([
      AsyncStorage.removeItem(SESSIONS_KEY),
      AsyncStorage.removeItem(EVIDENCE_KEY),
      AsyncStorage.removeItem(HYPOTHESES_KEY),
      AsyncStorage.removeItem(ROADMAPS_KEY),
    ]);
    setSessions([]);
    setEvidenceCards([]);
    setHypothesisCards([]);
    setRoadmapCards([]);
    setCurrentSession(null);
  }, []);

  return (
    <StorageContext.Provider
      value={{
        sessions,
        evidenceCards,
        hypothesisCards,
        roadmapCards,
        currentSession,
        isProcessing,
        createSession,
        getSession,
        updateSession,
        deleteSession,
        getEvidenceCard,
        getHypothesisCard,
        processNextStep,
        clearAllData,
      }}
    >
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage(): StorageContextType {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}
