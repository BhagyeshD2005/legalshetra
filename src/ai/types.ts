
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
