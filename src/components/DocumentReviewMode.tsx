
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { FileText, AlertTriangle, Calendar, ClipboardList, Printer, Check, Copy, Sparkles, Wand2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type Anomaly = {
    clause: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
    improvedClause?: string;
};

type KeyDate = {
    date: string;
    description: string;
};

export type DocumentReviewResult = {
  summary: string;
  anomalies: Anomaly[];
  keyDates: KeyDate[];
};

interface DocumentReviewModeProps {
    isLoading: boolean;
    result: DocumentReviewResult | null;
}

const severityConfig = {
    high: {
        badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        textClass: 'text-red-600',
        icon: AlertTriangle
    },
    medium: {
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        textClass: 'text-yellow-600',
        icon: AlertTriangle
    },
    low: {
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        textClass: 'text-blue-600',
        icon: AlertTriangle
    }
};

const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        toast({ title: 'Copied to clipboard!' });
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
        >
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
    );
};

export function DocumentReviewMode({ isLoading, result }: DocumentReviewModeProps) {
    const { toast } = useToast();

    const handlePrint = () => {
        if (!result) return;
        
        const { summary, anomalies, keyDates } = result;

        const printContent = `
            <style>
                body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.5; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
                h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                p { margin-bottom: 8px; }
                .section { margin-bottom: 24px; }
                .item { margin-bottom: 12px; padding: 8px; border: 1px solid #f0f0f0; border-radius: 4px; }
                .item p { margin: 0; }
                .bold { font-weight: bold; }
                .pre { white-space: pre-wrap; font-family: monospace; }
                .improved-clause { background-color: #f0f8ff; padding: 8px; border-radius: 4px; border: 1px solid #e0efff; }
            </style>
            <h1>Document Review Report</h1>
            
            <div class="section">
                <h2>Overall Summary</h2>
                <p class="pre">${summary}</p>
            </div>
            
            <div class="section">
                <h2>Anomalies & Risks</h2>
                ${anomalies.map(anomaly => `
                    <div class="item">
                        <p><span class="bold">Clause:</span> ${anomaly.clause}</p>
                        <p><span class="bold">Severity:</span> ${anomaly.severity.toUpperCase()}</p>
                        <p><span class="bold">Description:</span> ${anomaly.description}</p>
                        <p><span class="bold">Recommendation:</span> ${anomaly.recommendation}</p>
                        ${anomaly.improvedClause ? `
                            <p class="bold" style="margin-top: 8px;">Suggested Improvement:</p>
                            <div class="improved-clause pre">${anomaly.improvedClause}</div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Key Dates & Timelines</h2>
                ${keyDates.map(kd => `
                    <div class="item">
                        <p><span class="bold">Date:</span> ${kd.date}</p>
                        <p><span class="bold">Description:</span> ${kd.description}</p>
                    </div>
                `).join('')}
            </div>
        `;
        
        try {
            const printWindow = window.open('', '_blank');
            if(printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.print();
                toast({ title: 'Printing...', description: 'Your report is being sent to the printer.' });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Print Failed', description: 'Could not open print dialog.' });
        }
    };


  if (isLoading) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    )
  }
  
  return (
    <div className="space-y-8">
        <AnimatePresence>
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Document Review Report</CardTitle>
                            <CardDescription>An AI-powered analysis of your document.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Report
                        </Button>
                    </div>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Overall Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground" dangerouslySetInnerHTML={{ __html: result.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </CardContent>
              </Card>

              {result.anomalies?.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            Anomalies & Risks
                        </CardTitle>
                        <CardDescription>
                            The AI has identified the following potential issues or unusual terms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {result.anomalies.map((anomaly, index) => {
                             const config = severityConfig[anomaly.severity];
                             const Icon = config.icon;
                             return (
                                <div key={index} className="p-4 border rounded-lg bg-muted/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-foreground">{anomaly.clause}</h4>
                                        <Badge variant="outline" className={cn("capitalize", config.badgeClass)}>
                                            <Icon className={cn("h-3 w-3 mr-1", config.textClass)} />
                                            {anomaly.severity} Risk
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: anomaly.description.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    <Separator className="my-2" />
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">Recommendation:</p>
                                        <p className="text-xs text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: anomaly.recommendation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                    {anomaly.improvedClause && (
                                        <div className="mt-3">
                                            <p className="text-xs font-semibold text-foreground mb-1 flex items-center gap-1"><Wand2 className="h-3 w-3 text-green-500" />Suggested Improvement:</p>
                                            <div className="relative group">
                                                <pre className="text-xs bg-background p-3 rounded-md font-mono whitespace-pre-wrap pr-10">
                                                    {anomaly.improvedClause}
                                                </pre>
                                                <CopyButton text={anomaly.improvedClause} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                             )
                        })}
                    </CardContent>
                </Card>
              )}

              {result.keyDates?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Key Dates & Timelines
                        </CardTitle>
                        <CardDescription>
                            Important dates identified within the document.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.keyDates.map((kd, index) => (
                                <li key={index} className="flex items-center gap-4 p-2 border-b">
                                    <Badge variant="secondary">{kd.date}</Badge>
                                    <span className="text-sm text-muted-foreground">{kd.description}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
              )}


            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold font-headline">Ready for Document Review</h3>
              <p className="text-muted-foreground max-w-md">
                Upload or paste a legal document on the left. The AI will review it for anomalies, highlight risks, and extract key dates to help you analyze it faster.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
