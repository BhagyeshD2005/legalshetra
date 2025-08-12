
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
import type { Mode } from '@/app/research/page';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';

const FormSchema = z.object({
  documentText: z.string().min(50, { message: 'Please paste document text of at least 50 characters.' }),
});

type FormData = z.infer<typeof FormSchema>;

interface DocumentAnalyzerProps {
    selectedMode: Mode;
    onModeChange: (mode: Mode) => void;
}

const modes = [
  { value: 'research' as Mode, label: 'AI Legal Research' },
  { value: 'analyzer' as Mode, label: 'Document Analyzer', icon: FileText },
  { value: 'reasoning' as Mode, label: 'Reasoning Mode', icon: BrainCircuit },
];

export function DocumentAnalyzer({ selectedMode, onModeChange }: DocumentAnalyzerProps) {
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
  
  const ActiveIcon = modes.find(m => m.value === selectedMode)?.icon;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
      <div className="lg:col-span-1">
        <Card className="shadow-lg sticky top-24">
         <CardContent className="p-4">
             <Select onValueChange={(value) => onModeChange(value as Mode)} defaultValue={selectedMode}>
                <SelectTrigger className="w-full h-11 text-base font-medium">
                    <div className="flex items-center gap-3">
                        {ActiveIcon && <ActiveIcon className="h-5 w-5 text-primary" />}
                        <SelectValue placeholder="Select a mode..." />
                    </div>
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                    {modes.map(mode => {
                        const Icon = mode.icon;
                        return (
                        <SelectItem key={mode.value} value={mode.value}>
                            <div className="flex items-center gap-2">
                            {Icon && <Icon className="h-4 w-4" />}
                            <span>{mode.label}</span>
                            </div>
                        </SelectItem>
                        );
                    })}
                    </SelectGroup>
                </SelectContent>
            </Select>
          </CardContent>
          <Separator />
          <CardHeader>
            <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline">Document Analyzer</CardTitle>
            </div>
            <CardDescription>
              Paste the text of a legal document to get an AI-powered analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="documentText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Document Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the full text of a legal document here..."
                          className="min-h-[250px] resize-y"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Analyze Document
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
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
    </div>
  );
}
