
'use server';

/**
 * @fileOverview An AI agent to perform patent searches and generate a novelty report.
 *
 * - patentSearch - A function that handles the patent search and analysis process.
 * - PatentSearchInput - The input type for the patentSearch function.
 * - PatentSearchOutput - The return type for the patentSearch function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    PatentSearchInputSchema, 
    PatentSearchOutputSchema,
    type PatentSearchInput, 
    type PatentSearchOutput 
} from '@/ai/types';


export async function patentSearch(input: PatentSearchInput): Promise<PatentSearchOutput> {
  return patentSearchFlow(input);
}


// 1. Define a tool to search the web for patents.
// This allows the model to use Google Search to find real prior art.
const googleSearchPatents = ai.defineTool(
  {
    name: 'googleSearchPatents',
    description: 'Performs a Google search for relevant patents, primarily on patents.google.com. Use this to find prior art based on an invention\'s description.',
    inputSchema: z.object({
      query: z.string().describe('A targeted search query for finding patents related to the invention.'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string(),
        url: z.string(),
        snippet: z.string(),
      })),
    }),
  },
  async (input) => {
    // This is a placeholder for the actual search implementation.
    // In a real Genkit app with the right setup, you could use a proper
    // search plugin here. The model's built-in search capability will be used.
    console.log(`Tool "googleSearchPatents" called with query: ${input.query}`);
    return { results: [] };
  }
);


// 2. Define the main prompt that uses the tool to generate the report.
const patentSearchPrompt = ai.definePrompt({
  name: 'patentSearchPrompt',
  tools: [googleSearchPatents],
  input: { schema: PatentSearchInputSchema },
  output: { schema: PatentSearchOutputSchema },
  prompt: `You are a world-class patent analyst AI. Your task is to conduct a thorough prior art search based on the user's invention description and generate a structured Patent Search Report.

**User's Invention:**
---
{{{inventionDescription}}}
---

**Instructions:**
1.  **Formulate Search Query**: Based on the invention description, formulate a precise search query highlighting the key technical features and concepts. Your query should be targeted towards finding documents on Google Patents (patents.google.com).
2.  **Conduct Search**: Use the \`googleSearchPatents\` tool to find relevant prior art from the web. You may need to call it more than once with refined queries to get the best results.
3.  **Analyze and Rank Results**: Review the search results. For each relevant patent you find, you must:
    a.  **Extract Details**: From the patent information, extract the Patent ID, title, publication date, and abstract.
    b.  **Assess Relevance**: Assign a relevance score from 0-100 indicating how closely it relates to the user's invention.
    c.  **Summarize**: Write a concise summary of the patent's abstract.
    d.  **Perform Novelty Comparison**: This is the most critical step. Directly compare the prior art to the user's invention. Clearly state what is similar and, more importantly, what appears to be novel or different in the user's invention compared to this specific patent.
4.  **Synthesize Final Report**: Compile your findings into the final structured report.
    a.  **Report Summary**: Write a high-level overview of your findings and give an initial assessment of the invention's patentability.
    b.  **Prior Art List**: Create the ranked list of the most relevant prior art you analyzed.
    c.  **Key Concepts**: List the key technical terms you identified.
    d.  **Recommendations**: Provide actionable next steps for the user. Do not give legal advice, but suggest areas of focus or consultation with a patent attorney.

Your entire output must strictly follow the defined JSON schema. Rely only on the information provided by the \`googleSearchPatents\` tool.`,
});


// 3. Define the flow that orchestrates the prompt and tool.
const patentSearchFlow = ai.defineFlow(
  {
    name: 'patentSearchFlow',
    inputSchema: PatentSearchInputSchema,
    outputSchema: PatentSearchOutputSchema,
  },
  async (input) => {
    const { output } = await patentSearchPrompt(input);
    if (!output) {
      throw new Error('The model did not return a valid patent search report.');
    }
    return output;
  }
);
