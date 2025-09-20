
'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';

export interface ProcessingStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  icon: React.ComponentType<{ className?: string }>;
}

interface StepwiseLoadingProps {
  title: string;
  description: string;
  initialSteps: ProcessingStep[];
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
};

export function StepwiseLoading({ title, description, initialSteps }: StepwiseLoadingProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>(initialSteps);
  const [progressValue, setProgressValue] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState<number | null>(30); // Initial estimate
  const [startTime] = useState<number>(Date.now());
  const activeStepIndex = steps.findIndex(s => s.status === 'active');

  useEffect(() => {
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const activeStepIndex = steps.findIndex(s => s.status === 'active');

    if (activeStepIndex !== -1) {
        const baseProgress = (completedSteps / totalSteps) * 100;
        const stepProgress = 100 / totalSteps;
        // Animate progress within the active step
        setProgressValue(baseProgress + stepProgress * 0.5);
    } else if (completedSteps === totalSteps) {
        setProgressValue(100);
    } else {
        setProgressValue((completedSteps / totalSteps) * 100);
    }
  }, [steps]);
  
  useEffect(() => {
    const interval = setInterval(() => {
        const newSteps = [...steps];
        const currentActiveIndex = newSteps.findIndex(step => step.status === 'active');

        if (currentActiveIndex === -1 && newSteps.every(s => s.status === 'pending')) {
             newSteps[0].status = 'active';
        } else if (currentActiveIndex !== -1 && currentActiveIndex < newSteps.length -1) {
             newSteps[currentActiveIndex].status = 'completed';
             newSteps[currentActiveIndex + 1].status = 'active';
        } else if (currentActiveIndex === newSteps.length - 1) {
             newSteps[currentActiveIndex].status = 'completed';
             clearInterval(interval);
        }
        setSteps(newSteps);

    }, 2000); // Simulate step change every 2 seconds

    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        const completedSteps = steps.filter(step => step.status === 'completed').length;
        
        if (completedSteps > 0) {
          const avgTimePerStep = elapsed / completedSteps;
          const remainingSteps = steps.length - completedSteps;
          setEstimatedTime(Math.ceil(avgTimePerStep * remainingSteps));
        } else {
          setEstimatedTime(30 - Math.floor(elapsed)); // Countdown initial estimate
        }
      }, 1000);

      return () => clearInterval(interval);
  }, [startTime, steps]);


  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
    >
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-headline flex items-center gap-2">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              {title}
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {estimatedTime && estimatedTime > 0 ? `~${formatTime(estimatedTime)} left` : 'Finalizing...'}
            </Badge>
          </div>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">{Math.round(progressValue)}%</span>
            </div>
            <Progress value={progressValue} className="h-2" />
          </div>

          <div className="space-y-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    step.status === 'active' ? 'bg-primary/10 border border-primary/20' :
                    step.status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                    step.status === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                    'bg-muted/30'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <motion.div
                    animate={{
                      rotate: step.status === 'active' ? 360 : 0,
                      scale: step.status === 'completed' ? [1, 1.2, 1] : 1
                    }}
                    transition={{
                      rotate: { repeat: Infinity, duration: 1.5, ease: 'linear' },
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
                    <Badge variant="outline" className="ml-auto">Active</Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
