
'use server';

/**
 * @fileOverview A Genkit flow to prepare for cross-examination.
 * - crossExaminationPrep - The main function to generate a preparation strategy.
 * - CrossExaminationPrepInput - The input type for the function.
 * - CrossExaminationPrepOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { CrossExaminationPrepInputSchema, CrossExaminationPrepOutputSchema, type CrossExaminationPrepInput, type CrossExaminationPrepOutput } from '@/ai/types';


export async function crossExaminationPrep(
  input: CrossExaminationPrepInput
): Promise<CrossExaminationPrepOutput> {
  return crossExaminationPrepFlow(input);
}


const prepPrompt = ai.definePrompt({
  name: 'crossExaminationPrepPrompt',
  input: { schema: CrossExaminationPrepInputSchema },
  output: { schema: CrossExaminationPrepOutputSchema },
  prompt: `You are an expert legal AI assistant with a specialization in litigation and trial preparation for the Indian legal system. Your task is to prepare a lawyer for cross-examination in extensive detail.

**Case Context:**
*   My Role: {{{myRole}}}
*   Witness Statement: 
    \`\`\`
    {{{witnessStatement}}}
    \`\`\`
*   Summary of our Evidence: 
    \`\`\`
    {{{evidenceSummary}}}
    \`\`\`
*   Role-Play Simulation: I want you to role-play as the {{{simulationRole}}}.

**Instructions:**
1.  **Identify Inconsistencies**: Scrutinize the witness statement and compare it against the evidence summary. Identify every possible contradiction, inconsistency, or omission that could be exploited during cross-examination. For each, explain its significance in detail.
2.  **Analyze Witness Motivation**: Based on the statement, infer potential motivations, biases, or weaknesses of the witness that could be relevant.
3.  **Generate Strategic Questions**: Based on the inconsistencies and my role, generate a comprehensive list of strategic questions to ask the witness. For each question, provide a detailed explanation of its purpose (e.g., "To highlight contradiction with Exhibit A," "To question the witness's credibility by exposing bias," "To establish a more accurate timeline"). The questions should be sequenced logically.
4.  **Anticipate Opposing Arguments**: Predict the arguments and objections the opposing counsel might raise in response to your line of questioning or to protect their witness. For each, suggest a pre-emptive response or a way to rephrase the question.
5.  **Conduct Role-Play Simulation**: Generate a detailed, realistic sample dialogue based on the selected role-play. 
    *   If role-playing as the **Witness**, provide realistic, challenging answers to some of your generated questions, demonstrating how they might try to evade, explain inconsistencies, or become hostile.
    *   If role-playing as the **Opposing Counsel**, provide their likely objections or re-direction questions with legal reasoning.

Provide a complete, in-depth, and structured analysis.`,
});


const crossExaminationPrepFlow = ai.defineFlow(
  {
    name: 'crossExaminationPrepFlow',
    inputSchema: CrossExaminationPrepInputSchema,
    outputSchema: CrossExaminationPrepOutputSchema,
  },
  async (input) => {

    const { output } = await prepPrompt(input);
    
    if (!output) {
      throw new Error('The model did not return a valid cross-examination plan.');
    }
    
    return output;
  }
);
