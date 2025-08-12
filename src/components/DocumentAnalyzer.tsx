
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
import { FileSearch, FileText, RefreshCw, Sparkles, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FormSchema = z.object({
  documentText: z.string().min(50, { message: 'Please paste document text of at least 50 characters.' }),
});

type FormData = z.infer<typeof FormSchema>;

export function DocumentAnalyzer() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { documentText: '' },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setAnalysisResult(null);

    // Placeholder for AI call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Analysis Complete (Simulated)",
      description: "This is a placeholder for the real AI analysis.",
    });

    setAnalysisResult("This is a simulated analysis result. The real AI-powered document analysis feature is coming soon!");
    setIsLoading(false);
  };
  
  return (
    <div className="space-y-8">
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Analysis Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{analysisResult}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {!analysisResult && !isLoading && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold font-headline">Ready for Analysis</h3>
              <p className="text-muted-foreground max-w-md">
                Paste a legal document on the left and click "Analyze Document" to get started. The AI can help you summarize key points, identify entities, and more.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
