export type SourceType = "paper" | "clinical_trial" | "meta_analysis" | "dataset" | "guideline";
export type ModelType = "in_vitro" | "animal" | "human";
export type Direction = "increase" | "decrease" | "no_effect";
export type ValidityLevel = "high" | "medium" | "low";
export type SessionStatus = "in_progress" | "completed" | "stopped";
export type SessionMode = "evidence" | "roadmap";
export type DecisionType = "proceed" | "stop" | "pivot";

export interface EvidenceCard {
  id: string;
  source: {
    type: SourceType;
    citation: string;
    link?: string;
  };
  context: {
    model: ModelType;
    species?: string;
    population?: string;
    condition: string;
  };
  intervention: {
    agent: string;
    dose?: string;
    route?: string;
    duration?: string;
  };
  outcome: {
    variable: string;
    direction: Direction;
    magnitude?: string;
  };
  validityProfile: {
    internalValidity: ValidityLevel;
    externalValidity: ValidityLevel;
    mechanisticValidity: ValidityLevel;
    robustness: ValidityLevel;
    criticalLimitations: string[];
  };
}

export interface HypothesisCard {
  id: string;
  statement: string;
  mechanism: {
    description: string;
    assumptions: string[];
  };
  scope: {
    condition: string;
    population?: string;
  };
  predictions: {
    observable: string;
    expectedDirection: Direction;
  }[];
  supportingEvidence: string[];
  counterEvidence: string[];
  falsificationCriteria: {
    description: string;
    decisiveOutcome: string;
  }[];
}

export interface RoadmapCard {
  id: string;
  objective: string;
  linkedHypotheses: string[];
  phases: {
    phaseId: string;
    goal: string;
    method: string;
    successCriteria: string;
    failureCriteria: string;
    decision: DecisionType;
  }[];
  globalRisks: {
    description: string;
    mitigation: string;
  }[];
  exitConditions: {
    description: string;
  }[];
}

export interface ProblemDefinition {
  condition: string;
  unmetNeed: string;
  observableGap: string;
  constraints: {
    type: "biological" | "physical" | "clinical";
    description: string;
  }[];
}

export interface EvidenceMap {
  consistentFindings: string[];
  contradictions: {
    a: string;
    b: string;
    note: string;
  }[];
  gaps: string[];
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: "step0", name: "Input", description: "Research question or problem statement" },
  { id: "step1", name: "Problem Definition", description: "Formalize the scientific problem with observable gaps" },
  { id: "step2", name: "Evidence Mapping", description: "Retrieve and structure evidence from literature" },
  { id: "step3", name: "Validity Assessment", description: "Evaluate evidence quality across 4 dimensions" },
  { id: "step4", name: "Evidence Map", description: "Identify consistencies, contradictions, and gaps" },
  { id: "step5", name: "Gap List", description: "Formalize numbered gaps in knowledge" },
  { id: "step6", name: "Hypothesis Generation", description: "Generate 3-5 falsifiable hypotheses" },
  { id: "step7", name: "Critic & Falsification", description: "Attack hypotheses and add counter-evidence" },
  { id: "step8", name: "Decision Gating", description: "Select testable hypotheses by plausibility" },
  { id: "step9", name: "R&D Roadmap", description: "Create gated research development plan" },
];

export interface Session {
  id: string;
  problemStatement: string;
  mode: SessionMode;
  status: SessionStatus;
  currentStep: number;
  completedSteps: number[];
  stopReason?: string;
  createdAt: string;
  updatedAt: string;
  stepData: {
    [stepId: string]: any;
  };
  evidenceCardIds: string[];
  hypothesisCardIds: string[];
  roadmapCardId?: string;
}
