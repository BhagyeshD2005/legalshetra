
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
  prompt: `You are an expert legal AI assistant with a specialization in litigation and trial preparation for the Indian legal system. Your task is to prepare a lawyer for cross-examination.

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
1.  **Identify Inconsistencies**: Scrutinize the witness statement and compare it against the evidence summary. Identify any contradictions, inconsistencies, or omissions that could be exploited during cross-examination.
2.  **Generate Strategic Questions**: Based on the inconsistencies and my role, generate a list of strategic questions to ask the witness. For each question, provide a brief explanation of its purpose (e.g., "To highlight contradiction with Exhibit A," "To question the witness's credibility").
3.  **Anticipate Opposing Arguments**: Predict the arguments the opposing counsel might raise in response to your line of questioning or to protect their witness.
4.  **Conduct Role-Play Simulation**: Generate a sample dialogue based on the selected role-play. 
    *   If role-playing as the **Witness**, provide realistic answers to some of your generated questions, demonstrating how they might try to evade or explain inconsistencies.
    *   If role-playing as the **Opposing Counsel**, provide their likely objections or re-direction questions.

Provide a complete and structured analysis.`,
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
