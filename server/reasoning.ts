import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

const SYSTEM_PROMPT = `You are a Scientific Reasoning Engine. Your role is to transform research questions into structured, traceable scientific analysis.

CRITICAL RULES:
1. You are NOT a chatbot. You produce structured data following exact schemas.
2. You NEVER provide medical advice, dosages, treatment protocols, or synthesis instructions.
3. Every claim must be traceable to evidence or clearly marked as a gap.
4. Prefer "I don't know yet" (structured) over inventing information.

DEFINITIONS:
- Problem: Observable gap between current state and desired outcome with measurable endpoints
- Hypothesis: Falsifiable proposition with mechanism, assumptions, and testable predictions  
- Evidence: Specific result from research, contextualized by model/population/dose/time
- Validity: Assessment of evidence weight across internal, external, mechanistic, and robustness dimensions

OUTPUT: Always respond with valid JSON matching the requested step schema.`;

interface ProcessStepParams {
  sessionId: string;
  currentStep: number;
  problemStatement: string;
  mode: "evidence" | "roadmap";
  previousStepData: Record<string, any>;
}

interface StepResult {
  status: "SUCCESS" | "STOP";
  stepId: string;
  data?: any;
  evidenceCards?: any[];
  hypothesisCards?: any[];
  reason?: string;
  whatIsNeededNext?: string[];
  suggestedQueries?: string[];
}

const STEP_PROMPTS: Record<number, (params: ProcessStepParams) => string> = {
  0: (params) => `Analyze this research question and confirm it's suitable for scientific analysis:

"${params.problemStatement}"

Check for:
1. Is this a valid scientific/research question (not personal medical advice)?
2. Can it be analyzed with available scientific literature?
3. Does it have observable/measurable aspects?

If valid, respond with:
{
  "valid": true,
  "summary": "Brief summary of what will be analyzed"
}

If invalid (requests medical advice, dosages, synthesis, or personal treatment), respond with:
{
  "valid": false,
  "reason": "Explanation why this cannot be processed",
  "suggestion": "How to rephrase as a valid research question"
}`,

  1: (params) => `Create a formal Problem Definition for:

"${params.problemStatement}"

Respond with this exact JSON structure:
{
  "problemDefinition": {
    "condition": "The medical/scientific condition or phenomenon",
    "unmetNeed": "What current solutions fail to address",
    "observableGap": "Specific measurable gap in knowledge or treatment",
    "constraints": [
      {"type": "biological|physical|clinical", "description": "Specific constraint"}
    ]
  }
}`,

  2: (params) => `Based on the problem definition, generate 3-5 Evidence Cards representing key findings from scientific literature.

Problem: "${params.problemStatement}"
${params.previousStepData.step1 ? `Context: ${JSON.stringify(params.previousStepData.step1.problemDefinition)}` : ""}

Create evidence cards following this schema:
{
  "evidenceCards": [
    {
      "id": "EV001",
      "source": {
        "type": "paper|clinical_trial|meta_analysis|dataset|guideline",
        "citation": "Author et al., Journal (Year)",
        "link": "https://doi.org/..."
      },
      "context": {
        "model": "in_vitro|animal|human",
        "species": "if applicable",
        "population": "patient population if human",
        "condition": "specific condition studied"
      },
      "intervention": {
        "agent": "drug/therapy/intervention name",
        "dose": "if applicable",
        "route": "if applicable",
        "duration": "if applicable"
      },
      "outcome": {
        "variable": "what was measured",
        "direction": "increase|decrease|no_effect",
        "magnitude": "effect size if available"
      },
      "validityProfile": {
        "internalValidity": "high|medium|low",
        "externalValidity": "high|medium|low",
        "mechanisticValidity": "high|medium|low",
        "robustness": "high|medium|low",
        "criticalLimitations": ["limitation 1", "limitation 2"]
      }
    }
  ],
  "summary": "Brief overview of evidence found",
  "evidenceCount": 3
}

Generate realistic evidence based on known scientific literature for this condition.`,

  3: (params) => `Assess the validity of the evidence gathered.

Evidence: ${JSON.stringify(params.previousStepData.step2?.evidenceCards || [])}

Provide a validity assessment:
{
  "validityAssessment": {
    "overallQuality": "high|medium|low",
    "strongestEvidence": ["EV001 - reason"],
    "weakestEvidence": ["EV002 - reason"],
    "majorConcerns": ["concern 1"],
    "confidenceLevel": "high|medium|low"
  },
  "summary": "Overall assessment of evidence quality"
}`,

  4: (params) => `Create an Evidence Map showing relationships between findings.

Evidence: ${JSON.stringify(params.previousStepData.step2?.evidenceCards || [])}

Generate:
{
  "evidenceMap": {
    "consistentFindings": ["EV001", "EV002"],
    "contradictions": [
      {"a": "EV001", "b": "EV003", "note": "Explanation of contradiction"}
    ],
    "gaps": ["Gap 1 description", "Gap 2 description"]
  },
  "summary": "Key patterns and conflicts in the evidence"
}`,

  5: (params) => `Generate a numbered Gap List from the evidence map.

Evidence Map: ${JSON.stringify(params.previousStepData.step4?.evidenceMap || {})}

Format:
{
  "gaps": [
    "GAP1: Description of knowledge gap",
    "GAP2: Description of another gap"
  ],
  "prioritizedGaps": ["GAP1", "GAP2"],
  "summary": "Critical gaps that need addressing"
}`,

  6: (params) => `Generate 2-3 Hypothesis Cards based on the identified gaps.

Gaps: ${JSON.stringify(params.previousStepData.step5?.gaps || [])}
Problem: "${params.problemStatement}"

Create hypotheses:
{
  "hypothesisCards": [
    {
      "id": "HYP001",
      "statement": "Clear, testable hypothesis statement",
      "mechanism": {
        "description": "Proposed mechanism of action",
        "assumptions": ["assumption 1", "assumption 2"]
      },
      "scope": {
        "condition": "Target condition",
        "population": "Target population"
      },
      "predictions": [
        {"observable": "What would be observed if true", "expectedDirection": "increase|decrease|no_change"}
      ],
      "supportingEvidence": ["EV001"],
      "counterEvidence": [],
      "falsificationCriteria": [
        {"description": "What would prove this wrong", "decisiveOutcome": "Specific result that disproves"}
      ]
    }
  ],
  "hypothesesCount": 2,
  "summary": "Overview of generated hypotheses"
}`,

  7: (params) => `Critique the hypotheses and add counter-evidence.

Hypotheses: ${JSON.stringify(params.previousStepData.step6?.hypothesisCards || [])}

For each hypothesis, identify weaknesses:
{
  "critique": [
    {
      "hypothesisId": "HYP001",
      "strengths": ["strength 1"],
      "weaknesses": ["weakness 1"],
      "alternativeExplanations": ["alternative 1"],
      "falsificationRisk": "high|medium|low"
    }
  ],
  "eliminatedHypotheses": [],
  "remainingHypotheses": ["HYP001", "HYP002"],
  "summary": "Critical analysis of hypotheses"
}`,

  8: (params) => `Select the most promising hypotheses for testing.

Critique: ${JSON.stringify(params.previousStepData.step7 || {})}

Evaluate and rank:
{
  "ranking": [
    {
      "hypothesisId": "HYP001",
      "plausibility": "high|medium|low",
      "testability": "high|medium|low",
      "risk": "high|medium|low",
      "priority": 1
    }
  ],
  "selectedForRoadmap": ["HYP001"],
  "rationale": "Why these were selected",
  "summary": "Decision gating results"
}`,

  9: (params) => `Create an R&D Roadmap for the selected hypotheses.

Selected: ${JSON.stringify(params.previousStepData.step8?.selectedForRoadmap || [])}

Generate:
{
  "roadmapCard": {
    "id": "RM001",
    "objective": "Overall research objective",
    "linkedHypotheses": ["HYP001"],
    "phases": [
      {
        "phaseId": "P1",
        "goal": "Phase goal",
        "method": "Proposed methodology",
        "successCriteria": "What defines success",
        "failureCriteria": "What defines failure",
        "decision": "proceed|stop|pivot"
      }
    ],
    "globalRisks": [
      {"description": "Risk description", "mitigation": "How to mitigate"}
    ],
    "exitConditions": [
      {"description": "When to stop the research"}
    ]
  },
  "summary": "R&D roadmap overview"
}`
};

