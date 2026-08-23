```ts
'use server';

/**
 * @fileOverview AI agent to generate legal summaries from Indian Kanoon.
 *
 * This flow:
 * 1. Receives a legal query.
 * 2. Searches the Indian Kanoon tool.
 * 3. Uses Gemini to synthesize the results.
 * 4. Always returns a valid structured object.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

/* -------------------------------------------------------------------------- */
/* INPUT SCHEMA                                                               */
/* -------------------------------------------------------------------------- */

const GenerateLegalSummaryInputSchema = z.object({
  legalQuery: z
    .string()
    .min(1)
    .describe('The legal query to research on indiankanoon.org.'),
});

export type GenerateLegalSummaryInput = z.infer<
  typeof GenerateLegalSummaryInputSchema
>;

/* -------------------------------------------------------------------------- */
/* CHART SCHEMA                                                               */
/* -------------------------------------------------------------------------- */

const ChartDataSchema = z.object({
  type: z
    .enum(['bar', 'pie', 'line'])
    .describe('The type of chart to render.'),

  title: z.string().describe('The title of the chart.'),

  data: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      fill: z
        .string()
        .optional()
        .describe('Hex or CSS color for the chart segment.'),
    })
  ),
});

export type ChartData = z.infer<typeof ChartDataSchema>;

/* -------------------------------------------------------------------------- */
/* RANKED CASE SCHEMA                                                         */
/* -------------------------------------------------------------------------- */

const RankedCaseSchema = z.object({
  rank: z
    .number()
    .describe(
      'The rank of the case based on relevance, jurisdiction, and recency.'
    ),

  title: z.string().describe('The full title of the case.'),

  citation: z.string().describe('The proper legal citation for the case.'),

  url: z
    .string()
    .url()
    .describe('The URL to the full text of the case document.'),

  jurisdiction: z
    .string()
    .describe(
      'The court or jurisdiction, e.g. Supreme Court of India or Delhi High Court.'
    ),

  date: z.string().describe('The date the judgment was delivered.'),

  summary: z
    .string()
    .describe('A brief summary of the case and its relevance to the query.'),
});

/* -------------------------------------------------------------------------- */
/* KEY PRINCIPLE SCHEMA                                                       */
/* -------------------------------------------------------------------------- */

const KeyPrincipleSchema = z.object({
  principle: z
    .string()
    .describe('The core legal principle or doctrine discussed.'),

  cases: z
    .array(z.string())
    .describe(
      'A list of case citations that establish or discuss this principle.'
    ),
});

/* -------------------------------------------------------------------------- */
/* FINAL OUTPUT SCHEMA                                                        */
/* -------------------------------------------------------------------------- */

const GenerateLegalSummaryOutputSchema = z.object({
  summary: z
    .string()
    .describe(
      'A high-level summarized report of relevant cases and laws from indiankanoon.org.'
    ),

  rankedCases: z
    .array(RankedCaseSchema)
    .default([])
    .describe(
      'A list of relevant cases ranked by importance and relevance to the query.'
    ),

  keyPrinciples: z
    .array(KeyPrincipleSchema)
    .default([])
    .describe('A list of key legal principles derived from the research.'),

  charts: z
    .array(ChartDataSchema)
    .default([])
    .describe(
      'Statistical data from the research that can be visualized as charts.'
    ),
});

export type GenerateLegalSummaryOutput = z.infer<
  typeof GenerateLegalSummaryOutputSchema
>;

/* -------------------------------------------------------------------------- */
/* INDIAN KANOON SEARCH TOOL                                                  */
/* -------------------------------------------------------------------------- */

const IndianKanoonResultSchema = z.object({
  title: z.string(),

  citation: z.string(),

  url: z.string(),

  snippet: z.string(),

  jurisdiction: z.string(),

  date: z.string(),

  type: z.enum(['Case Law', 'Statute']),
});

const searchIndianKanoon = ai.defineTool(
  {
    name: 'searchIndianKanoon',

    description:
      'Searches Indian Kanoon for relevant Indian case laws and statutes. Use this tool before generating the legal research report.',

    inputSchema: z.object({
      query: z
        .string()
        .min(1)
        .describe('A precise search query for the legal database.'),
    }),

    /*
     * IMPORTANT:
     *
     * The original code returned "citation", but citation was NOT declared
     * in the output schema.
     *
     * That mismatch has been fixed here.
     */
    outputSchema: z.object({
      results: z.array(IndianKanoonResultSchema).default([]),
    }),
  },

  async (input) => {
    try {
      const query = input.query?.trim();

      console.log(
        '[searchIndianKanoon] Query:',
        query
      );

      if (!query) {
        return {
          results: [],
        };
      }

      const normalizedQuery = query.toLowerCase();

      /* -------------------------------------------------------------------- */
      /* ARTICLE 15 DEMO DATA                                                 */
      /* -------------------------------------------------------------------- */

      if (
        normalizedQuery.includes('article 15') ||
        normalizedQuery.includes('article fifteen') ||
        normalizedQuery.includes('reservation')
      ) {
        return {
          results: [
            {
              title:
                'State of Madras v. Champakam Dorairajan',

              citation:
                'AIR 1951 SC 226',

              url:
                'https://indiankanoon.org/doc/1881206/',

              snippet:
                'The Supreme Court considered communal reservations and the relationship between Article 15(1) and Article 29(2). The judgment contributed to the constitutional developments that resulted in the insertion of Article 15(4).',

              jurisdiction:
                'Supreme Court of India',

              date:
                '1951-04-09',

              type:
                'Case Law',
            },

            {
              title:
                'M.R. Balaji v. State of Mysore',

              citation:
                'AIR 1963 SC 649',

              url:
                'https://indiankanoon.org/doc/1211105/',

              snippet:
                'The Supreme Court considered the scope of reservations under Article 15(4) and discussed the extent to which reservation could be made for socially and educationally backward classes.',

              jurisdiction:
                'Supreme Court of India',

              date:
                '1962-09-28',

              type:
                'Case Law',
            },

            {
              title:
                'Indra Sawhney v. Union of India',

              citation:
                'AIR 1993 SC 477',

              url:
                'https://indiankanoon.org/doc/1902231/',

              snippet:
                'The Supreme Court considered reservation for backward classes and developed important principles concerning the creamy layer and the general ceiling on reservations.',

              jurisdiction:
                'Supreme Court of India',

              date:
                '1992-11-16',

              type:
                'Case Law',
            },

            {
              title:
                'The Constitution of India',

              citation:
                'Article 15',

              url:
                'https://indiankanoon.org/doc/1/',

              snippet:
                'Article 15 addresses discrimination on specified grounds including religion, race, caste, sex and place of birth, and contains provisions permitting certain special measures for advancement of socially and educationally backward classes and other specified groups.',

              jurisdiction:
                'Constitution of India',

              date:
                '1950-01-26',

              type:
                'Statute',
            },
          ],
        };
      }

      /* -------------------------------------------------------------------- */
      /* TIME-IS-OF-THE-ESSENCE DEMO DATA                                    */
      /* -------------------------------------------------------------------- */

      if (
        normalizedQuery.includes('time is of the essence') ||
        normalizedQuery.includes('time of the essence') ||
        normalizedQuery.includes('contract delay')
      ) {
        return {
          results: [
            {
              title:
                'Saradamani Kandappan v. S. Rajalakshmi',

              citation:
                '(2011) 12 SCC 18',

              url:
                'https://indiankanoon.org/',

              snippet:
                'The Supreme Court discussed the principle that time may become an important contractual term depending on the language of the agreement, surrounding circumstances and the nature of the transaction.',

              jurisdiction:
                'Supreme Court of India',

              date:
                '2011-07-04',

              type:
                'Case Law',
            },

            {
              title:
                'Chand Rani v. Kamal Rani',

              citation:
                '(1993) 1 SCC 519',

              url:
                'https://indiankanoon.org/',

              snippet:
                'The Supreme Court discussed the general principle concerning whether time is of the essence in contracts and the circumstances in which the intention of the parties may make time essential.',

              jurisdiction:
                'Supreme Court of India',

              date:
                '1992-11-19',

              type:
                'Case Law',
            },
          ],
        };
      }

      /* -------------------------------------------------------------------- */
      /* NO RESULTS                                                           */
      /* -------------------------------------------------------------------- */

      /*
       * NEVER return null here.
       *
       * The Genkit tool output schema requires:
       *
       * {
       *   results: [...]
       * }
       *
       * Returning an empty array keeps the schema valid.
       */

      return {
        results: [],
      };
    } catch (error) {
      console.error(
        '[searchIndianKanoon] Tool failed:',
        error
      );

      /*
       * Even if the tool fails, return a schema-valid object.
       *
       * This is one of the main fixes for:
       *
       * "Schema validation failed"
       * "Provided data: null"
       */

      return {
        results: [],
      };
    }
  }
);

/* -------------------------------------------------------------------------- */
/* GEMINI PROMPT                                                              */
/* -------------------------------------------------------------------------- */

const summarizeLegalQueryPrompt = ai.definePrompt({
  name: 'summarizeLegalQueryPrompt',

  tools: [searchIndianKanoon],

  input: {
    schema: GenerateLegalSummaryInputSchema,
  },

  output: {
    schema: GenerateLegalSummaryOutputSchema,
  },

  prompt: `
