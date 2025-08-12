
'use client';

import type { Mode, AnalysisResult } from '@/app/research/page';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Separator } from './ui/separator';
import { FileSearch, FileText, BrainCircuit, RefreshCw, Sparkles, Wand2, Search, Lightbulb, Upload, File as FileIcon, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { generateLegalSummary } from '@/ai/flows/generate-legal-summary';
import { reasonAboutScenario } from '@/ai/flows/reason-about-scenario';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { enhanceQueryClarity } from '@/ai/flows/enhance-query-clarity';

interface ModeSwitcherProps {
  selectedMode: Mode;
  onModeChange: (mode: Mode) => void;
  onAnalysisStart: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisError: () => void;
}

const researchFormSchema = z.object({
  query: z.string()
    .min(10, { message: 'Please enter a legal query of at least 10 characters.' })
    .max(1000, { message: 'Query must be less than 1000 characters.' })
});

const analyzerFormSchema = z.object({
  documentText: z.string().optional(),
  file: z.any().optional(),
}).refine(data => data.documentText || data.file, {
    message: "Please either paste text or upload a file.",
    path: ['documentText'], // assign error to a field
});


const reasoningFormSchema = z.object({
  scenario: z.string().min(50, { message: 'Please provide a scenario of at least 50 characters.' }),
  question: z.string().min(10, { message: 'Please provide a question of at least 10 characters.' }),
});


const modes = [
  { value: 'research' as Mode, label: 'AI Legal Research', icon: FileSearch },
  { value: 'analyzer' as Mode, label: 'Document Analyzer', icon: FileText },
  { value: 'reasoning' as Mode, label: 'Reasoning Mode', icon: BrainCircuit },
];

export function ModeSwitcher({ 
    selectedMode, 
    onModeChange, 
    onAnalysisStart,
    onAnalysisComplete,
    onAnalysisError
}: ModeSwitcherProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const researchForm = useForm<z.infer<typeof researchFormSchema>>({
    resolver: zodResolver(researchFormSchema),
    defaultValues: { query: '' },
  });

  const analyzerForm = useForm<z.infer<typeof analyzerFormSchema>>({
    resolver: zodResolver(analyzerFormSchema),
    defaultValues: { documentText: '' },
  });

  const reasoningForm = useForm<z.infer<typeof reasoningFormSchema>>({
    resolver: zodResolver(reasoningFormSchema),
    defaultValues: { scenario: '', question: '' },
  });
  
  const onResearchSubmit: SubmitHandler<z.infer<typeof researchFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
      // The research client will handle its own multi-step flow
      onAnalysisComplete(data);
    } catch(e) {
      console.error(e);
      toast({ variant: "destructive", title: "An error occurred."});
      onAnalysisError();
    }
    setIsSubmitting(false);
  };
  
  const onAnalyzerSubmit: SubmitHandler<z.infer<typeof analyzerFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        // Placeholder for AI call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast({
          title: "Analysis Complete (Simulated)",
          description: "This is a placeholder for the real AI analysis.",
        });

        const result = { summary: "This is a simulated analysis result for the document. The real AI-powered document analysis feature is coming soon!" };
        onAnalysisComplete(result);

    } catch (error) {
        toast({ variant: 'destructive', title: 'Analysis Failed' });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };
  
  const onReasoningSubmit: SubmitHandler<z.infer<typeof reasoningFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await reasonAboutScenario(data);
        onAnalysisComplete(result);
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
        onAnalysisError();
    }
    setIsSubmitting(false);
  };

  const ActiveIcon = modes.find(m => m.value === selectedMode)?.icon;

  const renderForm = () => {
    switch(selectedMode) {
      case 'research':
        return (
            <Form {...researchForm}>
              <form onSubmit={researchForm.handleSubmit(onResearchSubmit)} className="space-y-6">
                <FormField
                  control={researchForm.control}
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
                          disabled={isSubmitting}
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
                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Researching...</>
                               : <><Search className="mr-2 h-4 w-4" /> Start Research</>}
                </Button>
              </form>
            </Form>
        );
      case 'analyzer':
        const selectedFile = analyzerForm.watch('file');
        return (
            <Form {...analyzerForm}>
              <form onSubmit={analyzerForm.handleSubmit(onAnalyzerSubmit)} className="space-y-6">
                <FormField
                  control={analyzerForm.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem>
                       <FormLabel>Upload Document</FormLabel>
                       <FormControl>
                          <div>
                            <Input 
                                type="file"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                  const file = e.target.files?.[0] ?? null;
                                  field.onChange(file);
                                  analyzerForm.setValue('file', file);
                                }}
                                accept=".pdf,.doc,.docx,.txt"
                                disabled={isSubmitting}
                            />
                            <div 
                                className={cn(
                                    "border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors",
                                    selectedFile && "border-solid border-primary/50"
                                )}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {selectedFile ? (
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                            <FileIcon className="h-4 w-4" />
                                            <span>{selectedFile.name}</span>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                analyzerForm.setValue('file', null);
                                                if(fileInputRef.current) fileInputRef.current.value = "";
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <p className="font-medium">Click to upload or drag & drop</p>
                                        <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, or TXT</p>
                                    </div>
                                )}
                            </div>
                          </div>
                       </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                </div>
                
                <FormField
                  control={analyzerForm.control}
                  name="documentText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paste Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the full text of a legal document here..."
                          className="min-h-[150px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
                             : <><Sparkles className="mr-2 h-4 w-4" /> Analyze Document</>}
                </Button>
              </form>
            </Form>
        );
      case 'reasoning':
        return (
            <Form {...reasoningForm}>
              <form onSubmit={reasoningForm.handleSubmit(onReasoningSubmit)} className="space-y-6">
                <FormField
                  control={reasoningForm.control}
                  name="scenario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Scenario</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the factual matrix of the case..."
                          className="min-h-[200px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={reasoningForm.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Is the non-compete clause enforceable under the Indian Contract Act?'"
                          className="min-h-[80px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
                             : <><Wand2 className="mr-2 h-4 w-4" /> Analyze Scenario</>}
                </Button>
              </form>
            </Form>
        );
      default:
        return null;
    }
  }

  const renderFooter = () => {
    if (selectedMode === 'research') {
        return (
            <CardFooter>
                <div className="p-4 bg-muted/50 rounded-lg w-full">
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
            </CardFooter>
        )
    }
    return null;
  }

  return (
    <Card className="shadow-lg sticky top-24">
      <CardContent className="p-4">
        <Select onValueChange={(value) => onModeChange(value as Mode)} defaultValue={selectedMode}>
          <SelectTrigger className="w-full h-11 text-base font-medium">
            <div className="flex items-center gap-3">
              {ActiveIcon && <ActiveIcon className="h-5 w-5" />}
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
        <CardTitle className="font-headline">{modes.find(m => m.value === selectedMode)?.label}</CardTitle>
        <CardDescription>
            {
                selectedMode === 'research' ? 'Enter your legal query to start comprehensive AI-powered research.' :
                selectedMode === 'analyzer' ? 'Upload a document or paste text for an AI-powered analysis.' :
                'Provide a legal scenario and a question for the AI to reason about.'
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderForm()}
      </CardContent>
      {renderFooter()}
    </Card>
  );
}
