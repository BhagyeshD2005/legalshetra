
/**
 * @fileOverview This file contains shared Zod schemas and TypeScript types
 * used across both client and server components for AI features.
 */

import {z} from 'genkit';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;


const ClauseSchema = z.object({
  title: z.string().describe('The title or heading of the clause.'),
  content: z.string().describe('The full text of the clause.'),
  risk: z.enum(['low', 'medium', 'high']).describe('The assessed risk level of the clause.'),
  riskExplanation: z.string().describe('A brief explanation of why the clause was assigned a particular risk level.'),
});

const ComplianceNoteSchema = z.object({
    note: z.string().describe("A compliance or regulatory note relevant to the drafted document."),
    severity: z.enum(['info', 'warning', 'critical']).describe("The severity level of the compliance note."),
});


export const DraftLegalDocumentInputSchema = z.object({
  documentType: z.enum(['contract', 'petition', 'affidavit', 'notice']).describe('The type of legal document to be drafted.'),
  prompt: z.string().describe('The user\'s detailed prompt outlining the requirements for the document.'),
  tone: z.enum(['aggressive', 'neutral', 'conciliatory']).describe('The overall desired tone for the document draft.'),
  jurisdiction: z.enum(['delhi', 'mumbai', 'generic']).describe('The jurisdiction to source boilerplate text from.'),
});
export type DraftLegalDocumentInput = z.infer<typeof DraftLegalDocumentInputSchema>;

export const DraftLegalDocumentOutputSchema = z.object({
  title: z.string().describe("The main title of the generated document."),
  fullDraft: z.string().describe("The complete, finalized legal document as a single string, with proper formatting."),
  clauses: z.array(ClauseSchema).describe("A detailed, clause-by-clause breakdown of the document with risk analysis."),
  complianceNotes: z.array(ComplianceNoteSchema).describe("A list of compliance or regulatory notes."),
});
export type DraftLegalDocumentOutput = z.infer<typeof DraftLegalDocumentOutputSchema>;

const RecommendedStrategySchema = z.object({
  strategy: z.string().describe('A concise description of the suggested legal strategy.'),
  justification: z.string().describe('A brief explanation of why this strategy is recommended.'),
  predictedSuccessRate: z.number().describe('The estimated success rate of this strategy, as a percentage (e.g., 75).'),
});

const PastJudgmentSchema = z.object({
    caseName: z.string().describe('The name of the past case.'),
    outcome: z.string().describe('The outcome of the case relative to the current user (e.g., "Pro-Tenant", "Pro-Contract").'),
    similarity: z.enum(['High', 'Medium', 'Low']).describe('How similar the past case is to the current one.'),
});

const JudgeAnalysisSchema = z.object({
    biasSummary: z.string().describe('A summary of the judge\'s potential biases or patterns.'),
    pastJudgments: z.array(PastJudgmentSchema).describe('A list of relevant past judgments from this judge.'),
});


export const PredictCaseOutcomeInputSchema = z.object({
    caseType: z.enum(['civil', 'criminal', 'corporate', 'family']).describe('The broad category of the legal case.'),
    jurisdiction: z.enum(['delhi_hc', 'mumbai_hc', 'sci', 'generic']).describe('The court/jurisdiction where the case is filed.'),
    judgeName: z.enum(['justice_a_k_sarma', 'justice_r_m_lodha', 'other']).describe("The name of the presiding judge, if known."),
    caseSummary: z.string().describe('A detailed summary of the facts and context of the case.'),
});
export type PredictCaseOutcomeInput = z.infer<typeof PredictCaseOutcomeInputSchema>;

export const PredictCaseOutcomeOutputSchema = z.object({
    winProbability: z.number().describe('The estimated probability of winning the case, as a percentage (e.g., 65).'),
    predictionSummary: z.string().describe('A summary explaining the basis of the prediction.'),
    recommendedStrategies: z.array(RecommendedStrategySchema).describe('A list of suggested legal strategies.'),
    judgeAnalysis: JudgeAnalysisSchema.describe("An analysis of the judge's historical rulings and potential biases."),
});
export type PredictCaseOutcomeOutput = z.infer<typeof PredictCaseOutcomeOutputSchema>;


