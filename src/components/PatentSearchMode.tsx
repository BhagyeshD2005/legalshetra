
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { FileKey, FileText, Bot, ExternalLink, Printer, ChevronRight, AlertTriangle, Lightbulb } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type PatentSearchOutput } from '@/ai/types';
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

export type PatentSearchResult = PatentSearchOutput;

interface PatentSearchModeProps {
    isLoading: boolean;
    result: PatentSearchResult | null;
}

export function PatentSearchMode({ isLoading, result }: PatentSearchModeProps) {
    const { toast } = useToast();

    const handlePrint = () => {
        if (!result) return;

        const { reportSummary, priorArt, keyTechnicalConcepts, recommendations } = result;

        const printContent = `
            <style>
                body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.6; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; font-family: 'Playfair Display', serif; border-bottom: 2px solid #333; padding-bottom: 8px; }
                h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                p { margin-bottom: 8px; }
                .section { margin-bottom: 24px; page-break-inside: avoid; }
                .patent-item { margin-bottom: 16px; padding: 12px; border: 1px solid #f0f0f0; border-radius: 4px; }
                .patent-title { font-size: 14px; font-weight: bold; }
                .bold { font-weight: bold; }
                .italic { font-style: italic; }
                .comparison { background: #f9f9f9; border-left: 3px solid #ccc; padding: 8px; margin-top: 8px; }
                ul { list-style-type: disc; padding-left: 20px; }
            </style>
            <h1>Patent Search Report</h1>
            
            <div class="section">
                <h2>Executive Summary</h2>
                <p class="italic">${reportSummary}</p>
            </div>

             <div class="section">
                <h2>Recommendations & Suggested Improvements</h2>
                <p>${recommendations}</p>
            </div>

            <div class="section">
                <h2>Prior Art Analysis</h2>
                ${priorArt.map(item => `
                    <div class="patent-item">
                        <p class="patent-title">${item.title} (${item.patentId})</p>
                        <p><span class="bold">Publication Date:</span> ${item.publicationDate} | <span class="bold">Relevance:</span> ${item.relevanceScore}%</p>
                        <p><span class="bold">Summary:</span> ${item.summary}</p>
                        <div class="comparison">
                            <p class="bold">Novelty Comparison:</p>
                            <p>${item.noveltyComparison}</p>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Key Technical Concepts</h2>
                <ul>${keyTechnicalConcepts.map(c => `<li>${c}</li>`).join('')}</ul>
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
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-40 w-full" />
                </CardContent>
            </Card>
        )
    }

    if (!result) {
        return (
            <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
                <FileKey className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-headline">Patentability Search Agent</h3>
                <p className="text-muted-foreground max-w-md">
                   Describe your invention on the left to start a prior art search. The AI will analyze existing patents and generate a novelty report.
                </p>
            </motion.div>
        );
    }

    const { reportSummary, priorArt, keyTechnicalConcepts, recommendations } = result;

    return (
        <div className="space-y-6">
            <AnimatePresence>
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
                                    <CardTitle className="font-headline">Patent Search Report</CardTitle>
                                    <CardDescription>An AI-generated analysis of prior art and invention novelty.</CardDescription>
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
                            <CardTitle className="font-headline flex items-center gap-2 text-lg">
                                <FileText className="h-5 w-5 text-primary" />
                                Executive Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground italic" dangerouslySetInnerHTML={{ __html: reportSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </CardContent>
                    </Card>

                    <Card className="border-yellow-500/50 bg-yellow-50/30 dark:bg-yellow-900/10">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg text-yellow-700 dark:text-yellow-400">
                                <Lightbulb className="h-5 w-5" />
                                Recommendations &amp; Suggested Improvements
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-yellow-800/80 dark:text-yellow-200/80" dangerouslySetInnerHTML={{ __html: recommendations.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg">
                                <Bot className="h-5 w-5 text-primary" />
                                Prior Art Analysis
                            </CardTitle>
                            <CardDescription>
                                A ranked list of relevant patents found during the search.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {priorArt.map((item) => (
                                <Card key={item.patentId} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-bold text-md">{item.title}</h4>
                                            <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                <span>{item.patentId}</span>
                                                <Separator orientation="vertical" className="h-4" />
                                                <span>{item.publicationDate}</span>
                                                 <Separator orientation="vertical" className="h-4" />
                                                 <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                                                    View Patent <ExternalLink className="h-3 w-3" />
                                                 </a>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge variant="secondary">{item.relevanceScore}% Relevant</Badge>
                                            <Progress value={item.relevanceScore} className="h-1 mt-1 w-24" />
                                        </div>
                                    </div>
                                    <Separator className="my-3" />
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <h5 className="font-semibold mb-1">Summary</h5>
                                            <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}/>
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded-md">
                                            <h5 className="font-semibold mb-1 flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />Novelty Comparison</h5>
                                            <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.noveltyComparison.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}/>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg">
                                <ChevronRight className="h-5 w-5 text-primary" />
                                Key Technical Concepts
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {keyTechnicalConcepts.map((concept, index) => (
                                    <Badge key={index} variant="outline">{concept}</Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
