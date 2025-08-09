'use server';

/**
 * @fileOverview This file contains a Genkit flow that rephrases a legal query to be more precise and comprehensive.
 *
 * - enhanceQueryClarity - A function that rephrases the legal query.
 * - EnhanceQueryClarityInput - The input type for the enhanceQueryClarity function.
 * - EnhanceQueryClarityOutput - The return type for the enhanceQueryClarity function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceQueryClarityInputSchema = z.object({
  legalQuery: z.string().describe('The original legal query entered by the lawyer.'),
});
export type EnhanceQueryClarityInput = z.infer<typeof EnhanceQueryClarityInputSchema>;

const EnhanceQueryClarityOutputSchema = z.object({
  rephrasedQuery: z
    .string()
    .describe(
      'The rephrased legal query, which is more precise and comprehensive than the original.'
    ),
});
export type EnhanceQueryClarityOutput = z.infer<typeof EnhanceQueryClarityOutputSchema>;

export async function enhanceQueryClarity(
  input: EnhanceQueryClarityInput
): Promise<EnhanceQueryClarityOutput> {
  return enhanceQueryClarityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceQueryClarityPrompt',
  input: {schema: EnhanceQueryClarityInputSchema},
  output: {schema: EnhanceQueryClarityOutputSchema},
  prompt: `You are an AI legal assistant. Your task is to rephrase the given legal query to be more precise and comprehensive, ensuring more accurate and relevant results when searching Indian legal databases like indiankanoon.org.

Original Legal Query: {{{legalQuery}}}

Rephrased Legal Query:`,
});

const enhanceQueryClarityFlow = ai.defineFlow(
  {
    name: 'enhanceQueryClarityFlow',
    inputSchema: EnhanceQueryClarityInputSchema,
    outputSchema: EnhanceQueryClarityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