const AlternativeClauseSchema = z.object({
    content: z.string().describe('The full text of the suggested alternative clause.'),
    explanation: z.string().describe('An explanation of how this clause serves the user\'s interest and why it might be acceptable to the opponent.'),
});

const OpponentAnalysisSchema = z.object({
    likelyReaction: z.string().describe('An analysis of the opponent\'s likely reaction to the user\'s position.'),
    acceptanceProbability: z.number().describe('A numerical estimate (0-100) of the opponent accepting a reasonable offer.'),
});

export const NegotiationSupportInputSchema = z.object({
    currentClause: z.string().describe('The text of the clause currently under negotiation.'),
    myGoal: z.string().describe('A clear statement of the user\'s primary objective for this clause.'),
    opponentPosition: z.string().describe('A summary of the opponent\'s stated position or likely goal.'),
    opponentStyle: z.enum(['aggressive', 'collaborative', 'compromising', 'avoiding', 'default']).describe('The perceived negotiation style of the opponent.'),
    context: z.string().describe('Any additional context about the overall negotiation (e.g., deal stage, relationship with opponent).'),
});
export type NegotiationSupportInput = z.infer<typeof NegotiationSupportInputSchema>;


export const NegotiationSupportOutputSchema = z.object({
    alternativeClauses: z.array(AlternativeClauseSchema).describe('A list of suggested alternative clauses with explanations.'),
    opponentAnalysis: OpponentAnalysisSchema.describe('An analysis of the opponent\'s likely reaction and acceptance probability.'),
    batnaSummary: z.string().describe('A summary of the user\'s Best Alternative to a Negotiated Agreement (BATNA).'),
});
export type NegotiationSupportOutput = z.infer<typeof NegotiationSupportOutputSchema>;

// Schemas for Cross-Examination Prep Mode
const InconsistencySchema = z.object({
    statementText: z.string().describe('The specific part of the witness statement that is inconsistent.'),
    contradictingEvidence: z.string().describe('The evidence that contradicts the statement.'),
    explanation: z.string().describe('A brief explanation of the inconsistency.'),
});

const StrategicQuestionSchema = z.object({
    question: z.string().describe('The suggested question to ask the witness.'),
    purpose: z.string().describe('The strategic purpose behind asking this question.'),
});

const OpposingArgumentSchema = z.object({
    argument: z.string().describe('The likely argument or objection from the opposing counsel.'),
    response: z.string().describe('A suggested way to respond to or counter the argument.'),
});

const RolePlayDialogueSchema = z.object({
    speaker: z.string().describe('The speaker in the dialogue (e.g., "You", "Witness", "Opposing Counsel").'),
    line: z.string().describe('The dialogue line.'),
});

export const CrossExaminationPrepInputSchema = z.object({
    witnessStatement: z.string().describe("The full text of the witness's statement."),
    evidenceSummary: z.string().describe('A summary of the key evidence you possess.'),
    myRole: z.enum(['prosecution', 'defense']).describe('Your role in the case.'),
    simulationRole: z.enum(['witness', 'opposing_counsel']).describe('The role the AI should play in the simulation.'),
});
export type CrossExaminationPrepInput = z.infer<typeof CrossExaminationPrepInputSchema>;

export const CrossExaminationPrepOutputSchema = z.object({
    inconsistencies: z.array(InconsistencySchema).describe('A list of identified inconsistencies.'),
    strategicQuestions: z.array(StrategicQuestionSchema).describe('A list of strategic questions to ask.'),
    opposingArguments: z.array(OpposingArgumentSchema).describe('A list of potential arguments from the opposing side.'),
    rolePlaySimulation: z.array(RolePlayDialogueSchema).describe('A sample dialogue simulation.'),
});
export type CrossExaminationPrepOutput = z.infer<typeof CrossExaminationPrepOutputSchema>;

// Schemas for Orchestrate AI Mode
export const OrchestrationPlanStepSchema = z.object({
    step: z.number().describe('The step number in the sequence.'),
    agent: z.enum(['research', 'draft', 'review', 'predict', 'negotiate', 'cross-examine']).describe('The name of the agent to use for this step.'),
    prompt: z.string().describe('The detailed input/prompt for the agent.'),
    summary: z.string().describe('A short, user-friendly description of what this step will accomplish.'),
    status: z.enum(['pending', 'active', 'completed', 'error']).describe('The current status of the step.'),
    result: z.any().optional().describe('The result from the agent after execution.'),
});
export type OrchestrationPlanStep = z.infer<typeof OrchestrationPlanStepSchema>;