export async function processReasoningStep(params: ProcessStepParams): Promise<StepResult> {
  const stepId = `step${params.currentStep}`;
  
  if (!STEP_PROMPTS[params.currentStep]) {
    return {
      status: "STOP",
      stepId,
      reason: "InvalidStep",
      whatIsNeededNext: ["Invalid step number"],
      suggestedQueries: [],
    };
  }

  const prompt = STEP_PROMPTS[params.currentStep](params);

  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    let jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in response");
    }

    const data = JSON.parse(jsonMatch[0]);

    if (params.currentStep === 0 && !data.valid) {
      return {
        status: "STOP",
        stepId,
        reason: "SafetyConstraint",
        data: { summary: data.suggestion },
        whatIsNeededNext: [data.suggestion],
        suggestedQueries: [],
      };
    }

    const result: StepResult = {
      status: "SUCCESS",
      stepId,
      data,
    };

    if (data.evidenceCards) {
      result.evidenceCards = data.evidenceCards.map((card: any, i: number) => ({
        ...card,
        id: `${params.sessionId}_EV${String(i + 1).padStart(3, "0")}`,
      }));
    }

    if (data.hypothesisCards) {
      result.hypothesisCards = data.hypothesisCards.map((card: any, i: number) => ({
        ...card,
        id: `${params.sessionId}_HYP${String(i + 1).padStart(3, "0")}`,
      }));
    }

    return result;
  } catch (error) {
    console.error("Anthropic API error:", error);
    return {
      status: "STOP",
      stepId,
      reason: "MissingEvidence",
      whatIsNeededNext: ["Failed to process this step. Please try again."],
      suggestedQueries: [],
    };
  }
}
