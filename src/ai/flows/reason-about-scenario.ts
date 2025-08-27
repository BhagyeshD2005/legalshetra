
'use server';

/**
 * @fileOverview This file contains a Genkit flow that analyzes a legal scenario in an agentic way.
 *
 * - reasonAboutScenario - A function that provides a step-by-step analysis using research tools.
 * - ReasonAboutScenarioInput - The input type for the function.
 * - ReasonAboutScenarioOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {
  ReasonAboutScenarioInputSchema,
  ReasonAboutScenarioOutputSchema,
  type ReasonAboutScenarioInput,
  type ReasonAboutScenarioOutput,
} from '@/ai/types';


// 1. Define the tool for the agent to use.
// We can reuse the same tool definition from the legal summary flow.
const searchIndianKanoon = ai.defineTool(
  {
    name: 'searchIndianKanoon',
    description: 'Searches indiankanoon.org for relevant case laws, statutes, and legal principles to answer a specific legal question based on a scenario. Use this to gather legal context before analysis.',
    inputSchema: z.object({
      query: z.string().describe('A precise search query for the legal database, focused on the legal principles in the user\'s question.'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string().describe('The title of the case or statute.'),
        url: z.string().describe('The URL to the document.'),
        snippet: z.string().describe('A brief snippet of the document highlighting its relevance.'),
        type: z.enum(['Case Law', 'Statute']).describe('The type of legal document.'),
      })),
    }),
  },
  async (input) => {
    // This is a mock implementation. In a real application, this would call a web scraper or API.
    console.log(`Tool "searchIndianKanoon" called for reasoning with query: ${input.query}`);
    
    if (input.query.toLowerCase().includes('delhi rent control')) {
      return {
        results: [
          {
            title: 'The Delhi Rent Control Act, 1958',
            url: 'https://indiankanoon.org/doc/1715943/',
            snippet: 'An Act to provide for the control of rents and evictions and of rates of hotels and lodging houses, and for the lease of vacant premises to Government, in certain areas in the Union territory of Delhi.',
            type: 'Statute'
          },
          {
            title: 'Atma Ram Properties (P) Ltd. vs. M/s. Escorts Ltd.',
            url: 'https://indiankanoon.org/doc/1997327/',
            snippet: 'Discusses the concept of "statutory tenant" where a tenant continues to possess the property after the contractual tenancy has been terminated.',
            type: 'Case Law'
          },
        ]
      };
    }
    
    return { results: [] };
  }
);


const prompt = ai.definePrompt({
  name: 'reasonAboutScenarioPrompt',
  tools: [searchIndianKanoon],
  input: {schema: ReasonAboutScenarioInputSchema},
  output: {schema: ReasonAboutScenarioOutputSchema},
  prompt: `You are an expert legal AI that excels at logical reasoning. Your task is to analyze a given scenario and answer a specific question about it. Provide a clear, exhaustive, step-by-step analysis.

**Instructions:**
1.  **Analyze the Query**: First, understand the user's scenario and question.
2.  **Conduct Research**: Use the \`searchIndianKanoon\` tool to find relevant legal principles, statutes, and case laws. This research is mandatory to ground your analysis in actual law.
3.  **Synthesize Analysis**: Based on your research, generate a structured analysis with the following components:
    *   **Fact Analysis**: From the scenario, pull out all key facts that are relevant to the question.
    *   **Legal Principles**: Based on your research, state the applicable legal principles that govern the situation.
    *   **Application of Principles to Facts**: Apply the legal principles to the identified facts in a logical, step-by-step sequence.
    *   **Counter-Arguments**: Briefly discuss potential counter-arguments or alternative interpretations.
    *   **Conclusion**: Provide a clear, well-supported conclusion that directly answers the user's question.
4.  **Cite Sources**: Populate the \`citedCases\` array with the title and URL of any case law or statute you referenced from your research.

**Scenario:**
---
{{{scenario}}}
---

**Question:**
---
{{{question}}}
---

Provide your detailed step-by-step analysis below.`,
});


export async function reasonAboutScenario(
  input: ReasonAboutScenarioInput
): Promise<ReasonAboutScenarioOutput> {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The model did not return a valid analysis.");
    }
    return output;
}
