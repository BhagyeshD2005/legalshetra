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

const ChartDataSchema = z.object({
  type: z.enum(['bar', 'pie', 'line']).describe('The type of chart to render.'),
  title: z.string().describe('The title of the chart.'),
  data: z.array(z.object({
      name: z.string(),
      value: z.number(),
      fill: z.string().optional().describe("Hex color code for the chart segment")
  })).describe('The data for the chart.'),
});
export type ChartData = z.infer<typeof ChartDataSchema>;


const RankedCaseSchema = z.object({
    rank: z.number().describe('The rank of the case based on relevance, jurisdiction, and recency.'),
    title: z.string().describe('The full title of the case.'),
    citation: z.string().describe('The proper legal citation for the case.'),
    url: z.string().describe('The URL to the full text of the case document.'),
    jurisdiction: z.string().describe('The court or jurisdiction (e.g., "Supreme Court of India", "Delhi High Court").'),
    date: z.string().describe('The date the judgment was delivered.'),
    summary: z.string().describe('A brief summary of the case and its relevance to the query.'),
});

const KeyPrincipleSchema = z.object({
    principle: z.string().describe('The core legal principle or doctrine discussed.'),
    cases: z.array(z.string()).describe('A list of case citations that establish or discuss this principle.'),
});

const GenerateLegalSummaryOutputSchema = z.object({
  summary: z.string().describe('A high-level summarized report of relevant cases and laws from indiankanoon.org.'),
  rankedCases: z.array(RankedCaseSchema).describe('A list of relevant cases, ranked by importance and relevance to the query.'),
  keyPrinciples: z.array(KeyPrincipleSchema).describe('A list of key legal principles derived from the research.'),
  charts: z.array(ChartDataSchema).optional().describe('Any statistical data found in the research that can be visualized as charts.'),
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
        jurisdiction: z.string().describe('The court that gave the judgment (e.g. "Supreme Court", "Delhi High Court").'),
        date: z.string().describe('The date of the judgment (YYYY-MM-DD).'),
        type: z.enum(['Case Law', 'Statute']).describe('The type of legal document.'),
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
            title: 'State of Madras v. Champakam Dorairajan',
            citation: 'AIR 1951 SC 226',
            url: 'https://indiankanoon.org/doc/1881206/',
            snippet: 'This case led to the First Amendment of the Constitution, inserting Article 15(4). The court held that caste-based reservations violated Article 29(2) read with Article 15(1).',
            jurisdiction: 'Supreme Court of India',
            date: '1951-04-09',
            type: 'Case Law'
          },
          {
            title: 'M.R. Balaji v. State of Mysore',
            citation: 'AIR 1963 SC 649',
            url: 'https://indiankanoon.org/doc/1211105/',
            snippet: 'The Supreme Court examined the extent of reservations permissible under Article 15(4) and established the 50% ceiling for reservations.',
            jurisdiction: 'Supreme Court of India',
            date: '1962-09-28',
            type: 'Case Law'
          },
          {
             title: 'Indra Sawhney v. Union of India',
             citation: 'AIR 1993 SC 477',
            url: 'https://indiankanoon.org/doc/1902231/',
            snippet: 'The Mandal Commission case reaffirmed the 50% rule and introduced the concept of the "creamy layer" exclusion from reservation benefits for OBCs.',
            jurisdiction: 'Supreme Court of India',
            date: '1992-11-16',
            type: 'Case Law'
          },
          {
            title: 'The Constitution of India',
            citation: 'Article 15',
            url: 'https://indiankanoon.org/doc/1 आर्टिकल-15/',
            snippet: 'Article 15 prohibits discrimination on grounds of religion, race, caste, sex or place of birth. Clause (4) allows the State to make special provisions for the advancement of socially and educationally backward classes.',
            jurisdiction: 'Parliament of India',
            date: '1950-01-26',
            type: 'Statute'
          }
        ],
      };
    }
    
    return {
      results: [{
        title: 'No specific results found for query.',
        url: '#',
        snippet: 'The simulated search did not yield specific matches for this query. Please try a different query.',
        jurisdiction: 'N/A',
        date: 'N/A',
        type: 'Case Law'
      }],
    };
  }
);


