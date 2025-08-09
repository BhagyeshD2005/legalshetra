'use client';

import { useState } from 'react';
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
import { Loader2, Sparkles, Wand2, Gavel } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const FormSchema = z.object({
  query: z.string().min(10, { message: 'Please enter a legal query of at least 10 characters.' }),
});

type FormData = z.infer<typeof FormSchema>;

export function ResearchClient() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [report, setReport] = useState<string | null>(null);
  const [enhancedQuery, setEnhancedQuery] = useState('');
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: { query: '' },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setIsLoading(true);
    setReport(null);
    setProgress('');
    setEnhancedQuery('');

    try {
      setProgress('Enhancing query for clarity...');
      const enhanced = await enhanceQueryClarity({ legalQuery: data.query });
      setEnhancedQuery(enhanced.rephrasedQuery);
      
      setProgress('Conducting research on IndianKanoon.org...');
      const result = await generateLegalSummary({ legalQuery: enhanced.rephrasedQuery });
      
      setProgress(result.progress);
      setReport(result.summary);

    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to generate the legal report. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      <div className="lg:col-span-1">
        <Card className="shadow-lg sticky top-24">
          <CardHeader>
            <CardTitle className="font-headline">New Research</CardTitle>
            <CardDescription>Enter your legal query to start the research process.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Query</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Case laws related to anticipatory bail under Section 438 CrPC'"
                          className="min-h-[150px] resize-none"
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
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" />
                      Generate Report
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2">
        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Research in Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="font-semibold">{progress || 'Initializing...'}</p>
              </div>
              {enhancedQuery && (
                <div className="p-4 border rounded-md bg-muted/50">
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent"/> Enhanced Query
                    </p>
                    <p className="italic">{enhancedQuery}</p>
                </div>
              )}
              <div className="space-y-2 pt-4">
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[90%]" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[70%]" />
              </div>
            </CardContent>
          </Card>
        )}
        {report && <ReportDisplay report={report} query={enhancedQuery || form.getValues('query')} />}
        {!isLoading && !report && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-card">
                <Gavel className="w-16 h-16 text-muted-foreground/50" />
                <h3 className="mt-4 text-xl font-semibold font-headline">Your legal report will appear here</h3>
                <p className="mt-2 text-sm text-muted-foreground">Submit a query to begin your AI-powered legal research.</p>
            </div>
        )}
      </div>
    </div>
  );
}
