
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, FileText, Check, AlertTriangle, Scale, Target, Lightbulb, Printer } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type PredictCaseOutcomeOutput } from '@/ai/types';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Pie, Cell, PieChart, RadialBar, RadialBarChart } from 'recharts';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export type PredictiveAnalyticsResult = PredictCaseOutcomeOutput;

interface PredictiveAnalyticsModeProps {
    isLoading: boolean;
    result: PredictiveAnalyticsResult | null;
}

const riskConfig = {
    High: {
        badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    },
    Medium: {
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    },
    Low: {
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    }
};

export function PredictiveAnalyticsMode({ isLoading, result }: PredictiveAnalyticsModeProps) {
    const { toast } = useToast();

    const handlePrint = () => {
        if (!result) return;
        
        const { winProbability, predictionSummary, recommendedStrategies, judgeAnalysis } = result;

        const printContent = `
            <style>
                body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.5; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
                h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                p { margin-bottom: 8px; }
                .section { margin-bottom: 24px; }
                .item { margin-bottom: 12px; padding: 8px; border: 1px solid #f0f0f0; border-radius: 4px; }
                .bold { font-weight: bold; }
                .italic { font-style: italic; }
            </style>
            <h1>Predictive Analytics Report</h1>
            
            <div class="section">
                <h2>Prediction & Strategy</h2>
                <p><span class="bold">Win Probability:</span> ${winProbability}%</p>
                <p><span class="bold">Prediction Summary:</span> ${predictionSummary}</p>
                
                <h3>Recommended Strategies</h3>
                ${recommendedStrategies.map(s => `
                    <div class="item">
                        <p><span class="bold">Strategy:</span> ${s.strategy} (${s.predictedSuccessRate}% success)</p>
                        <p><span class="bold">Justification:</span> ${s.justification}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Judicial Analysis</h2>
                <div class="item">
                    <p><span class="bold">Bias & Pattern Summary:</span> ${judgeAnalysis.biasSummary}</p>
                    <h3>Relevant Past Judgments</h3>
                     ${judgeAnalysis.pastJudgments.length > 0 ? judgeAnalysis.pastJudgments.map(j => `
                        <p>- ${j.caseName} (Outcome: ${j.outcome}, Similarity: ${j.similarity})</p>
                    `).join('') : '<p>No relevant past judgments in the dataset.</p>'}
                </div>
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
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <Skeleton className="h-40 w-40 rounded-full" />
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
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

    if (!result) {
        return (
            <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
                <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-headline">Predictive Case Analytics</h3>
                <p className="text-muted-foreground max-w-md">
                    Provide case details on the left to generate probability-based insights, strategic recommendations, and judicial pattern analysis.
                </p>
            </motion.div>
        );
    }
    
    const chartData = [
        { name: 'Win', value: result.winProbability, fill: 'hsl(var(--success))' },
        { name: 'Loss', value: 100 - result.winProbability, fill: 'hsl(var(--muted))' }
    ];

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
                                    <CardTitle className="font-headline">Predictive Analytics Report</CardTitle>
                                    <CardDescription>An AI-powered analysis of potential case outcomes.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Report
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Prediction & Strategy
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div className="flex flex-col items-center justify-center">
                                 <ChartContainer config={{}} className="mx-auto aspect-square h-full max-h-[250px]">
                                    <RadialBarChart
                                        startAngle={-270}
                                        endAngle={90}
                                        innerRadius="70%"
                                        outerRadius="100%"
                                        barSize={20}
                                        data={[{...chartData[0], endAngle: (result.winProbability / 100) * 360 }]}
                                    >
                                        <RadialBar
                                            background
                                            dataKey="value"
                                            cornerRadius={10}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={<ChartTooltipContent hideLabel />}
                                        />
                                    </RadialBarChart>
                                 </ChartContainer>
                                <p className="text-4xl font-bold text-success mt-[-80px]">{result.winProbability}%</p>
                                <p className="text-lg font-medium text-muted-foreground">Win Probability</p>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Lightbulb className="h-4 w-4"/>Prediction Summary</h4>
                                    <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: result.predictionSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                </div>
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2"><Target className="h-4 w-4"/>Recommended Strategies</h4>
                                    <div className="space-y-2">
                                        {result.recommendedStrategies.map((s, i) => (
                                            <div key={i} className="p-2 border-l-2 border-primary/50 bg-muted/30 rounded-r-md">
                                                <div className="flex justify-between items-center">
                                                    <p className="font-medium text-sm">{s.strategy}</p>
                                                    <Badge variant="secondary">{s.predictedSuccessRate}% Success</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground" dangerouslySetInnerHTML={{ __html: s.justification.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Scale className="h-5 w-5 text-primary" />
                                Judicial Analysis
                            </CardTitle>
                             <CardDescription>
                                Analysis based on historical data for the selected judge.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">Bias & Pattern Summary</h4>
                                <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/20" dangerouslySetInnerHTML={{ __html: result.judgeAnalysis.biasSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </div>

                            {result.judgeAnalysis.pastJudgments.length > 0 && (
                                <div>
                                    <h4 className="font-semibold mb-2 flex items-center gap-2">Relevant Past Judgments</h4>
                                     <div className="space-y-2">
                                        {result.judgeAnalysis.pastJudgments.map((judgment, index) => {
                                            const config = riskConfig[judgment.similarity];
                                            return (
                                                <div key={index} className="p-3 border rounded-lg flex items-center justify-between">
                                                    <div>
                                                        <p className="font-medium">{judgment.caseName}</p>
                                                        <p className="text-sm text-muted-foreground">Outcome: {judgment.outcome}</p>
                                                    </div>
                                                    <Badge variant="outline" className={config.badgeClass}>
                                                        {judgment.similarity} Similarity
                                                    </Badge>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
