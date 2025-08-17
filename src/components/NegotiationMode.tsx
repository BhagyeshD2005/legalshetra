
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Handshake, FileText, Lightbulb, Users, Copy, Check, MessageSquareWarning, Goal, Printer } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type NegotiationSupportOutput } from '@/ai/types';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

export type NegotiationResult = NegotiationSupportOutput;

interface NegotiationModeProps {
    isLoading: boolean;
    result: NegotiationResult | null;
}

export function NegotiationMode({ isLoading, result }: NegotiationModeProps) {
    const { toast } = useToast();

    const handleCopy = (text: string, clauseName: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: `Copied: ${clauseName}`,
            description: "Clause text has been copied to your clipboard.",
        });
    };

    const handlePrint = () => {
        if (!result) return;
        
        const { alternativeClauses, opponentAnalysis, batnaSummary } = result;

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
                .pre { white-space: pre-wrap; font-family: monospace; background: #f9f9f9; padding: 8px; border-radius: 4px;}
            </style>
            <h1>Negotiation Support Report</h1>
            
            <div class="section">
                <h2>Alternative Clauses</h2>
                ${alternativeClauses.map((clause, index) => `
                    <div class="item">
                        <p class="bold">Alternative Clause ${index + 1}</p>
                        <div class="pre">${clause.content}</div>
                        <p><span class="bold">Explanation:</span> ${clause.explanation}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Opponent Analysis</h2>
                <div class="item">
                    <p><span class="bold">Likely Reaction:</span> ${opponentAnalysis.likelyReaction}</p>
                    <p><span class="bold">Acceptance Probability:</span> ${opponentAnalysis.acceptanceProbability}%</p>
                </div>
            </div>
            
            <div class="section">
                <h2>BATNA Summary</h2>
                <p class="italic">${batnaSummary}</p>
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
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
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
                <Handshake className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-headline">Negotiation Assistant</h3>
                <p className="text-muted-foreground max-w-md">
                   Enter your negotiation details on the left to receive AI-powered strategic advice, alternative clauses, and opponent analysis.
                </p>
            </motion.div>
        );
    }

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
                                    <CardTitle className="font-headline">Negotiation Support Report</CardTitle>
                                    <CardDescription>AI-powered strategic advice for your negotiation.</CardDescription>
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
                                <Lightbulb className="h-5 w-5 text-primary" />
                                Alternative Clauses
                            </CardTitle>
                             <CardDescription>
                                The AI suggests these alternative clauses to help you achieve your goal.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {result.alternativeClauses.map((clause, index) => (
                                <div key={index} className="p-4 border rounded-lg bg-muted/30 relative group">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleCopy(clause.content, `Alternative Clause ${index + 1}`)}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                    <p className="font-mono text-xs pr-8">{clause.content}</p>
                                    <Separator className="my-3" />
                                    <p className="text-sm text-muted-foreground italic">
                                        <span className="font-semibold text-foreground not-italic">AI Explanation: </span>
                                        <span dangerouslySetInnerHTML={{ __html: clause.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                             <CardTitle className="font-headline flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Opponent Analysis
                            </CardTitle>
                             <CardDescription>
                                An analysis of your opponent based on the selected negotiation style.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div className="p-4 border rounded-lg bg-muted/30">
                                <h4 className="font-semibold flex items-center gap-2 mb-2">
                                    <MessageSquareWarning className="h-4 w-4"/> Likely Reaction
                                </h4>
                                <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: result.opponentAnalysis.likelyReaction.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                           </div>
                           <div className="p-4 border rounded-lg bg-muted/30">
                                <h4 className="font-semibold mb-3">Acceptance Probability</h4>
                               <Slider
                                    defaultValue={[result.opponentAnalysis.acceptanceProbability]}
                                    max={100}
                                    step={1}
                                    disabled
                                />
                                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>Very Unlikely</span>
                                    <span>Likely</span>
                                    <span>Very Likely</span>
                                </div>
                           </div>
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader>
                             <CardTitle className="font-headline flex items-center gap-2">
                                <Goal className="h-5 w-5 text-primary" />
                                BATNA Summary
                            </CardTitle>
                             <CardDescription>
                                Your Best Alternative to a Negotiated Agreement if this negotiation fails.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/30" dangerouslySetInnerHTML={{ __html: result.batnaSummary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                        </CardContent>
                    </Card>

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
