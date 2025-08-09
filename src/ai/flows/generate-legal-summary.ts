'use server';

/**
 * @fileOverview An AI agent to generate legal summaries from indiankanoon.org.
 *
 * - generateLegalSummary - A function that handles the legal summary generation process.
 * - GenerateLegalSummaryInput - The input type for the generateLegalSummary function.
 * - GenerateLegalSummaryOutput - The return type for the generateLegalSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLegalSummaryInputSchema = z.object({
  legalQuery: z.string().describe('The legal query to research on indiankanoon.org.'),
});
export type GenerateLegalSummaryInput = z.infer<typeof GenerateLegalSummaryInputSchema>;

const GenerateLegalSummaryOutputSchema = z.object({
  summary: z.string().describe('A summarized report of relevant cases and laws from indiankanoon.org.'),
  progress: z.string().describe('A short, one-sentence summary of the flow progress.'),
});
export type GenerateLegalSummaryOutput = z.infer<typeof GenerateLegalSummaryOutputSchema>;

export async function generateLegalSummary(input: GenerateLegalSummaryInput): Promise<GenerateLegalSummaryOutput> {
  return generateLegalSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLegalSummaryPrompt',
  input: {schema: GenerateLegalSummaryInputSchema},
  output: {schema: GenerateLegalSummaryOutputSchema},
  prompt: `You are an expert legal researcher specializing in Indian law.

You will use the following legal query to research relevant cases and laws on indiankanoon.org and generate a comprehensive summary.

Legal Query: {{{legalQuery}}}

Generate a detailed summary of relevant cases and laws from indiankanoon.org related to the legal query. Include case citations and summarize the key legal principles.

Your summary should be well-structured and easy to understand for a lawyer.
`,
});

const generateLegalSummaryFlow = ai.defineFlow(
  {
    name: 'generateLegalSummaryFlow',
    inputSchema: GenerateLegalSummaryInputSchema,
    outputSchema: GenerateLegalSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    //Add progress update
    output!.progress = 'Generated a summarized report of relevant cases and laws from indiankanoon.org.';
    return output!;
  }
);
