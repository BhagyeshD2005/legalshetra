
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { 
  Component, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight,
  FileSearch,
  FileText,
  BrainCircuit,
  DraftingCompass,
  TrendingUp,
  Handshake,
  Swords,
  Timer
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { orchestrateWorkflow } from '@/ai/flows/orchestrate-workflow';
import { type OrchestrationPlanStep, type OrchestrateWorkflowOutput } from '@/ai/types';
import { Button } from './ui/button';
import { ReportDisplay } from './ReportDisplay';
import { DocumentReviewMode } from './DocumentReviewMode';
import { DraftingMode } from './DraftingMode';
import { PredictiveAnalyticsMode } from './PredictiveAnalyticsMode';
import { NegotiationMode } from './NegotiationMode';
import { CrossExaminationMode } from './CrossExaminationMode';

export type OrchestrationResult = OrchestrateWorkflowOutput;

interface OrchestrateModeProps {
  isLoading: boolean;
  result: OrchestrationResult | null;
  onOrchestrationStart: (data: { query: string }) => void;
  onOrchestrationComplete: (result: OrchestrationResult) => void;
  onOrchestrationError: () => void;
  objective?: string;
}

const agentIcons = {
    research: FileSearch,
    draft: DraftingCompass,
    review: FileText,
    predict: TrendingUp,
    negotiate: Handshake,
    'cross-examine': Swords,
    reasoning: BrainCircuit,
};

export function OrchestrateMode({
    result,
    isLoading,
    onOrchestrationStart,
    onOrchestrationComplete,
    onOrchestrationError,
    objective,
}: OrchestrateModeProps) {
  const [error, setError] = useState<string | null>(null);
  const [currentPlan, setCurrentPlan] = useState<OrchestrationPlanStep[]>(result?.plan || []);
  const { toast } = useToast();

  const handleStepUpdate = useCallback((step: OrchestrationPlanStep) => {
    setCurrentPlan(prevPlan => {
      // Create a new array for the new state
      const newPlan = [...prevPlan];
      const stepIndex = newPlan.findIndex(s => s.step === step.step);
      if (stepIndex !== -1) {
        // If step exists, update it
        newPlan[stepIndex] = step;
      } else {
        // If step is new, add it (handles race condition where plan isn't set yet)
        newPlan.push(step);
        newPlan.sort((a,b) => a.step - b.step);
      }
      return newPlan;
    });
  }, []);


  const executeOrchestration = useCallback(async (objectiveToRun: string) => {
    setError(null);
    setCurrentPlan([]); // Clear previous plan
    onOrchestrationStart({ query: objectiveToRun });
    
    // Show a generic "Planning..." state.
    setCurrentPlan([{ step: 1, agent: 'research', prompt: '', summary: "Creating execution plan...", status: 'active', result: null }]);


    try {
      const result = await orchestrateWorkflow({ objective: objectiveToRun }, handleStepUpdate);
      onOrchestrationComplete(result);
      setCurrentPlan(result.plan);
      toast({
        title: "Orchestration Complete",
        description: "The AI workflow has finished successfully.",
      });

    } catch (err: any) {
      console.error("Orchestration failed:", err);
      setError(err.message || "An unexpected error occurred during orchestration.");
      onOrchestrationError();
       toast({
        variant: "destructive",
        title: "Orchestration Failed",
        description: err.message || "The workflow could not be completed.",
      });
    }
  }, [onOrchestrationStart, onOrchestrationComplete, onOrchestrationError, toast, handleStepUpdate]);
  
  useEffect(() => {
    if (objective && isLoading) {
      executeOrchestration(objective);
    }
    // We only want to run this when the objective is first set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective]);

  useEffect(() => {
    if (result?.plan) {
      setCurrentPlan(result.plan);
    }
  }, [result]);

  const renderStepResult = (step: OrchestrationPlanStep) => {
    if (!step.result) return null;
    if (step.status === 'error') return <p className="text-destructive text-xs">{JSON.stringify(step.result.error)}</p>;

    switch(step.agent) {
        case 'research':
            return <ReportDisplay reportData={step.result} query={step.prompt} />;
        case 'review':
            return <DocumentReviewMode isLoading={false} result={step.result} />;
        case 'draft':
            return <DraftingMode isLoading={false} result={step.result} />;
        case 'predict':
            return <PredictiveAnalyticsMode isLoading={false} result={step.result} />;
        case 'negotiate':
            return <NegotiationMode isLoading={false} result={step.result} />;
        case 'cross-examine':
            return <CrossExaminationMode isLoading={false} result={step.result} />;
        default:
            return <pre className="text-xs bg-muted p-2 rounded-md">{JSON.stringify(step.result, null, 2)}</pre>;
    }
  }

  if (isLoading && currentPlan.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
              </CardContent>
          </Card>
      );
  }

  if (!isLoading && !result && !objective) {
    return (
        <motion.div
            key="initial"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
        >
            <Component className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold font-headline">Orchestrate AI Agents</h3>
            <p className="text-muted-foreground max-w-md">
                Describe your complex legal task on the left. The AI will create and execute a workflow, coordinating multiple specialized agents to achieve your goal.
            </p>
        </motion.div>
    );
  }

  return (
    <div className="space-y-8">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                   <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setError(null)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline">Workflow Execution Plan</CardTitle>
                <CardDescription>The AI has generated the following plan to achieve your objective. Status is updated in real-time.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {currentPlan.map((step, index) => {
                        const AgentIcon = agentIcons[step.agent] || Timer;
                        const isLastStep = index === currentPlan.length - 1;
                        return (
                            <div key={step.step}>
                                <div className="flex items-start gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className={`flex items-center justify-center rounded-full border-2 h-10 w-10 
                                            ${step.status === 'active' ? 'border-primary animate-pulse' : ''}
                                            ${step.status === 'completed' ? 'border-green-500 bg-green-50' : ''}
                                            ${step.status === 'error' ? 'border-red-500 bg-red-50' : ''}
                                            ${step.status === 'pending' ? 'border-muted-foreground' : ''}
                                        `}>
                                           {step.status === 'active' && <RefreshCw className="h-5 w-5 text-primary animate-spin" />}
                                           {step.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                           {step.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                           {step.status === 'pending' && <AgentIcon className="h-5 w-5 text-muted-foreground" />}
                                        </div>
                                        {!isLastStep && <div className="w-px h-8 bg-border" />}
                                    </div>
                                    <div className="flex-1 pt-1.5">
                                        <p className="font-semibold">Step {step.step}: {step.summary}</p>
                                        <p className="text-sm text-muted-foreground capitalize">Agent: {step.agent}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>

        {result && (
            <div className="space-y-4">
                <h3 className="text-xl font-headline">Execution Results</h3>
                {result.plan.map(step => (
                    <Card key={`result-${step.step}`}>
                        <CardHeader>
                            <CardTitle className="text-lg">Result from Step {step.step}: {step.summary}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {renderStepResult(step)}
                        </CardContent>
                    </Card>
                ))}
            </div>
        )}
    </div>
  );
}