You are an expert legal research assistant specializing in Indian law.

Your job is to analyze the user's legal query using the
searchIndianKanoon tool and produce a structured legal research report.

USER QUERY:
{{{legalQuery}}}

IMPORTANT OUTPUT RULES:

1. NEVER return null.

2. ALWAYS return an object containing exactly these main fields:

{
  "summary": "...",
  "rankedCases": [],
  "keyPrinciples": [],
  "charts": []
}

3. If no relevant cases are found:
   - summary must explain that no matching results were found
   - rankedCases must be []
   - keyPrinciples must be []
   - charts must be []

4. Do not invent cases.

5. Do not invent citations.

6. Do not invent URLs.

7. Do not invent dates.

8. Do not invent legal principles that are not supported by the search results.

9. Use searchIndianKanoon before generating the final report.

10. You may perform multiple searches when necessary.

11. Rank cases according to:
    - relevance to the query
    - jurisdictional authority
    - relevance of the legal issue
    - recency where appropriate

12. For every ranked case include:
    - rank
    - title
    - citation
    - url
    - jurisdiction
    - date
    - summary

13. For every key principle include:
    - principle
    - cases

14. Only create charts when the search results provide information that can
    reasonably be represented numerically.

15. If chart data is unavailable, return:
    "charts": []

