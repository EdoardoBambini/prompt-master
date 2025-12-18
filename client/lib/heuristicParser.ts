import { useMemo } from "react";

export type EvidenceStrength = "LOW" | "MEDIUM" | "HIGH";
export type ConfidenceLevel = "LOW" | "MEDIUM" | "HIGH";

export interface ExecutiveSummaryData {
  coreTakeaways: {
    canClaim: string[];
    cannotClaim: string[];
  };
  evidenceStrength: EvidenceStrength;
  evidenceJustification: string;
  limitations: string[];
  nextActions: string[];
}

export interface DecisionSummaryData {
  bestCurrentAnswer: string;
  unknowns: string[];
  selectedHypothesis: string | null;
  rejectedHypotheses: { hypothesis: string; reason: string }[];
  confidenceLevel: ConfidenceLevel;
  nextDecisions: string[];
}

export interface ValidityScores {
  internalValidity: { score: number; explanation: string };
  externalValidity: { score: number; explanation: string };
  measurementValidity: { score: number; explanation: string };
  statisticalRobustness: { score: number; explanation: string };
}

export interface PhaseFeasibility {
  phase: string;
  duration: string;
  costRange: string;
  failureRisks: string[];
  goNoGoDecisions: string[];
  regulatoryBottlenecks: string[];
}

const SKEPTICAL_KEYWORDS = [
  "however", "limitation", "caveat", "unclear", "unknown", "insufficient",
  "conflict", "contradict", "bias", "confound", "risk", "fail", "challenge",
  "uncertain", "variab", "hetero", "inconsist"
];

const POSITIVE_KEYWORDS = [
  "consistent", "robust", "replicated", "significant", "strong", "clear",
  "demonstrated", "established", "confirmed", "validated"
];

function countKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((count, kw) => count + (lower.includes(kw) ? 1 : 0), 0);
}

function extractBullets(text: string, maxBullets: number = 5): string[] {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
  const skepticalSentences = sentences.filter(s => 
    SKEPTICAL_KEYWORDS.some(kw => s.toLowerCase().includes(kw))
  );
  return skepticalSentences.slice(0, maxBullets).map(s => s.trim());
}

function extractPositiveClaims(text: string, max: number = 3): string[] {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
  const positive = sentences.filter(s => 
    POSITIVE_KEYWORDS.some(kw => s.toLowerCase().includes(kw)) &&
    !SKEPTICAL_KEYWORDS.some(kw => s.toLowerCase().includes(kw))
  );
  return positive.slice(0, max).map(s => s.trim());
}

function extractNegativeClaims(text: string, max: number = 3): string[] {
  const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 15);
  const negative = sentences.filter(s => 
    SKEPTICAL_KEYWORDS.some(kw => s.toLowerCase().includes(kw))
  );
  return negative.slice(0, max).map(s => s.trim());
}

export function parseExecutiveSummary(stepData: any): ExecutiveSummaryData {
  const textContent = JSON.stringify(stepData || {});
  
  const skepticalCount = countKeywords(textContent, SKEPTICAL_KEYWORDS);
  const positiveCount = countKeywords(textContent, POSITIVE_KEYWORDS);
  
  let evidenceStrength: EvidenceStrength = "LOW";
  if (positiveCount > skepticalCount * 2) {
    evidenceStrength = "HIGH";
  } else if (positiveCount > skepticalCount) {
    evidenceStrength = "MEDIUM";
  }
  
  const canClaim = extractPositiveClaims(textContent, 3);
  const cannotClaim = extractNegativeClaims(textContent, 3);
  
  if (canClaim.length === 0) {
    canClaim.push("Preliminary observations require further validation");
  }
  if (cannotClaim.length === 0) {
    cannotClaim.push("Definitive conclusions pending additional evidence");
  }
  
  const limitations = extractBullets(textContent, 5);
  if (limitations.length === 0) {
    limitations.push("Limited sample size and generalizability");
    limitations.push("Potential confounding variables not controlled");
  }
  
  const nextActions: string[] = [
    "Validate primary findings with independent dataset",
    "Address identified limitations in study design",
    "Quantify uncertainty ranges for key estimates",
  ];
  
  return {
    coreTakeaways: { canClaim, cannotClaim },
    evidenceStrength,
    evidenceJustification: evidenceStrength === "HIGH" 
      ? "Multiple consistent findings with minimal contradictions"
      : evidenceStrength === "MEDIUM"
      ? "Some supporting evidence but notable gaps remain"
      : "Insufficient evidence for confident conclusions",
    limitations,
    nextActions,
  };
}