// 2. Define the agent's prompt, making the tool available.
const summarizeLegalQueryPrompt = ai.definePrompt({
  name: 'summarizeLegalQueryPrompt',
  tools: [searchIndianKanoon],
  input: {
    schema: GenerateLegalSummaryInputSchema,
  },
  output: {
    schema: GenerateLegalSummaryOutputSchema,
  },
  prompt: `You are an expert legal researcher AI for the Indian legal system. Your task is to provide a comprehensive, deep-dive analysis based on a user's legal query.

**Query:** {{{legalQuery}}}

**Instructions:**

1.  **Analyze and Deconstruct the Query**: 
    *   Identify the core legal issue(s).
    *   Extract any specified jurisdictions (e.g., "Delhi High Court"), timeframes (e.g., "after 2015"), or parties.
    *   Formulate a precise search strategy.

2.  **Conduct Comprehensive Research**:
    *   Use the \`searchIndianKanoon\` tool to find relevant case laws and statutes.
    *   You may need to call the tool multiple times with different sub-queries (e.g., broad search first, then narrow down) to gather comprehensive information.

3.  **Synthesize the Report**: Once you have gathered sufficient information, generate a multi-part report.
    
    A. **Overall Summary**:
       * Write a concise, high-level overview of your findings.
    
    B. **Ranked Case Analysis**:
       * Analyze the search results and identify the most important cases.
       * Rank them based on a combination of:
         1.  **Relevance**: How closely does it match the query?
         2.  **Jurisdictional Authority**: Supreme Court > High Court > Lower Courts. Give preference to jurisdictions mentioned in the query.
         3.  **Recency**: More recent judgments are generally more relevant, unless it's a landmark foundational case.
       * For each ranked case, provide its title, proper citation, date, jurisdiction, a URL, and a summary of its relevance. Populate the \`rankedCases\` array.

    C. **Key Legal Principles**:
       * From all the research, distill the most critical legal principles, doctrines, or tests.
       * For each principle, explain it and list the cases that establish or affirm it. Populate the \`keyPrinciples\` array.

4.  **Extract Chart Data**: While synthesizing the report, identify any statistical data or concepts that can be visualized (e.g., quotas, limits, timelines). If found, populate the \`charts\` array with appropriate data. For example, a 50% reservation rule can be a pie chart.

5.  **Strict Adherence**: Your entire report must be based *only* on the information returned by the \`searchIndianKanoon\` tool. Do not invent cases, principles, or details.`,
});


// 3. Define the main flow that runs the agent.
const generateLegalSummaryFlow = ai.defineFlow(
  {
    name: 'generateLegalSummaryFlow',
    inputSchema: GenerateLegalSummaryInputSchema,
    outputSchema: GenerateLegalSummaryOutputSchema,
  },
  async (input) => {
    // Use ai.generate() which will call the prompt with tools.
    const {output} = await summarizeLegalQueryPrompt(input);
        
    if (!output) {
      throw new Error("The model did not return a valid summary.");
    }
    
    // Add a default chart if the query was about reservations, as a demo
    if (input.legalQuery.toLowerCase().includes('article 15') && (!output.charts || output.charts.length === 0)) {
        output.charts = [
            {
                type: 'pie',
                title: 'Reservation Ceiling (M.R. Balaji v. State of Mysore)',
                data: [
                    { name: 'General Category', value: 50, fill: 'hsl(var(--chart-2))' },
                    { name: 'Reserved Category', value: 50, fill: 'hsl(var(--chart-1))' },
                ]
            }
        ];
    }

    return output;
  }
);
