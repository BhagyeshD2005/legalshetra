
'use server';

/**
 * @fileOverview A Genkit flow to generate a litigation timeline.
 * - generateLitigationTimeline - The main function to create the timeline.
 * - LitigationTimelineInput - The input type for the function.
 * - LitigationTimelineOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { LitigationTimelineInputSchema, LitigationTimelineOutputSchema, type LitigationTimelineInput, type LitigationTimelineOutput } from '@/ai/types';


export async function generateLitigationTimeline(
  input: LitigationTimelineInput
): Promise<LitigationTimelineOutput> {
  return litigationTimelineFlow(input);
}


const timelinePrompt = ai.definePrompt({
  name: 'generateLitigationTimelinePrompt',
  input: { schema: LitigationTimelineInputSchema },
  output: { schema: LitigationTimelineOutputSchema },
  prompt: `You are a legal procedural planning AI. Your task is to generate a procedural litigation timeline based on user inputs. You are NOT a legal advisor. Your output must be structured, clear, and based on standard procedural rules for the given jurisdiction and case type.

**Disclaimer:** You must always start your assumptions list with this disclaimer: "This timeline is a procedural estimate and not legal advice. All dates should be confirmed with official court calendars and counsel."

**Inputs:**
*   Jurisdiction: {{{jurisdiction}}}
*   Case Type: {{{caseType}}}
*   Start Date (Filing/Incident): {{{startDate}}}
*   Known Dates: {{#if knownDates}}"{{{knownDates}}}"{{else}}None provided{{/if}}

**Instructions:**
1.  **Clarification**: If the jurisdiction or start date is missing or ambiguous, you must ask for clarification. For this task, assume the inputs are clear.
2.  **Date Calculation**:
    *   All deadlines must be calculated based on **working days (Monday-Friday)** unless specified otherwise (e.g., "30 calendar days").
    *   Do NOT account for public holidays, as you don't have that data. State this as an assumption.
    *   Use the "Start Date" as the anchor for all initial calculations.
    *   Incorporate any "Known Dates" as fixed milestones in the timeline. Calculate other events relative to these fixed dates where appropriate.
3.  **Output Generation**: Generate the timeline in four distinct sections:
    
    A.  **What’s Due Today**:
        *   Compare the current date with the calculated deadline dates.
        *   List any tasks whose deadline is today.
        *   If nothing is due today, state "No items due today."

    B.  **Timeline Table**:
        *   Create a table with the columns: \`stepNumber\`, \`task\`, \`deadline\`, \`notes\`.
        *   The \`deadline\` must be in YYYY-MM-DD format.
        *   The \`notes\` column should mention dependencies (e.g., "Depends on Step 2: Filing of Plaint").
        *   The timeline should include all major procedural steps from filing to the start of the trial (e.g., Summons, Written Statement, Discovery, Evidence, Framing of Issues).
        
    C.  **Assumptions & Notes**:
        *   List all assumptions made during the calculation. This MUST include the disclaimer from the top of this prompt.
        *   Mention that deadlines are based on working days and do not account for public holidays or specific court orders.

    D.  **Export Content**:
        *   Provide the timeline data in three formats for export:
            1.  \`csv\`: A string in CSV format with a header row.
            2.  \`pdf\`: A string formatted nicely for a PDF document (can be markdown).
            3.  \`text\`: A plain text representation of the timeline.

Your entire output must be a single JSON object matching the specified output schema.`,
});


const litigationTimelineFlow = ai.defineFlow(
  {
    name: 'litigationTimelineFlow',
    inputSchema: LitigationTimelineInputSchema,
    outputSchema: LitigationTimelineOutputSchema,
  },
  async (input) => {

    const { output } = await timelinePrompt(input);
    
    if (!output) {
      throw new Error('The model did not return a valid litigation timeline.');
    }
    
    // In a real app, you might do post-processing here to ensure date accuracy
    // or to format the export content more robustly.
    
    return output;
  }
);
