
'use server';

/**
 * @fileOverview This file contains a Genkit flow that analyzes a legal document from text or a file.
 *
 * - analyzeDocument - A function that summarizes the provided legal document.
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

const AnalyzeDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key points, arguments, and conclusions from the legal document.'),
});
export type AnalyzeDocumentOutput = z.infer<typeof AnalyzeDocumentOutputSchema>;


export async function analyzeDocument(input: AnalyzeDocumentInput): Promise<AnalyzeDocumentOutput> {
  return analyzeDocumentFlow(input);
}


const prompt = ai.definePrompt({
  name: 'analyzeDocumentPrompt',
  input: {schema: AnalyzeDocumentInputSchema},
  output: {schema: AnalyzeDocumentOutputSchema},
  prompt: `You are an expert legal AI assistant. Your task is to analyze the provided legal document and generate a clear, concise summary.

Focus on the following:
- Key legal arguments or principles discussed.
- The main facts of the case or issue.
- The final judgment, conclusion, or main takeaway.

Keep the summary objective and based *only* on the content provided.

**Document to Analyze:**
---
{{#if documentText}}
{{{documentText}}}
{{/if}}
{{#if documentDataUri}}
{{media url=documentDataUri}}
{{/if}}
---

Provide your summary below.`,
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
