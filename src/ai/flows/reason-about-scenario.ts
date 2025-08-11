
'use server';

/**
 * @fileOverview This file contains a Genkit flow that analyzes a legal scenario.
 *
 * - reasonAboutScenario - A function that provides a step-by-step analysis.
 * - ReasonAboutScenarioInput - The input type for the function.
 * - ReasonAboutScenarioOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReasonAboutScenarioInputSchema = z.object({
  scenario: z.string().describe('The factual matrix of the legal case or scenario.'),
  question: z.string().describe('The specific legal question to be answered based on the scenario.'),
});
export type ReasonAboutScenarioInput = z.infer<typeof ReasonAboutScenarioInputSchema>;

const ReasonAboutScenarioOutputSchema = z.object({
  analysis: z
    .string()
    .describe(
      'A detailed, step-by-step logical analysis of the legal question based on the provided scenario.'
    ),
});
export type ReasonAboutScenarioOutput = z.infer<typeof ReasonAboutScenarioOutputSchema>;

export async function reasonAboutScenario(
  input: ReasonAboutScenarioInput
): Promise<ReasonAboutScenarioOutput> {
  return reasonAboutScenarioFlow(input);
}

const prompt = ai.definePrompt({
  name: 'reasonAboutScenarioPrompt',
  input: {schema: ReasonAboutScenarioInputSchema},
  output: {schema: ReasonAboutScenarioOutputSchema},
  prompt: `You are an expert legal AI that excels at logical reasoning. Your task is to analyze a given scenario and answer a specific question about it. Provide a clear, step-by-step analysis.

**Instructions:**
1.  **Identify Relevant Facts**: From the scenario, pull out the key facts that are relevant to the question.
2.  **Identify Legal Principles**: State the applicable legal principles or laws that govern the situation. If possible, cite relevant sections or acts.
3.  **Apply Principles to Facts**: Apply the legal principles to the identified facts in a logical sequence.
4.  **Conclude**: Provide a clear conclusion that directly answers the user's question.

**Scenario:**
---
{{{scenario}}}
---

**Question:**
---
{{{question}}}
---

Provide your step-by-step analysis below. Use markdown for formatting, especially for titles and lists.`,
});

const reasonAboutScenarioFlow = ai.defineFlow(
  {
    name: 'reasonAboutScenarioFlow',
    inputSchema: ReasonAboutScenarioInputSchema,
    outputSchema: ReasonAboutScenarioOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
