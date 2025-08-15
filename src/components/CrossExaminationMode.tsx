
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, MessageCircleWarning, Lightbulb, Users, UserCheck, Printer } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type CrossExaminationPrepOutput } from '@/ai/types';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';


export type CrossExaminationResult = CrossExaminationPrepOutput;

interface CrossExaminationModeProps {
    isLoading: boolean;
    result: CrossExaminationResult | null;
}

export function CrossExaminationMode({ isLoading, result }: CrossExaminationModeProps) {
    const { toast } = useToast();

    const handlePrint = () => {
        if (!result) return;
        
        const { inconsistencies, strategicQuestions, opposingArguments, rolePlaySimulation } = result;

        const printContent = `
            <style>
                body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.5; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
                h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                p { margin-bottom: 8px; }
                .section { margin-bottom: 24px; }
                .item { margin-bottom: 12px; padding: 8px; border: 1px solid #f0f0f0; border-radius: 4px; }
                .item p { margin: 0; }
                .italic { font-style: italic; }
                .bold { font-weight: bold; }
                .dialogue { margin-left: 20px; }
            </style>
            <h1>Cross-Examination Preparation Report</h1>
            
            <div class="section">
                <h2>Identified Inconsistencies</h2>
                ${inconsistencies.map(item => `
                    <div class="item">
                        <p class="italic">"${item.statementText}"</p>
                        <hr style="margin: 8px 0;" />
                        <p><span class="bold">Contradicts with:</span> ${item.contradictingEvidence}</p>
                        <p><span class="bold">Explanation:</span> ${item.explanation}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <h2>Strategic Questions</h2>
                ${strategicQuestions.map(item => `
                    <div class="item">
                        <p class="bold">Question:</p>
                        <p>${item.question}</p>
                        <p class="bold" style="margin-top: 8px;">Purpose:</p>
                        <p>${item.purpose}</p>
                    </div>
                `).join('')}
            </div>

            <div class="section">
                <h2>Opposing Counsel's Arguments</h2>
                ${opposingArguments.map(item => `
                    <div class="item">
                        <p class="bold">Argument:</p>
                        <p>${item.argument}</p>
                        <p class="bold" style="margin-top: 8px;">Suggested Response:</p>
                        <p>${item.response}</p>
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <h2>Role-Play Simulation</h2>
                ${rolePlaySimulation.map(line => `
                    <p class="dialogue"><span class="bold">${line.speaker}:</span> ${line.line}</p>
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
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
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
                <Swords className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-headline">Cross-Examination Prep</h3>
                <p className="text-muted-foreground max-w-md">
                   Provide witness statements and evidence on the left. The AI will help you find inconsistencies, generate strategic questions, and simulate scenarios.
                </p>
            </motion.div>
        );
    }

    const { inconsistencies, strategicQuestions, opposingArguments, rolePlaySimulation } = result;

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
                                    <CardTitle className="font-headline">Cross-Examination Report</CardTitle>
                                    <CardDescription>A complete breakdown for your preparation.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Report
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    {inconsistencies.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <MessageCircleWarning className="h-5 w-5 text-destructive" />
                                    Identified Inconsistencies
                                </CardTitle>
                                <CardDescription>
                                    Potential contradictions between the witness statement and your evidence.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {inconsistencies.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-lg bg-muted/30">
                                        <p className="text-sm text-muted-foreground italic">"{item.statementText}"</p>
                                        <Separator className="my-2" />
                                        <p className="text-sm">
                                            <span className="font-semibold text-foreground">Contradicts with: </span> {item.contradictingEvidence}.
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1" dangerouslySetInnerHTML={{ __html: item.explanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {strategicQuestions.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5 text-yellow-500" />
                                    Strategic Questions
                                </CardTitle>
                                <CardDescription>
                                   A list of questions to ask the witness, along with their strategic purpose.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {strategicQuestions.map((item, index) => (
                                    <div key={index} className="p-3 border-l-2 border-primary">
                                        <p className="font-medium">{item.question}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            <span className="font-semibold">Purpose: </span>
                                            <span dangerouslySetInnerHTML={{ __html: item.purpose.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                    
                    {opposingArguments.length > 0 && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                   Opposing Counsel's Arguments
                                </CardTitle>
                                <CardDescription>
                                   Anticipated arguments from the other side and how to respond.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {opposingArguments.map((item, index) => (
                                    <div key={index} className="p-4 border rounded-lg">
                                        <p className="font-semibold text-foreground">Argument: <span className="font-normal text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.argument.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /></p>
                                        <Separator className="my-2" />
                                        <p className="font-semibold text-foreground">Suggested Response: <span className="font-normal text-muted-foreground" dangerouslySetInnerHTML={{ __html: item.response.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /></p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {rolePlaySimulation.length > 0 && (
                         <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2">
                                    <UserCheck className="h-5 w-5 text-green-500" />
                                   Role-Play Simulation
                                </CardTitle>
                                <CardDescription>
                                   A sample of the simulated cross-examination.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {rolePlaySimulation.map((line, index) => (
                                    <div key={index} className={cn("flex gap-2", line.speaker === 'You' ? "justify-end" : "justify-start")}>
                                        {line.speaker !== 'You' && <Badge variant="secondary">{line.speaker}</Badge>}
                                        <div className={cn("max-w-md rounded-lg px-3 py-2 text-sm", line.speaker === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                                            <p dangerouslySetInnerHTML={{ __html: line.line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </div>
                                         {line.speaker === 'You' && <Badge>{line.speaker}</Badge>}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
