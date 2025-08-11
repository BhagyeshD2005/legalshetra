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
});
export type GenerateLegalSummaryOutput = z.infer<typeof GenerateLegalSummaryOutputSchema>;

export async function generateLegalSummary(input: GenerateLegalSummaryInput): Promise<GenerateLegalSummaryOutput> {
  return generateLegalSummaryFlow(input);
}

// 1. Define the tool for the agent to use.
const searchIndianKanoon = ai.defineTool(
  {
    name: 'searchIndianKanoon',
    description: 'Searches indiankanoon.org for relevant case laws and statutes. Use this tool to gather information before synthesizing a summary.',
    inputSchema: z.object({
      query: z.string().describe('A precise search query for the legal database.'),
    }),
    outputSchema: z.object({
      results: z.array(z.object({
        title: z.string().describe('The title of the case or statute.'),
        url: z.string().describe('The URL to the document.'),
        snippet: z.string().describe('A brief snippet of the document.'),
      })),
    }),
  },
  async (input) => {
    // In a real application, this would involve a web scraper or API call.
    // For this example, we'll return some hardcoded but realistic results.
    console.log(`Tool "searchIndianKanoon" called with query: ${input.query}`);
    
    // Simulate finding relevant cases based on the query.
    // A real implementation would have more sophisticated logic.
    if (input.query.toLowerCase().includes('article 15')) {
      return {
        results: [
          {
            title: 'State of Madras v. Champakam Dorairajan, AIR 1951 SC 226',
            url: 'https://indiankanoon.org/doc/1 Champakam Dorairajan/',
            snippet: 'This case led to the First Amendment of the Constitution, inserting Article 15(4). The court held that caste-based reservations violated Article 29(2) read with Article 15(1).',
          },
          {
            title: 'M.R. Balaji v. State of Mysore, AIR 1963 SC 649',
            url: 'https://indiankanoon.org/doc/1 Balaji/',
            snippet: 'The Supreme Court examined the extent of reservations permissible under Article 15(4) and established the 50% ceiling for reservations.',
          },
          {
             title: 'Indra Sawhney v. Union of India, AIR 1993 SC 477',
            url: 'https://indiankanoon.org/doc/1 Indra Sawhney/',
            snippet: 'The Mandal Commission case reaffirmed the 50% rule and introduced the concept of the "creamy layer" exclusion.',
          }
        ],
      };
    }
    
    return {
      results: [{
        title: 'No specific results found for query.',
        url: '#',
        snippet: 'The simulated search did not yield specific matches for this query. Please try a different query.'
      }],
    };
  }
);


// 2. Define the agent's prompt, making the tool available.
const summarizeLegalQueryPrompt = ai.definePrompt({
    name: 'summarizeLegalQueryPrompt',
    tools: [searchIndianKanoon],
    system: `You are an expert legal researcher specializing in Indian law. Your task is to provide a comprehensive summary based on a legal query.

    Follow these steps:
    1.  **Analyze the Query**: Carefully understand the user's legal query.
    2.  **Use the Tool**: Use the \`searchIndianKanoon\` tool to find relevant cases and statutes. You may need to call the tool multiple times with different sub-queries to gather comprehensive information.
    3.  **Synthesize the Report**: Once you have gathered sufficient information, generate a detailed summary. Your summary should:
        *   Be well-structured with clear headings.
        *   Include case citations.
        *   Summarize the key legal principles from the discovered documents.
        *   Be easy for a lawyer to understand.
    4.  **Do not** invent cases or legal principles. Your summary must be based *only* on the information returned by the \`searchIndianKanoon\` tool.`,
    output: {
        schema: GenerateLegalSummaryOutputSchema,
    }
});


// 3. Define the main flow that runs the agent.
const generateLegalSummaryFlow = ai.defineFlow(
  {
    name: 'generateLegalSummaryFlow',
    inputSchema: GenerateLegalSummaryInputSchema,
    outputSchema: GenerateLegalSummaryOutputSchema,
  },
  async (input) => {
    // Use ai.generate() to run the prompt with tools.
    const llmResponse = await ai.generate({
        prompt: input.legalQuery,
        model: 'googleai/gemini-2.0-flash',
        tools: [searchIndianKanoon],
        output: {
            schema: GenerateLegalSummaryOutputSchema,
        }
    });
    
    const output = llmResponse.output;
    
    if (!output) {
      throw new Error("The model did not return a valid summary.");
    }
    
    return output;
  }
);
