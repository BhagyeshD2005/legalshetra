
'use server';

/**
 * @fileOverview A Genkit flow that orchestrates other AI agents to complete a complex legal task.
 * - createWorkflowPlan - A function that creates a plan to execute a series of tasks.
 * - executeWorkflowStep - A function that executes a single step from the plan.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    OrchestrateWorkflowInputSchema, 
    OrchestrationPlanSchema,
    OrchestrateStepInputSchema,
    type OrchestrateWorkflowInput, 
    type OrchestrationPlan,
    type OrchestrateStepInput
} from '@/ai/types';
import { generateLegalSummary } from './generate-legal-summary';
import { draftLegalDocument } from './draft-legal-document';
import { analyzeDocument } from './analyze-document';
import { predictCaseOutcome } from './predict-case-outcome';
import { negotiationSupport } from './negotiation-support';
import { crossExaminationPrep } from './cross-examination-prep';


/**
 * Creates a step-by-step plan for the AI to follow.
 */
export async function createWorkflowPlan(
  input: OrchestrateWorkflowInput
): Promise<OrchestrationPlan> {
  const planPrompt = ai.definePrompt({
    name: 'createOrchestrationPlanPrompt',
    input: { schema: OrchestrateWorkflowInputSchema },
    output: { schema: OrchestrationPlanSchema },
    prompt: `You are a master legal workflow orchestrator. Your job is to analyze a user's high-level objective and break it down into a logical sequence of tasks that other AI agents can perform.

User Objective: "{{{objective}}}"

Available Agents and their capabilities:
- 'research': Use when the user needs to find case law, statutes, or legal precedents. Input is a query.
- 'draft': Use when the user wants to create a new legal document. Input is a detailed prompt for the document.
- 'review': Use when the user wants to analyze an existing document for risks, anomalies, or key dates. Input is the document text.
- 'predict': Use for predictive analytics about a case outcome. Input is a case summary.
- 'negotiate': Use for negotiation support, such as generating alternative clauses. Input is the negotiation context.
- 'cross-examine': Use to prepare for cross-examination by finding inconsistencies and generating questions. Input is a witness statement and evidence.

Based on the user's objective, create a JSON plan of the steps to take. For each step, provide:
- 'step': A unique number for the step order.
- 'agent': The name of the agent to use (from the list above).
- 'prompt': A detailed prompt or input that will be passed to the agent.
- 'status': The initial status, which should always be 'pending'.
- 'summary': A short, user-friendly description of what this step will accomplish.

Ensure the prompt for each step is self-contained and has enough detail for the designated agent to perform its task effectively. The output of one step will be used as context for the next.
`,
  });

  const { output } = await planPrompt(input);
  if (!output || !output.plan) {
    throw new Error('Could not create a valid workflow plan.');
  }

  return output;
}


/**
 * Executes a single step of a workflow plan.
 */
export async function executeWorkflowStep(input: OrchestrateStepInput): Promise<any> {
    const { step, context } = input;
    
    let stepResult: any;
    
    try {
        const stepInput = { ...input, prompt: step.prompt, objective: context };
        
        switch (step.agent) {
            case 'research':
            stepResult = await generateLegalSummary({ legalQuery: step.prompt });
            break;
            case 'draft':
            const draftInput = { documentType: 'contract', tone: 'neutral', jurisdiction: 'generic', prompt: step.prompt };
            stepResult = await draftLegalDocument(draftInput);
            break;
            case 'review':
            stepResult = await analyzeDocument({ documentText: context });
            break;
            case 'predict':
                const predictInput = { caseType: 'civil', jurisdiction: 'generic', judgeName: 'other', caseSummary: step.prompt };
                stepResult = await predictCaseOutcome(predictInput);
                break;
            case 'negotiate':
                const negotiateInput = { currentClause: context, myGoal: step.prompt, opponentPosition: 'Not specified', opponentStyle: 'default', context: 'Not specified' };
                stepResult = await negotiationSupport(negotiateInput);
                break;
            case 'cross-examine':
                const crossExamineInput = { witnessStatement: context, evidenceSummary: step.prompt, myRole: 'prosecution', simulationRole: 'witness' };
                stepResult = await crossExaminationPrep(crossExamineInput);
                break;
            default:
            throw new Error(`Unknown agent: ${step.agent}`);
        }

        return stepResult;

    } catch (error: any) {
        console.error(`Error in step ${step.step} (${step.agent}):`, error);
        throw new Error(`Execution failed for step ${step.step}: ${error.message}`);
    }
}