export const OrchestrateWorkflowInputSchema = z.object({
  objective: z.string().describe('The user\'s high-level objective for the entire workflow.'),
});
export type OrchestrateWorkflowInput = z.infer<typeof OrchestrateWorkflowInputSchema>;

export const OrchestrateWorkflowOutputSchema = z.object({
    plan: z.array(OrchestrationPlanStepSchema).describe('The step-by-step plan generated by the orchestrator.'),
    finalOutput: z.string().describe('A final, synthesized output combining the results of all steps.'),
});
export type OrchestrateWorkflowOutput = z.infer<typeof OrchestrateWorkflowOutputSchema>;


const ExportContentSchema = z.object({
    csv: z.string().describe('The full timeline table formatted as a CSV string, including a header row.'),
    pdf: z.string().describe('The timeline and notes formatted as a markdown string suitable for PDF conversion.'),
    text: z.string().describe('The timeline and notes formatted as a plain text string.'),
});

// Schemas for Litigation Timeline Mode
export const LitigationTimelineInputSchema = z.object({
    jurisdiction: z.string().describe('The court or jurisdiction (e.g., "Delhi High Court", "US Federal Court").'),
    caseType: z.string().describe('The type of case (e.g., "Civil Commercial Suit", "Criminal Appeal").'),
    startDate: z.string().describe('The filing date or incident date for the case (YYYY-MM-DD).'),
    knownDates: z.string().optional().describe('A comma-separated list of known, fixed dates for events (e.g., "First Hearing: 2025-09-10").'),
});
export type LitigationTimelineInput = z.infer<typeof LitigationTimelineInputSchema>;

const TimelineEntrySchema = z.object({
    stepNumber: z.number().describe('The sequential number of the step.'),
    task: z.string().describe('The procedural task or filing required.'),
    deadline: z.string().describe('The calculated deadline for the task (YYYY-MM-DD).'),
    notes: z.string().describe('Any dependencies or important notes related to the task.'),
});

export const LitigationTimelineOutputSchema = z.object({
    dueToday: z.array(z.string()).describe('A list of tasks whose deadline is today. If empty, nothing is due.'),
    timeline: z.array(TimelineEntrySchema).describe('The generated procedural timeline.'),
    assumptions: z.array(z.string()).describe('A list of assumptions made during the timeline generation.'),
    exportContent: ExportContentSchema.describe('The timeline data pre-formatted for various export options.'),
});
export type LitigationTimelineOutput = z.infer<typeof LitigationTimelineOutputSchema>;

// Schemas for Evidence Analysis Mode
const EvidenceFileSchema = z.object({
    fileName: z.string(),
    fileType: z.string(),
    dataUri: z.string().describe("The file content as a data URI."),
});

export const AnalyzeEvidenceInputSchema = z.object({
    caseContext: z.string().describe("A brief summary of the case context."),
    evidenceFiles: z.array(EvidenceFileSchema).describe("An array of evidence files to be analyzed."),
});
export type AnalyzeEvidenceInput = z.infer<typeof AnalyzeEvidenceInputSchema>;

const EvidenceSummarySchema = z.object({
    fileName: z.string().describe("The name of the analyzed file."),
    fileType: z.string().describe("The detected type of file (e.g., audio, image, pdf)."),
    quality: z.string().describe("A brief assessment of the evidence quality (e.g., 'clear audio', 'blurry image')."),
    summary: z.string().describe("A concise summary of the evidence content."),
});

const KeyStatementSchema = z.object({
    timestamp: z.string().describe("The timestamp of the statement in HH:MM:SS format."),
    statement: z.string().describe("The transcribed key statement."),
    relevance: z.string().describe("Why this statement is considered legally relevant."),
});

const DetailedAnalysisSchema = z.object({
    fileName: z.string(),
    analysisType: z.enum(['transcript', 'ocr']),
    documentType: z.string().optional().describe("The classified type of document (e.g., 'Affidavit', 'Contract')."),
    transcript: z.string().optional().describe("The full verbatim transcript of the audio/video file."),
    keyStatements: z.array(KeyStatementSchema).optional().describe("A list of legally significant statements with timestamps."),
    ocrText: z.string().optional().describe("The full text extracted from an image or document."),
});

