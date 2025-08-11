'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { enhanceQueryClarity } from '@/ai/flows/enhance-query-clarity';
import { generateLegalSummary } from '@/ai/flows/generate-legal-summary';
import { useToast } from "@/hooks/use-toast";
import { ReportDisplay } from './ReportDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  RefreshCw,
  BookOpen,
  Zap,
  Lightbulb
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion } from 'framer-motion';

const FormSchema = z.object({
  query: z.string()
    .min(10, { message: 'Please enter a legal query of at least 10 characters.' })
    .max(1000, { message: 'Query must be less than 1000 characters.' })
    .refine(
      (val) => val.trim().length > 0,
      { message: 'Query cannot be empty or contain only whitespace.' }
    ),
});

type FormData = z.infer<typeof FormSchema>;

interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  icon: React.ComponentType<{ className?: string }>;
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 'enhance', label: 'Enhancing query clarity', status: 'pending', icon: Sparkles },
  { id: 'search', label: 'Searching legal databases', status: 'pending', icon: Search },
  { id: 'analyze', label: 'Analyzing case laws', status: 'pending', icon: BookOpen },
  { id: 'generate', label: 'Generating comprehensive report', status: 'pending', icon: FileText },
];

export function ResearchClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>(PROCESSING_STEPS);
  const [report, setReport] = useState<string | null>(null);
  const [enhancedQuery, setEnhancedQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [progressValue, setProgressValue] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { query: '' },
  });

  const resetStates = useCallback(() => {
    setReport(null);
    setError(null);
    setEnhancedQuery('');
    setCurrentStep('');
    setProgressValue(0);
    setEstimatedTime(null);
    setStartTime(Date.now());
    setProcessingSteps(PROCESSING_STEPS.map(step => ({ ...step, status: 'pending' })));
  }, []);

  const updateStepStatus = useCallback((stepId: string, status: ProcessingStep['status']) => {
    setProcessingSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status } : step
    ));
  }, []);

  useEffect(() => {
    if (isLoading && startTime) {
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const completedSteps = processingSteps.filter(step => step.status === 'completed').length;
        const totalSteps = processingSteps.length;
        
        if (completedSteps > 0) {
          const avgTimePerStep = elapsed / completedSteps;
          const remainingSteps = totalSteps - completedSteps;
          setEstimatedTime(Math.ceil(avgTimePerStep * remainingSteps));
        } else {
          setEstimatedTime(45); // Initial estimate
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLoading, startTime, processingSteps]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    resetStates();

    try {
      setCurrentStep('enhance');
      updateStepStatus('enhance', 'active');
      setProgressValue(10);

      const enhanced = await enhanceQueryClarity({ 
        legalQuery: data.query.trim() 
      });
      
      if (signal.aborted) return;

      setEnhancedQuery(enhanced.rephrasedQuery);
      updateStepStatus('enhance', 'completed');
      setProgressValue(25);

      setCurrentStep('search');
      updateStepStatus('search', 'active');
      setProgressValue(40);

      setTimeout(() => {
        if (!signal.aborted) {
          updateStepStatus('search', 'completed');
          updateStepStatus('analyze', 'active');
          setCurrentStep('analyze');
          setProgressValue(65);
        }
      }, 1500);

      setTimeout(() => {
        if (!signal.aborted) {
          updateStepStatus('analyze', 'completed');
          updateStepStatus('generate', 'active');
          setCurrentStep('generate');
          setProgressValue(80);
        }
      }, 3000);

      const result = await generateLegalSummary({ 
        legalQuery: enhanced.rephrasedQuery 
      });

      if (signal.aborted) return;

      updateStepStatus('generate', 'completed');
      setProgressValue(100);
      setReport(result.summary);
      setCurrentStep('completed');

      toast({
        title: "Research completed successfully!",
        description: "Your comprehensive legal report is ready.",
      });

    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }

      console.error('Research error:', error);
      
      const errorMessage = error?.message || 'An unexpected error occurred during research.';
      setError(errorMessage);
      
      if (currentStep) {
        updateStepStatus(currentStep, 'error');
      }

      toast({
        variant: "destructive",
        title: "Research failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
      toast({
        title: "Research cancelled",
        description: "The research process has been stopped.",
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1">
        <Card className="shadow-lg sticky top-24">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle className="font-headline">AI Legal Research</CardTitle>
            </div>
            <CardDescription>
              Enter your legal query to start comprehensive AI-powered research.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Legal Query
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Case laws related to anticipatory bail under Section 438 CrPC' or 'Recent judgments on trademark infringement in e-commerce'"
                          className="min-h-[150px] resize-none focus-visible:ring-2 focus-visible:ring-primary"
                          {...field}
                          disabled={isLoading}
                          maxLength={1000}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/1000
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
                
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    className="flex-1" 
                    disabled={isLoading}
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Researching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Generate Report
                      </>
                    )}
                  </Button>
                  
                  {isLoading && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancel}
                      size="lg"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </Form>

            {!isLoading && !report && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3 text-yellow-500" />
                  Research Tips
                </h4>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Be specific with section numbers and acts.</li>
                  <li>Include jurisdiction if relevant.</li>
                  <li>Mention a time period for recent cases.</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        {error && (
          <Alert variant="destructive" className="mb-6">
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
        )}

        {isLoading && (
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="font-headline flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                  Research in Progress
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {estimatedTime ? `~${formatTime(estimatedTime)} left` : 'Estimating...'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Overall Progress</span>
                  <span className="text-muted-foreground">{progressValue}%</span>
                </div>
                <Progress value={progressValue} className="h-2" />
              </div>

              {enhancedQuery && (
                <div className="p-4 border rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5">
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                    <Sparkles className="h-3 w-3 text-primary" />
                    Enhanced Query
                  </p>
                  <p className="italic text-sm">{enhancedQuery}</p>
                </div>
              )}

              <div className="space-y-3">
                {processingSteps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <motion.div 
                      key={step.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        step.status === 'active' ? 'bg-primary/10 border border-primary/20' :
                        step.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                        step.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                        'bg-muted/30'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <motion.div
                        animate={{
                          rotate: step.status === 'active' ? 360 : 0,
                          scale: step.status === 'completed' ? [1, 1.2, 1] : 1
                        }}
                        transition={{
                          rotate: { repeat: Infinity, duration: 1, ease: 'linear' },
                          scale: { duration: 0.3 }
                        }}
                      >
                        {step.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : step.status === 'error' ? (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        ) : (
                          <Icon className={`h-4 w-4 ${step.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`} />
                        )}
                      </motion.div>
                      
                      <span className={`text-sm font-medium ${
                        step.status === 'completed' ? 'text-green-800 dark:text-green-300' :
                        step.status === 'error' ? 'text-red-800 dark:text-red-300' :
                        step.status === 'active' ? 'text-primary' :
                        'text-muted-foreground'
                      }`}>
                        {step.label}
                      </span>
                      
                      {step.status === 'active' && (
                        <Badge variant="secondary" size="sm">Active</Badge>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              <div className="space-y-3 pt-4">
                <Skeleton className="h-4 w-[85%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
              </div>
            </CardContent>
          </Card>
        )}

        {report && (
          <ReportDisplay 
            report={report} 
            query={enhancedQuery || form.getValues('query')} 
          />
        )}

        {!isLoading && !report && !error && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20">
            <motion.div 
              className="rounded-full bg-primary/10 p-6 mb-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            >
              <FileText className="h-12 w-12 text-primary" />
            </motion.div>
            <h3 className="text-xl font-semibold font-headline mb-2">
              Ready for Legal Research
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md">
              Submit your legal query to begin comprehensive AI-powered research with case law analysis and expert insights.
            </p>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Search className="h-3 w-3" />
                Database Search
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Case Analysis
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Detailed Report
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
