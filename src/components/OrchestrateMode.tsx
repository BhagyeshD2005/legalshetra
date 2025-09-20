

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
  Timer,
  Lightbulb,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { orchestrateWorkflow } from '@/ai/flows/orchestrate-workflow';
import { type OrchestrationPlanStep, type OrchestrateWorkflowOutput, type AnalyzeJudgmentOutput } from '@/ai/types';
import { Button } from './ui/button';
import { ReportDisplay } from './ReportDisplay';
import { DocumentReviewMode } from './DocumentReviewMode';
import { DraftingMode } from './DraftingMode';
import { PredictiveAnalyticsMode } from './PredictiveAnalyticsMode';
import { NegotiationMode } from './NegotiationMode';
import { CrossExaminationMode } from './CrossExaminationMode';
import { analyzeJudgment } from '@/ai/flows/analyze-judgment';
import { StepwiseLoading, type ProcessingStep } from './StepwiseLoading';

export type OrchestrationResult = OrchestrateWorkflowOutput;

interface OrchestrateModeProps {
  isLoading: boolean;
  result: OrchestrationResult | null;
  onOrchestrationStart: (data: { query: string }) => void;
  onOrchestrationComplete: (result: OrchestrationResult) => void;
  onOrchestrationError: () => void;
  objective?: string;
}

const agentIcons: { [key: string]: React.ElementType } = {
    research: FileSearch,
    draft: DraftingCompass,
    review: FileText,
    predict: TrendingUp,
    negotiate: Handshake,
    'cross-examine': Swords,
    reasoning: BrainCircuit,
    default: Lightbulb,
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
  const { toast } = useToast();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeJudgmentOutput | null>(null);

  const executeOrchestration = useCallback(async (objectiveToRun: string) => {
    setError(null);
    onOrchestrationStart({ query: objectiveToRun });

    try {
      const result = await orchestrateWorkflow({ 
        objective: objectiveToRun,
      });
      onOrchestrationComplete(result);
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
  }, [onOrchestrationStart, onOrchestrationComplete, onOrchestrationError, toast]);
  
  useEffect(() => {
    if (objective && isLoading) {
      executeOrchestration(objective);
    }
    // We only want to run this when the objective is first set
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [objective, isLoading]);
  
  const handleAnalyzeJudgment = async (judgmentText: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeJudgment({ judgmentText });
      setAnalysisResult(result);
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Could not analyze the judgment.",
      });
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }


  const renderStepResult = (step: OrchestrationPlanStep) => {
    if (!step.result) return null;
    if (step.status === 'error') return <p className="text-destructive text-xs">{JSON.stringify(step.result.error)}</p>;

    switch(step.agent) {
        case 'research':
            return <ReportDisplay 
                      reportData={step.result} 
                      query={step.prompt} 
                      onAnalyzeJudgment={handleAnalyzeJudgment}
                      isAnalyzing={isAnalyzing}
                      analysisResult={analysisResult}
                   />;
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

  if (isLoading) {
      const loadingSteps = result?.plan?.map(step => {
        const AgentIcon = agentIcons[step.agent] || agentIcons.default;
        return {
          id: step.step.toString(),
          label: step.summary,
          status: step.status,
          icon: AgentIcon,
        }
      }) || [
        { id: 'plan', label: 'Creating execution plan...', status: 'active', icon: BrainCircuit }
      ];

      return (
        <StepwiseLoading
            title="Orchestration in Progress..."
            description="The AI is executing the multi-agent workflow. Please wait."
            initialSteps={loadingSteps}
        />
      )
  }

  if (!result && !objective) {
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

  const currentPlan = result?.plan || [];

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
                <CardDescription>The AI generated and executed the following plan to achieve your objective.</CardDescription>
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
                                           {step.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                                           {step.status === 'error' && <AlertCircle className="h-5 w-5 text-red-500" />}
                                           {step.status !== 'completed' && step.status !== 'error' && <AgentIcon className="h-5 w-5 text-muted-foreground" />}
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
                    step.status === 'completed' &&
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