export function parseDecisionSummary(session: any): DecisionSummaryData {
  const stepData = session?.stepData || {};
  const allText = JSON.stringify(stepData);
  
  const skepticalCount = countKeywords(allText, SKEPTICAL_KEYWORDS);
  const positiveCount = countKeywords(allText, POSITIVE_KEYWORDS);
  
  let confidenceLevel: ConfidenceLevel = "LOW";
  if (positiveCount > skepticalCount * 3 && session?.completedSteps?.length > 5) {
    confidenceLevel = "HIGH";
  } else if (positiveCount > skepticalCount * 1.5) {
    confidenceLevel = "MEDIUM";
  }
  
  const problemDef = stepData.step1?.problemDefinition;
  const bestCurrentAnswer = problemDef 
    ? `Investigating ${problemDef.condition}: ${problemDef.unmetNeed}`
    : "Preliminary investigation in progress";
  
  const unknowns: string[] = [];
  if (stepData.step5?.gaps) {
    unknowns.push(...stepData.step5.gaps.slice(0, 3));
  }
  if (unknowns.length === 0) {
    unknowns.push("Mechanism of action not fully characterized");
    unknowns.push("Optimal dosing parameters undefined");
    unknowns.push("Long-term safety profile unknown");
  }
  
  let selectedHypothesis: string | null = null;
  const rejectedHypotheses: { hypothesis: string; reason: string }[] = [];
  
  if (stepData.step8?.selectedHypothesis) {
    selectedHypothesis = stepData.step8.selectedHypothesis;
  }
  if (stepData.step7?.critiques) {
    rejectedHypotheses.push(
      ...stepData.step7.critiques.slice(0, 2).map((c: any) => ({
        hypothesis: c.hypothesis || "Alternative hypothesis",
        reason: c.reason || "Failed falsification criteria"
      }))
    );
  }
  
  const nextDecisions: string[] = [
    "Determine if current evidence justifies proceeding to next phase",
    "Identify critical experiments to address key unknowns",
    "Assess resource requirements vs. probability of success",
  ];
  
  return {
    bestCurrentAnswer,
    unknowns,
    selectedHypothesis,
    rejectedHypotheses,
    confidenceLevel,
    nextDecisions,
  };
}

