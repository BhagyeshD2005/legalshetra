
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from "@/hooks/use-toast";
import { BrainCircuit, RefreshCw, Sparkles, Wand2, FileSearch, FileText, Dot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { reasonAboutScenario } from '@/ai/flows/reason-about-scenario';
import { Separator } from './ui/separator';

const FormSchema = z.object({
  scenario: z.string().min(50, { message: 'Please provide a scenario of at least 50 characters.' }),
  question: z.string().min(10, { message: 'Please provide a question of at least 10 characters.' }),
});

type FormData = z.infer<typeof FormSchema>;

interface AnalysisSection {
    title: string;
    points: string[];
}

const parseAnalysis = (analysis: string): AnalysisSection[] => {
    const sections: AnalysisSection[] = [];
    const parts = analysis.split(/\n*##?\s*(?:\d+\.\s*)?/m).filter(p => p.trim());

    parts.forEach(part => {
        const lines = part.trim().split('\n');
        const titleLine = lines.shift() || '';
        const title = titleLine.replace(/:$/, '').trim();
        
        if (title) {
            const points = lines
                .map(line => line.trim().replace(/^\*\s*/, ''))
                .filter(point => point.length > 0);
            
            sections.push({ title, points });
        }
    });

    return sections;
}

export function ReasoningMode() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { scenario: '', question: '' },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        const result = await reasonAboutScenario(data);
        setAnalysisResult(result.analysis);
         toast({
          title: "Analysis Complete",
          description: "The AI has provided a step-by-step reasoning for the scenario.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "An error occurred while analyzing the scenario.",
        });
    }

    setIsLoading(false);
  };
  
  const parsedAnalysis = analysisResult ? parseAnalysis(analysisResult) : [];

  return (
    <div className="space-y-4">
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {parsedAnalysis.length > 0 ? (
                parsedAnalysis.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {section.points.map((point, pIndex) => (
                                    <div key={pIndex} className="flex items-start gap-2">
                                        <Dot className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                                        <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))
              ) : (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Logical Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <p className="whitespace-pre-wrap">{analysisResult}</p>
                    </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {!analysisResult && !isLoading && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
              <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold font-headline">Ready for Analysis</h3>
              <p className="text-muted-foreground max-w-md">
                Provide a detailed scenario and a clear question on the left. The AI will apply legal principles to reason through the problem and provide a structured answer.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