const ContradictionSchema = z.object({
    reference: z.string().describe("The timestamp (HH:MM:SS) or page/line number of the first statement."),
    statement: z.string().describe("The original statement from the first piece of evidence."),
    contradictingSource: z.string().describe("The file name of the contradicting evidence."),
    contradictingStatement: z.string().describe("The statement from the second piece of evidence that causes the contradiction."),
    notes: z.string().describe("A brief explanation of the discrepancy."),
});

export const AnalyzeEvidenceOutputSchema = z.object({
    evidenceSummary: z.array(EvidenceSummarySchema).describe("A high-level summary of each piece of evidence."),
    detailedAnalysis: z.array(DetailedAnalysisSchema).describe("The detailed transcripts and OCR outputs."),
    contradictionReport: z.array(ContradictionSchema).describe("A report of all identified contradictions between evidence sources."),
    exportContent: ExportContentSchema.describe('The analysis data pre-formatted for various export options.'),
});
export type AnalyzeEvidenceOutput = z.infer<typeof AnalyzeEvidenceOutputSchema>;

// Schemas for Judgment Analysis
export const AnalyzeJudgmentInputSchema = z.object({
  judgmentText: z
    .string()
    .describe(
      'The full text of the legal judgment to be analyzed.'
    ),
});
export type AnalyzeJudgmentInput = z.infer<typeof AnalyzeJudgmentInputSchema>;

const CitedPrecedentSchema = z.object({
  caseName: z.string().describe('The name of the cited case.'),
  treatment: z
    .string()
    .describe(
      'How the precedent was treated (e.g., followed, distinguished, overruled).'
    ),
});

export const AnalyzeJudgmentOutputSchema = z.object({
  facts: z
    .string()
    .describe('A neutral and concise summary of the facts of the case.'),
  issues: z
    .array(z.string())
    .describe('A list of the key legal or factual issues framed by the court.'),
  petitionerArguments: z
    .string()
    .describe("A summary of the petitioner's main arguments."),
  respondentArguments: z
    .string()
    .describe("A summary of the respondent's main arguments."),
  decision: z.string().describe('The final decision or holding of the court.'),
  ratioDecidendi: z
    .string()
    .describe('The core legal reasoning for the decision.'),
  obiterDicta: z
    .string()
    .describe('Non-binding statements or observations made by the court.'),
  citedPrecedents: z
    .array(CitedPrecedentSchema)
    .describe('A list of key precedents cited in the judgment.'),
  impactAnalysis: z
    .string()
    .describe('A practical analysis of the judgment\'s impact.'),
});
export type AnalyzeJudgmentOutput = z.infer<typeof AnalyzeJudgmentOutputSchema>;

// Schemas for Reasoning Mode
export const ReasonAboutScenarioInputSchema = z.object({
  scenario: z.string().describe('The factual matrix of the legal case or scenario.'),
  question: z.string().describe('The specific legal question to be answered based on the scenario.'),
});
export type ReasonAboutScenarioInput = z.infer<typeof ReasonAboutScenarioInputSchema>;

const CitedCaseSchema = z.object({
    title: z.string().describe('The title of the case or statute.'),
    url: z.string().describe('The URL to the document.'),
    snippet: z.string().describe('A brief snippet of the document highlighting its relevance.'),
});

export const ReasonAboutScenarioOutputSchema = z.object({
  factAnalysis: z.string().describe('An analysis of the relevant facts from the scenario.'),
  legalPrinciples: z.string().describe('A summary of the applicable legal principles, acts, or laws, based on research.'),
  application: z.string().describe('The application of the legal principles to the facts in a logical, step-by-step sequence.'),
  counterArguments: z.string().describe('Potential counter-arguments or alternative interpretations.'),
  conclusion: z.string().describe('A clear, well-supported conclusion that directly answers the user\'s question.'),
  citedCases: z.array(CitedCaseSchema).describe('A list of cases or statutes cited in the analysis.'),
});
export type ReasonAboutScenarioOutput = z.infer<typeof ReasonAboutScenarioOutputSchema>;
