
'use server';

/**
 * @fileOverview A Genkit flow for providing AI-powered negotiation support.
 * - negotiationSupport - The main function to generate negotiation insights.
 * - NegotiationSupportInput - The input type for the function.
 * - NegotiationSupportOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { NegotiationSupportInputSchema, NegotiationSupportOutputSchema, type NegotiationSupportInput, type NegotiationSupportOutput } from '@/ai/types';

// Mock database for opponent negotiation styles. In a real app, this would be more complex.
const opponentStyles: Record<string, any> = {
    "aggressive": {
        description: "Tends to start with extreme positions and concede slowly. Responds well to data-driven arguments but can be dismissive of emotional appeals. Low initial acceptance probability.",
        initialAcceptance: 25,
    },
    "collaborative": {
        description: "Focuses on finding mutually beneficial outcomes (win-win). Open to creative solutions and transparent discussions. High initial acceptance probability for reasonable offers.",
        initialAcceptance: 70,
    },
    "compromising": {
        description: "Eager to find a fair middle ground and may split the difference. Aims to close the deal quickly and may make concessions too readily. Medium initial acceptance probability.",
        initialAcceptance: 55,
    },
    "avoiding": {
        description: "Dislikes confrontation and may postpone difficult decisions. May not engage substantively with proposals until a deadline is imminent. Unpredictable acceptance probability.",
        initialAcceptance: 40,
    },
    "default": {
        description: "General negotiation principles will be applied as no specific style is selected. The model will assume a moderately rational opponent.",
        initialAcceptance: 50,
    }
}


export async function negotiationSupport(
  input: NegotiationSupportInput
): Promise<NegotiationSupportOutput> {
  return negotiationSupportFlow(input);
}


const negotiationPrompt = ai.definePrompt({
  name: 'negotiationSupportPrompt',
  input: { schema: NegotiationSupportInputSchema.extend({ opponentStyle: z.any() }) },
  output: { schema: NegotiationSupportOutputSchema },
  prompt: `You are an expert legal negotiation AI assistant. Your task is to analyze a negotiation scenario and provide strategic advice.

**Negotiation Context:**
*   My Position/Goal: {{{myGoal}}}
*   Opponent's Likely Position: {{{opponentPosition}}}
*   Key Clause/Issue Under Negotiation: 
    \`\`\`
    {{{currentClause}}}
    \`\`\`
*   Context: {{{context}}}

**Opponent Profile (from database):**
*   Style: {{{opponentStyle.description}}}
*   Initial Acceptance Probability Estimate: {{{opponentStyle.initialAcceptance}}}%

**Instructions:**
1.  **Suggest Alternative Clauses**: Based on my goal, generate 2-3 alternative versions of the key clause. For each, explain how it serves my interest and why it might be acceptable to the opponent.
2.  **Analyze Opponent's Position**: Based on the provided opponent profile, analyze their likely reaction to my position.
3.  **Generate BATNA Summary**: Provide a concise summary of my Best Alternative to a Negotiated Agreement (BATNA). What is my best course of action if this negotiation fails?

Provide a complete and structured response.`,
});


const negotiationSupportFlow = ai.defineFlow(
  {
    name: 'negotiationSupportFlow',
    inputSchema: NegotiationSupportInputSchema,
    outputSchema: NegotiationSupportOutputSchema,
  },
  async (input) => {
    
    const style = opponentStyles[input.opponentStyle] || opponentStyles.default;

    const { output } = await negotiationPrompt({...input, opponentStyle: style});
    
    if (!output) {
      throw new Error('The model did not return valid negotiation advice.');
    }
    
    // Ensure the generated analysis matches what we passed in, to avoid hallucination
    output.opponentAnalysis.acceptanceProbability = style.initialAcceptance;
    
    return output;
  }
);