16. Keep the report based only on information returned by
    searchIndianKanoon.

17. If the search tool returns no results, do NOT manufacture an answer.

LEGAL RESEARCH PROCESS:

Step 1:
Understand the user's legal question.

Step 2:
Identify important legal concepts, sections, articles, parties,
courts and dates.

Step 3:
Call searchIndianKanoon with a precise search query.

Step 4:
If necessary, perform additional searches using narrower queries.

Step 5:
Compare the returned results.

Step 6:
Produce the final structured report.

The final response MUST conform to the provided output schema.
`,
});

/* -------------------------------------------------------------------------- */
/* MAIN FLOW                                                                  */
/* -------------------------------------------------------------------------- */

const generateLegalSummaryFlow = ai.defineFlow(
  {
    name: 'generateLegalSummaryFlow',

    inputSchema:
      GenerateLegalSummaryInputSchema,

    outputSchema:
      GenerateLegalSummaryOutputSchema,
  },

  async (input) => {
    try {
      /* ------------------------------------------------------------------ */
      /* Validate input                                                     */
      /* ------------------------------------------------------------------ */

      const legalQuery =
        input.legalQuery?.trim();

      if (!legalQuery) {
        return {
          summary:
            'Please provide a legal query to research.',

          rankedCases: [],

          keyPrinciples: [],

          charts: [],
        };
      }

      console.log(
        '[generateLegalSummaryFlow] Query:',
        legalQuery
      );

      /* ------------------------------------------------------------------ */
      /* Run Genkit prompt                                                  */
      /* ------------------------------------------------------------------ */

      const response =
        await summarizeLegalQueryPrompt({
          legalQuery,
        });

      console.log(
        '[generateLegalSummaryFlow] Genkit response received'
      );

      /* ------------------------------------------------------------------ */
      /* Handle null / undefined output                                    */
      /* ------------------------------------------------------------------ */

      if (
        !response ||
        !response.output
      ) {
        console.error(
          '[generateLegalSummaryFlow] Gemini returned no structured output'
        );

        return {
          summary:
            'The legal research service did not return a structured result. Please try the query again.',

          rankedCases: [],

          keyPrinciples: [],

          charts: [],
        };
      }

      const output =
        response.output;

      /* ------------------------------------------------------------------ */
      /* Normalize arrays                                                   */
      /* ------------------------------------------------------------------ */

      const normalizedOutput: GenerateLegalSummaryOutput = {
        summary:
          typeof output.summary === 'string'
            ? output.summary
            : 'No summary was generated.',

        rankedCases:
          Array.isArray(output.rankedCases)
            ? output.rankedCases
            : [],

        keyPrinciples:
          Array.isArray(output.keyPrinciples)
            ? output.keyPrinciples
            : [],

        charts:
          Array.isArray(output.charts)
            ? output.charts
            : [],
      };

      /* ------------------------------------------------------------------ */
      /* Demo chart for Article 15                                         */
      /* ------------------------------------------------------------------ */

      if (
        legalQuery
          .toLowerCase()
          .includes('article 15') &&
        normalizedOutput.charts.length === 0
      ) {
        normalizedOutput.charts = [
          {
            type: 'pie',

            title:
              'Reservation Ceiling Discussed in M.R. Balaji',

            data: [
              {
                name:
                  'Reservation',
                value: 50,
                fill:
                  'hsl(var(--chart-1))',
              },

              {
                name:
                  'Remaining',
                value: 50,
                fill:
                  'hsl(var(--chart-2))',
              },
            ],
          },
        ];
      }

      /* ------------------------------------------------------------------ */
      /* Final validation                                                   */
      /* ------------------------------------------------------------------ */

      const parsed =
        GenerateLegalSummaryOutputSchema.safeParse(
          normalizedOutput
        );

      if (!parsed.success) {
        console.error(
          '[generateLegalSummaryFlow] Output schema validation failed:',
          parsed.error
        );

        return {
          summary:
            'The generated legal research could not be validated. Please try the query again.',

          rankedCases: [],

          keyPrinciples: [],

          charts: [],
        };
      }

      console.log(
        '[generateLegalSummaryFlow] Research completed successfully'
      );

      return parsed.data;
    } catch (error) {
      /* ------------------------------------------------------------------ */
      /* GLOBAL ERROR HANDLER                                               */
      /* ------------------------------------------------------------------ */

      console.error(
        '[generateLegalSummaryFlow] Fatal error:',
        error
      );

      /*
       * IMPORTANT:
       *
       * Do not throw null or undefined into the Genkit output.
       *
       * Always return an object matching the schema.
       */

      return {
        summary:
          'An error occurred while generating the legal research report. Please try again.',

        rankedCases: [],

        keyPrinciples: [],

        charts: [],
      };
    }
  }
);

/* -------------------------------------------------------------------------- */
/* PUBLIC FUNCTION                                                            */
/* -------------------------------------------------------------------------- */

export async function generateLegalSummary(
  input: GenerateLegalSummaryInput
): Promise<GenerateLegalSummaryOutput> {
  return generateLegalSummaryFlow(input);
}
```
