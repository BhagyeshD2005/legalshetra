'use server';

/**
 * @fileOverview A Genkit flow for drafting legal documents with AI assistance.
 * - draftLegalDocument - The main function to generate a legal draft.
 * - DraftLegalDocumentInput - The input type for the drafting function.
 * - DraftLegalDocumentOutput - The return type for the drafting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Mock database for jurisdiction-specific boilerplate
const boilerplateDatabase: Record<string, Record<string, string>> = {
  delhi: {
    contract: "This agreement shall be governed by and construed in accordance with the laws of Delhi.",
    petition: "The petitioner resides within the territorial jurisdiction of this Hon'ble Court.",
  },
  mumbai: {
    contract: "This agreement shall be governed by and construed in accordance with the laws of the State of Maharashtra.",
    petition: "The cause of action arose within the jurisdiction of this Hon'ble Court in Mumbai.",
  },
  'generic': {
    contract: "This agreement shall be governed by the laws of India.",
    petition: "This Hon'ble Court has the necessary jurisdiction to hear this matter.",
  }
};


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

export async function draftLegalDocument(
  input: DraftLegalDocumentInput
): Promise<DraftLegalDocumentOutput> {
  return draftLegalDocumentFlow(input);
}


const draftPrompt = ai.definePrompt({
  name: 'draftLegalDocumentPrompt',
  input: { schema: DraftLegalDocumentInputSchema },
  output: { schema: DraftLegalDocumentOutputSchema },
  prompt: `You are an expert legal AI assistant specializing in drafting documents for the Indian legal system. Your task is to generate a complete and well-structured legal document based on the user's request.

**Instructions:**
1.  **Analyze the Request**:
    *   Document Type: {{{documentType}}}
    *   User Prompt: {{{prompt}}}
    *   Overall Tone: {{{tone}}}
    *   Jurisdiction: {{{jurisdiction}}}
    *   Jurisdictional Boilerplate to use: "{{{boilerplate}}}"

2.  **Generate a Title**: Create a suitable title for the document.

3.  **Draft Clauses**: Generate all necessary clauses based on the prompt. For each clause:
    *   Adhere to the requested **tone**.
    *   Assign a **risk rating** (low, medium, or high) based on potential for dispute, ambiguity, or unfavorable terms.
    *   Provide a brief **explanation** for the assigned risk.

4.  **Assemble the Full Draft**: Combine all generated clauses and the provided boilerplate into a single, coherent document. Ensure proper formatting, headings, and legal structure.

**Important:**
*   The generated `fullDraft` must be a complete, ready-to-use document.
*   The `clauses` array must contain a detailed breakdown and analysis of each individual clause.
*   Incorporate the provided boilerplate text seamlessly into the full draft, usually in a "Jurisdiction" or "Governing Law" clause.

Begin the draft now.`,
});


const draftLegalDocumentFlow = ai.defineFlow(
  {
    name: 'draftLegalDocumentFlow',
    inputSchema: DraftLegalDocumentInputSchema,
    outputSchema: DraftLegalDocumentOutputSchema,
  },
  async (input) => {

    const boilerplate = boilerplateDatabase[input.jurisdiction]?.[input.documentType] ?? boilerplateDatabase.generic.contract;

    const { output } = await draftPrompt({...input, boilerplate});
    
    if (!output) {
      throw new Error('The model did not return a valid document draft.');
    }
    
    return output;
  }
);
