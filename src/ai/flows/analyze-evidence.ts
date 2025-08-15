
'use server';

/**
 * @fileOverview A Genkit flow to analyze multimodal legal evidence.
 * - analyzeEvidence - The main function to process and analyze evidence.
 * - AnalyzeEvidenceInput - The input type for the function.
 * - AnalyzeEvidenceOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    AnalyzeEvidenceInputSchema, 
    AnalyzeEvidenceOutputSchema, 
    type AnalyzeEvidenceInput, 
    type AnalyzeEvidenceOutput 
} from '@/ai/types';

export async function analyzeEvidence(
  input: AnalyzeEvidenceInput
): Promise<AnalyzeEvidenceOutput> {
  return analyzeEvidenceFlow(input);
}


const evidencePrompt = ai.definePrompt({
  name: 'analyzeEvidencePrompt',
  input: { schema: AnalyzeEvidenceInputSchema },
  output: { schema: AnalyzeEvidenceOutputSchema },
  prompt: `You are a forensic legal AI analyst. Your task is to perform a detailed analysis of multimodal evidence provided by a user. The evidence may include text documents, images, and audio/video transcripts. You must be meticulous, objective, and highlight legally significant information.

**Case Context:**
{{{caseContext}}}

**Evidence Provided:**
A set of documents, images, and transcripts are provided. You must process each one.
{{#each evidenceFiles}}
- **File:** {{this.fileName}} (Type: {{this.fileType}})
  - **Content/Transcript:** 
    \`\`\`
    {{media url=this.dataUri}}
    \`\`\`
{{/each}}

**Instructions:**
1.  **Summarize and Assess Each Piece of Evidence**:
    *   For each file, provide a brief summary of its content.
    *   Assess the quality (e.g., "clear audio", "blurry image", "legible document"). If quality is poor, state that it may limit the accuracy of the analysis.
    *   For documents/images, perform OCR and classify the document type (e.g., "Affidavit", "Contract", "Photograph").
    *   For audio/video, transcribe the content with HH:MM:SS timestamps for key statements.

2.  **Identify and Highlight Key Information**:
    *   From all evidence, extract legally relevant phrases, such as admissions of guilt, contradictions, names of individuals, specific dates, and locations.
    *   This information should be populated in the \`keyStatements\` array for transcripts and the \`ocrText\` for documents.

3.  **Detect Contradictions**:
    *   This is the most critical step. Compare all pieces of evidence against each other.
    *   Identify any discrepancies in facts, timelines, names, dates, or statements.
    *   For each contradiction found, create an entry in the \`contradictionReport\`. Specify the timestamp or page reference, the original statement, the source of the contradiction, and a brief note explaining the discrepancy.

4.  **Assemble the Final Report**:
    *   Compile all summaries into the \`evidenceSummary\` array.
    *   Compile all detailed analysis (transcripts, OCR) into the \`detailedAnalysis\` array.
    *   Present the final contradiction report.

Your entire output must be a single JSON object matching the specified output schema. Be thorough and precise.`,
});


const analyzeEvidenceFlow = ai.defineFlow(
  {
    name: 'analyzeEvidenceFlow',
    inputSchema: AnalyzeEvidenceInputSchema,
    outputSchema: AnalyzeEvidenceOutputSchema,
  },
  async (input) => {

    // In a real application, you might have different models for transcription vs. analysis.
    // For this example, we use one powerful model to do everything.
    // The prompt is designed to simulate the multi-step process.

    const { output } = await evidencePrompt(input);
    
    if (!output) {
      throw new Error('The model did not return a valid evidence analysis report.');
    }
    
    // You could add post-processing here, e.g., to verify timestamps or clean up OCR.
    
    return output;
  }
);
