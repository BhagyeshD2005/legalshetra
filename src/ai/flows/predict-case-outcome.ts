
'use server';

/**
 * @fileOverview A Genkit flow for providing probability-based case strategy insights.
 * - predictCaseOutcome - The main function to generate a prediction.
 * - PredictCaseOutcomeInput - The input type for the prediction function.
 * - PredictCaseOutcomeOutput - The return type for the prediction function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { PredictCaseOutcomeInputSchema, PredictCaseOutcomeOutputSchema, type PredictCaseOutcomeInput, type PredictCaseOutcomeOutput } from '@/ai/types';

// Mock database for judge history. In a real app, this would be a real database.
const judgeHistory: Record<string, any> = {
    "justice_a_k_sarma": {
        biasSummary: "Justice Sarma has a slight tendency to favor tenants in rental disputes but is generally neutral in commercial contract cases. He is a strict proceduralist.",
        pastJudgments: [
            { caseName: "Sharma vs Gupta Rentals", outcome: "Pro-Tenant", similarity: "High" },
            { caseName: "MegaCorp vs Innovate Inc", outcome: "Neutral", similarity: "Low" },
        ]
    },
    "justice_r_m_lodha": {
        biasSummary: "Justice Lodha is known for upholding corporate contracts and places a strong emphasis on the written agreement over verbal testimony.",
        pastJudgments: [
            { caseName: "Global Exports vs Local Traders", outcome: "Pro-Contract", similarity: "Medium" },
        ]
    },
    "default": {
        biasSummary: "No specific bias pattern has been detected for the selected judge in the available dataset. The analysis will be based on general legal principles and case type.",
        pastJudgments: []
    }
}


export async function predictCaseOutcome(
  input: PredictCaseOutcomeInput
): Promise<PredictCaseOutcomeOutput> {
  return predictCaseOutcomeFlow(input);
}


const predictPrompt = ai.definePrompt({
  name: 'predictCaseOutcomePrompt',
  input: { schema: PredictCaseOutcomeInputSchema.extend({ judgeHistory: z.any() }) },
  output: { schema: PredictCaseOutcomeOutputSchema },
  prompt: `You are a legal AI with expertise in predictive analytics for the Indian legal system. Your task is to analyze the user's case and provide a probability-based strategy insight.

**Case Details:**
*   Case Type: {{{caseType}}}
*   Jurisdiction: {{{jurisdiction}}}
*   Judge: {{{judgeName}}}
*   Case Summary: {{{caseSummary}}}

**Analysis of Judge's History (from database):**
*   Bias Summary: {{{judgeHistory.biasSummary}}}
*   Relevant Past Judgments:
    {{#each judgeHistory.pastJudgments}}
    *   {{caseName}} (Outcome: {{outcome}}, Similarity: {{similarity}})
    {{/each}}

**Instructions:**
1.  **Estimate Win Probability**: Based on all the provided information, estimate the probability of a favorable outcome for the user. Return a single number between 0 and 100.
2.  **Write Prediction Summary**: Provide a concise summary explaining the factors that influenced your prediction. Mention the case type, jurisdiction, and the judge's history.
3.  **Suggest Legal Strategies**: Propose 2-3 high-level legal strategies with the highest historical success rates for this type of case. For each strategy, provide a predicted success rate (e.g., 60%, 75%).
4.  **Populate Judge Analysis**: Use the provided judge analysis data to populate the output fields. You do not need to generate this yourself; just use what is given.

Provide a complete and structured analysis based on these instructions.`,
});


const predictCaseOutcomeFlow = ai.defineFlow(
  {
    name: 'predictCaseOutcomeFlow',
    inputSchema: PredictCaseOutcomeInputSchema,
    outputSchema: PredictCaseOutcomeOutputSchema,
  },
  async (input) => {
    
    const history = judgeHistory[input.judgeName] || judgeHistory.default;

    const { output } = await predictPrompt({...input, judgeHistory: history});
    
    if (!output) {
      throw new Error('The model did not return a valid prediction.');
    }
    
    // Ensure the generated history matches what we passed in, to avoid hallucination
    output.judgeAnalysis = history;
    
    return output;
  }
);
