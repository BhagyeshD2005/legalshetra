
'use server';

/**
 * @fileOverview A Genkit flow to analyze the full text of a legal judgment.
 * - analyzeJudgment - The main function to process and analyze the judgment.
 * - AnalyzeJudgmentInput - The input type for the function.
 * - AnalyzeJudgmentOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import {
  AnalyzeJudgmentInputSchema,
  AnalyzeJudgmentOutputSchema,
  type AnalyzeJudgmentInput,
  type AnalyzeJudgmentOutput,
} from '@/ai/types';


export async function analyzeJudgment(
  input: AnalyzeJudgmentInput
): Promise<AnalyzeJudgmentOutput> {
  return analyzeJudgmentFlow(input);
}


const judgmentAnalysisPrompt = ai.definePrompt({
  name: 'analyzeJudgmentPrompt',
  input: { schema: AnalyzeJudgmentInputSchema },
  output: { schema: AnalyzeJudgmentOutputSchema },
  prompt: `You are an expert legal AI specializing in the detailed analysis of Indian court judgments. You will be provided with the text or a detailed summary of a judgment. Your task is to extract and structure the information into a comprehensive report.

**Judgment Text/Summary to Analyze:**
---
{{#if judgmentText}}
{{{judgmentText}}}
{{/if}}
---

**Instructions:**

Based on the provided text, generate a structured report with the following sections. If a section cannot be determined from the text, state that explicitly.

1.  **Facts of the Case**: Provide a neutral and concise summary of the factual background that led to the litigation.
2.  **Issues Framed by the Court**: List the key legal or factual questions that the court sought to answer.
3.  **Arguments of the Petitioner**: Summarize the main legal arguments and submissions made by the petitioner's counsel.
4.  **Arguments of the Respondent**: Summarize the main legal arguments and submissions made by the respondent's counsel.
5.  **Decision / Holding**: State the final decision or ruling of the court in clear terms.
6.  **Ratio Decidendi**: Explain the core legal reasoning and the principle of law upon which the court's decision is based. This is the binding precedent.
7.  **Obiter Dicta**: Identify any non-binding statements, observations, or discussions made by the court that are not essential to the final decision but may be of persuasive value.
8.  **Cited Precedents**: List the key cases cited by the court in its judgment. For each precedent, briefly explain how it was treated (e.g., followed, distinguished, overruled).
9.  **Practical Impact / Risk Analysis**: Provide a brief analysis of the practical implications of this judgment for litigants, businesses, or legal practice in the relevant area.

Your entire output must be a single JSON object matching the specified output schema. Be thorough, precise, and objective.`,
});


const analyzeJudgmentFlow = ai.defineFlow(
  {
    name: 'analyzeJudgmentFlow',
    inputSchema: AnalyzeJudgmentInputSchema,
    outputSchema: AnalyzeJudgmentOutputSchema,
  },
  async (input) => {
    
    // In a real-world scenario, if given a URL, you would first have a step
    // to scrape and clean the text from that URL.
    // For this example, we assume the input text is already provided or cleaned.
    
    const { output } = await judgmentAnalysisPrompt(input);

    if (!output) {
      throw new Error('The model did not return a valid judgment analysis.');
    }

    return output;
  }
);

    