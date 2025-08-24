
'use server';

/**
 * @fileOverview This file contains a Genkit flow that analyzes a legal document for anomalies, risks, and key dates.
 *
 * - analyzeDocument - A function that reviews the provided legal document.
 * - AnalyzeDocumentInput - The input type for the analyzeDocument function.
 * - AnalyzeDocumentOutput - The return type for the analyzeDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeDocumentInputSchema = z.object({
  documentText: z.string().optional().describe('The full text content of the legal document.'),
  documentDataUri: z.string().optional().describe("A document file (e.g., PDF) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AnalyzeDocumentInput = z.infer<typeof AnalyzeDocumentInputSchema>;


const AnomalySchema = z.object({
    clause: z.string().describe('The specific clause or section where the anomaly is found. If a clause is missing, describe what is missing.'),
    description: z.string().describe('A plain-English explanation of the anomaly, risk, or unusual term.'),
    severity: z.enum(['high', 'medium', 'low']).describe('The potential risk level associated with the anomaly.'),
    recommendation: z.string().describe('A suggested action or edit to mitigate the risk.'),
    improvedClause: z.string().optional().describe('The revised, improved version of the clause that addresses the identified risk.'),
});

const KeyDateSchema = z.object({
    date: z.string().describe('The date identified in the document (e.g., "2024-12-31").'),
    description: z.string().describe('What this date signifies (e.g., "Contract Expiration Date", "Notice Period Start").'),
});

const AnalyzeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise, high-level summary of the document\'s purpose and key terms.'),
  anomalies: z.array(AnomalySchema).describe('A list of highlighted anomalies, missing clauses, or unusual terms.'),
  keyDates: z.array(KeyDateSchema).describe('A list of important dates and deadlines identified in the document.'),
});
export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;


export async function analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentOutput> {
  return analyzeDocumentFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentInputSchema},
  output: {schema: AnalyzeDocumentOutputSchema},
  prompt: `You are an expert legal AI assistant with a specialization in contract and document review for the Indian legal system. Your task is to perform a deep and exceptionally thorough analysis of the provided legal document.

**Instructions:**

1.  **Summarize the Document**: Provide a brief, high-level summary of the document's overall purpose and key commercial terms.

2.  **Identify Anomalies & Risks**:
    *   Scrutinize the document with extreme care for any unusual terms, potential loopholes, ambiguities, or missing standard clauses that would be expected for a document of this type.
    *   For each anomaly found, identify the relevant clause, provide a **detailed** description of the issue in simple terms, assess its severity ('high', 'medium', or 'low'), and provide a concrete, actionable recommendation for improvement.
    *   **Crucially, you must also provide an 'improvedClause'**: a rewritten, legally sound version of the clause that mitigates the identified risk. If a clause is missing, draft the ideal clause that should be included.
    *   This is the most critical part of your analysis. Be granular and exhaustive. Examples include ambiguous liability clauses, lack of a clear jurisdiction clause, an unusually short notice period, or one-sided indemnity clauses.

3.  **Extract Key Dates**:
    *   Identify all critical dates and deadlines mentioned in the document.
    *   For each date, specify what it represents (e.g., Effective Date, Expiration Date, Deadline for Notice).

**Document to Analyze:**
---
{{#if documentText}}
{{{documentText}}}
{{/if}}
{{#if documentDataUri}}
{{media url=documentDataUri}}
{{/if}}
---

Provide your structured and detailed analysis below.`,
});

const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: AnalyzeDocumentInputSchema,
    outputSchema: AnalyzeDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