export function parseValidityScores(stepData: any): ValidityScores {
  const textContent = JSON.stringify(stepData || {});
  const biasWords = ["bias", "confound", "control"];
  const generalWords = ["population", "sample", "generaliz"];
  const measureWords = ["measur", "valid", "reliab", "accuracy"];
  const statWords = ["statistic", "power", "significan", "p-value", "sample size"];
  
  const biasCount = countKeywords(textContent, biasWords);
  const generalCount = countKeywords(textContent, generalWords);
  const measureCount = countKeywords(textContent, measureWords);
  const statCount = countKeywords(textContent, statWords);
  
  const baseScore = 50;
  const positiveBoost = countKeywords(textContent, POSITIVE_KEYWORDS) * 5;
  const skepticalPenalty = countKeywords(textContent, SKEPTICAL_KEYWORDS) * 8;
  
  const clamp = (val: number) => Math.max(10, Math.min(90, val));
  
  return {
    internalValidity: {
      score: clamp(baseScore + positiveBoost - skepticalPenalty - biasCount * 10),
      explanation: biasCount > 2 
        ? "Multiple potential sources of bias identified"
        : biasCount > 0
        ? "Some bias concerns noted"
        : "Limited bias assessment available"
    },
    externalValidity: {
      score: clamp(baseScore + positiveBoost - skepticalPenalty - generalCount * 8),
      explanation: generalCount > 2
        ? "Generalizability concerns across populations"
        : generalCount > 0
        ? "Population specificity may limit applicability"
        : "External validity not explicitly addressed"
    },
    measurementValidity: {
      score: clamp(baseScore + positiveBoost - skepticalPenalty + measureCount * 5),
      explanation: measureCount > 2
        ? "Measurement methods discussed with some validation"
        : measureCount > 0
        ? "Limited measurement validation reported"
        : "Measurement validity not assessed"
    },
    statisticalRobustness: {
      score: clamp(baseScore + positiveBoost - skepticalPenalty + statCount * 5),
      explanation: statCount > 2
        ? "Statistical methods addressed with varying rigor"
        : statCount > 0
        ? "Basic statistical considerations present"
        : "Statistical robustness not evaluated"
    },
  };
}

export function parsePhaseFeasibility(roadmapData: any): PhaseFeasibility[] {
  const phases: PhaseFeasibility[] = [
    {
      phase: "Preclinical",
      duration: "12-24 months",
      costRange: "$2M - $10M",
      failureRisks: [
        "Target not druggable (30-40% failure rate)",
        "Toxicity in animal models",
        "Lack of efficacy signal",
        "Manufacturing challenges"
      ],
      goNoGoDecisions: [
        "Demonstrate target engagement in relevant model",
        "Acceptable safety margin (>10x therapeutic dose)",
        "Reproducible efficacy across 2+ models"
      ],
      regulatoryBottlenecks: [
        "IND-enabling studies requirements",
        "GLP toxicology package",
        "CMC documentation"
      ]
    },
    {
      phase: "Phase I",
      duration: "12-18 months",
      costRange: "$5M - $15M",
      failureRisks: [
        "Dose-limiting toxicity (10-15% failure)",
        "Poor PK/bioavailability",
        "Unexpected safety signals",
        "Enrollment challenges"
      ],
      goNoGoDecisions: [
        "MTD established with acceptable safety",
        "PK supports target exposure",
        "Preliminary biomarker activity"
      ],
      regulatoryBottlenecks: [
        "IND approval",
        "IRB/ethics approval",
        "Site qualification"
      ]
    },
    {
      phase: "Phase II",
      duration: "24-36 months",
      costRange: "$20M - $50M",
      failureRisks: [
        "Lack of efficacy (50-60% failure rate)",
        "Inadequate therapeutic window",
        "Patient selection challenges",
        "Competitive landscape changes"
      ],
      goNoGoDecisions: [
        "Statistically significant efficacy signal",
        "Acceptable benefit-risk profile",
        "Clear dose-response relationship"
      ],
      regulatoryBottlenecks: [
        "End-of-Phase-2 meeting",
        "Endpoint agreement",
        "Biomarker qualification"
      ]
    },
    {
      phase: "Phase III",
      duration: "36-60 months",
      costRange: "$100M - $500M+",
      failureRisks: [
        "Failed primary endpoint (40-50% failure)",
        "Safety signal in larger population",
        "Operational execution failures",
        "Regulatory rejection"
      ],
      goNoGoDecisions: [
        "Met primary efficacy endpoint",
        "Positive benefit-risk assessment",
        "Sufficient safety database"
      ],
      regulatoryBottlenecks: [
        "NDA/BLA submission",
        "Advisory committee",
        "Manufacturing inspection"
      ]
    },
  ];
  
  return phases;
}

export function useHeuristicMemo<T>(
  parser: (data: any) => T,
  data: any
): T {
  return useMemo(() => parser(data), [JSON.stringify(data)]);
}
