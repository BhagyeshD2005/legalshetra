
'use client';

import type { Mode } from '@/app/research/page';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Separator } from './ui/separator';
import { FileSearch, FileText, BrainCircuit, RefreshCw, Sparkles, Wand2, Search, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { generateLegalSummary } from '@/ai/flows/generate-legal-summary';
import { reasonAboutScenario } from '@/ai/flows/reason-about-scenario';

interface ModeSwitcherProps {
  selectedMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const researchFormSchema = z.object({
  query: z.string()
    .min(10, { message: 'Please enter a legal query of at least 10 characters.' })
    .max(1000, { message: 'Query must be less than 1000 characters.' })
});

const analyzerFormSchema = z.object({
  documentText: z.string().min(50, { message: 'Please paste document text of at least 50 characters.' }),
});

const reasoningFormSchema = z.object({
  scenario: z.string().min(50, { message: 'Please provide a scenario of at least 50 characters.' }),
  question: z.string().min(10, { message: 'Please provide a question of at least 10 characters.' }),
});

const formSchemas = {
  research: researchFormSchema,
  analyzer: analyzerFormSchema,
  reasoning: reasoningFormSchema,
};

const modes = [
  { value: 'research' as Mode, label: 'AI Legal Research', icon: FileSearch },
  { value: 'analyzer' as Mode, label: 'Document Analyzer', icon: FileText },
  { value: 'reasoning' as Mode, label: 'Reasoning Mode', icon: BrainCircuit },
];

export function ModeSwitcher({ selectedMode, onModeChange }: ModeSwitcherProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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
    setIsLoading(true);
    // This will be implemented fully later to show results on the right
    await generateLegalSummary({ legalQuery: data.query });
    toast({ title: "Research Started (WIP)" });
    setIsLoading(false);
  };
  
  const onAnalyzerSubmit: SubmitHandler<z.infer<typeof analyzerFormSchema>> = async (data) => {
    setIsLoading(true);
    // This will be implemented fully later to show results on the right
    await new Promise(res => setTimeout(res, 1000));
    toast({ title: "Analysis Complete (WIP)" });
    setIsLoading(false);
  };
  
  const onReasoningSubmit: SubmitHandler<z.infer<typeof reasoningFormSchema>> = async (data) => {
    setIsLoading(true);
    // This will be implemented fully later to show results on the right
    await reasonAboutScenario(data);
    toast({ title: "Reasoning Complete (WIP)" });
    setIsLoading(false);
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
                <Button type="submit" className="w-full" disabled={isLoading} size="lg">
                    {isLoading ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Researching...</>
                               : <><Search className="mr-2 h-4 w-4" /> Generate Report</>}
                </Button>
              </form>
            </Form>
        );
      case 'analyzer':
        return (
            <Form {...analyzerForm}>
              <form onSubmit={analyzerForm.handleSubmit(onAnalyzerSubmit)} className="space-y-6">
                <FormField
                  control={analyzerForm.control}
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
                  {isLoading ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
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
                          disabled={isLoading}
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
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
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
        <CardTitle className="font-headline">{modes.find(m => m.value === selectedMode)?.label}</CardTitle>
        <CardDescription>
            {
                selectedMode === 'research' ? 'Enter your legal query to start comprehensive AI-powered research.' :
                selectedMode === 'analyzer' ? 'Paste the text of a legal document to get an AI-powered analysis.' :
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
