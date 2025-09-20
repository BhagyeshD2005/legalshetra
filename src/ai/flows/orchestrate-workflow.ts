
'use server';

/**
 * @fileOverview A Genkit flow that orchestrates other AI agents to complete a complex legal task.
 * - orchestrateWorkflow - The main function that plans and executes a series of tasks.
 * - OrchestrateWorkflowInput - The input type for the function.
 * - OrchestrateWorkflowOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { 
    OrchestrateWorkflowInputSchema, 
    OrchestrateWorkflowOutputSchema, 
    type OrchestrateWorkflowInput, 
    type OrchestrateWorkflowOutput,
    OrchestrationPlanStepSchema,
} from '@/ai/types';
import { generateLegalSummary } from './generate-legal-summary';
import { draftLegalDocument } from './draft-legal-document';
import { analyzeDocument } from './analyze-document';
import { predictCaseOutcome } from './predict-case-outcome';
import { negotiationSupport } from './negotiation-support';
import { crossExaminationPrep } from './cross-examination-prep';


export async function orchestrateWorkflow(
  input: OrchestrateWorkflowInput
): Promise<OrchestrateWorkflowOutput> {
  
  // 1. Create a plan
  const planPrompt = ai.definePrompt({
    name: 'createOrchestrationPlanPrompt',
    input: { schema: OrchestrateWorkflowInputSchema },
    output: { schema: z.object({ plan: z.array(OrchestrationPlanStepSchema) }) },
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

  const { output: planOutput } = await planPrompt(input);
  if (!planOutput || !planOutput.plan) {
    throw new Error('Could not create a valid workflow plan.');
  }

  const plan = planOutput.plan;
  
  let executionContext = input.objective; // The context that gets passed from step to step
  const results: any[] = [];

  // 2. Execute the plan
  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];

    step.status = 'active';

    try {
      let stepResult: any;
      const stepInput = { ...input, prompt: step.prompt, objective: executionContext };

      switch (step.agent) {
        case 'research':
          stepResult = await generateLegalSummary({ legalQuery: step.prompt });
          break;
        case 'draft':
          // This is a simplified mapping. A real implementation might need more complex logic to map context.
          const draftInput = { documentType: 'contract', tone: 'neutral', jurisdiction: 'generic', prompt: step.prompt };
          stepResult = await draftLegalDocument(draftInput);
          break;
        case 'review':
          stepResult = await analyzeDocument({ documentText: executionContext });
          break;
        case 'predict':
            const predictInput = { caseType: 'civil', jurisdiction: 'generic', judgeName: 'other', caseSummary: step.prompt };
            stepResult = await predictCaseOutcome(predictInput);
            break;
        case 'negotiate':
             const negotiateInput = { currentClause: executionContext, myGoal: step.prompt, opponentPosition: 'Not specified', opponentStyle: 'default', context: 'Not specified' };
            stepResult = await negotiationSupport(negotiateInput);
            break;
        case 'cross-examine':
             const crossExamineInput = { witnessStatement: executionContext, evidenceSummary: step.prompt, myRole: 'prosecution', simulationRole: 'witness' };
            stepResult = await crossExaminationPrep(crossExamineInput);
            break;
        default:
          throw new Error(`Unknown agent: ${step.agent}`);
      }
      
      step.status = 'completed';
      step.result = stepResult;
      
      results.push(stepResult);
      // Update context for the next step. This is a simple implementation.
      // A more advanced version would intelligently merge contexts.
      executionContext += `\n\nResult from step ${step.step}: ${JSON.stringify(stepResult)}`;

    } catch (error: any) {
      step.status = 'error';
      step.result = { error: error.message || 'An unknown error occurred' };
      // Stop execution on failure
      return { plan: plan, finalOutput: "Workflow failed." };
    }
  }

  // 3. Finalize and return
  // A final AI call could be made here to synthesize all results into one cohesive report.
  const finalSummary = `Workflow completed with ${plan.length} steps. The results of each step are included in the plan.`;

  return { plan: plan, finalOutput: finalSummary };
}
