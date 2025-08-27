
'use server';

/**
 * @fileOverview A Genkit flow for drafting legal documents with AI assistance.
 * - draftLegalDocument - The main function to generate a legal draft.
 * - DraftLegalDocumentInput - The input type for the drafting function.
 * - DraftLegalDocumentOutput - The return type for the drafting function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { DraftLegalDocumentInputSchema, DraftLegalDocumentOutputSchema, type DraftLegalDocumentInput, type DraftLegalDocumentOutput } from '@/ai/types';

// Mock database for jurisdiction-specific boilerplate
const boilerplateDatabase: Record<string, Record<string, string>> = {
  delhi: {
    contract: "This agreement shall be governed by and construed in accordance with the laws of Delhi.",
    petition: "The petitioner resides within the territorial jurisdiction of this Hon'ble Court.",
    affidavit: "This affidavit is sworn and affirmed at New Delhi.",
    notice: "This notice is issued from our offices in New Delhi.",
  },
  mumbai: {
    contract: "This agreement shall be governed by and construed in accordance with the laws of the State of Maharashtra.",
    petition: "The cause of action arose within the jurisdiction of this Hon'ble Court in Mumbai.",
    affidavit: "This affidavit is sworn and affirmed at Mumbai.",
    notice: "This notice is issued from our offices in Mumbai.",
  },
  'generic': {
    contract: "This agreement shall be governed by the laws of India.",
    petition: "This Hon'ble Court has the necessary jurisdiction to hear this matter.",
    affidavit: "This affidavit is sworn and affirmed in India.",
    notice: "This notice is issued under the laws of India.",
  }
};


export async function draftLegalDocument(
  input: DraftLegalDocumentInput
): Promise<DraftLegalDocumentOutput> {
  return draftLegalDocumentFlow(input);
}


const draftPrompt = ai.definePrompt({
  name: 'draftLegalDocumentPrompt',
  input: { schema: DraftLegalDocumentInputSchema.extend({ boilerplate: z.string() }) },
  output: { schema: DraftLegalDocumentOutputSchema },
  prompt: `You are an expert legal AI assistant specializing in drafting documents for the Indian legal system. Your task is to generate a complete and well-structured legal document based on the user's request.

**Instructions:**
1.  **Analyze the Request**:
    *   Document Type: {{{documentType}}}
    *   User Prompt: {{{prompt}}}
    *   Overall Tone: {{{tone}}}
    *   Jurisdiction: {{{jurisdiction}}}
    *   Jurisdictional Boilerplate to use: "{{{boilerplate}}}"

2.  **Generate a Title**: Create a suitable title for the document (e.g., "Software Development Agreement").

3.  **Draft All Clauses**: Generate all necessary clauses based on the prompt. For each clause, you MUST provide:
    *   A short, descriptive **title** (e.g., "Confidentiality", "Termination").
    *   The full **content** of the clause.
    *   A **risk rating** ('low', 'medium', or 'high') based on potential for dispute or ambiguity.
    *   A brief **riskExplanation** for the assigned risk.

4.  **Assemble the Full Draft**: Combine all generated clauses and the provided boilerplate into a single, coherent document string. Ensure proper formatting, headings, and legal structure. This must be a clean, ready-to-use document.

**Important:**
*   The \`fullDraft\` field MUST contain the complete, ready-to-use document.
*   The \`clauses\` array must contain a detailed breakdown and analysis of each individual clause as instructed above.
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
