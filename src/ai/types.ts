
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
  tone: z.enum(['aggressive', 'neutral', 'conciliatory']).describe('The tone used for this specific clause.'),
  risk: z.enum(['low', 'medium', 'high']).describe('The assessed risk level of the clause.'),
  riskExplanation: z.string().describe('A brief explanation of why the clause was assigned a particular risk level.'),
});

export const DraftLegalDocumentInputSchema = z.object({
  documentType: z.enum(['contract', 'petition', 'affidavit', 'notice']).describe('The type of legal document to be drafted.'),
  prompt: z.string().describe('The user\'s detailed prompt outlining the requirements for the document.'),
  tone: z.enum(['aggressive', 'neutral', 'conciliatory']).describe('The overall desired tone for the document draft.'),
  jurisdiction: z.enum(['delhi', 'mumbai', 'generic']).describe('The jurisdiction to source boilerplate text from.'),
});
export type DraftLegalDocumentInput = z.infer<typeof DraftLegalDocumentInputSchema>;

export const DraftLegalDocumentOutputSchema = z.object({
  title: z.string().describe("The title of the generated legal document."),
  fullDraft: z.string().describe("The complete, finalized legal document as a single string."),
  clauses: z.array(ClauseSchema).describe('An array of individual clauses with their analysis.'),
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

