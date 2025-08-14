
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, MessageCircleWarning, Lightbulb, Users, UserCheck } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type CrossExaminationPrepOutput } from '@/ai/types';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';


export type CrossExaminationResult = CrossExaminationPrepOutput;

interface CrossExaminationModeProps {
    isLoading: boolean;
    result: CrossExaminationResult | null;
}

export function CrossExaminationMode({ isLoading, result }: CrossExaminationModeProps) {

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
                                        <p className="text-xs text-muted-foreground mt-1">{item.explanation}</p>
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
                                            <span className="font-semibold">Purpose: </span>{item.purpose}
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
                                        <p className="font-semibold text-foreground">Argument: <span className="font-normal text-muted-foreground">{item.argument}</span></p>
                                        <Separator className="my-2" />
                                        <p className="font-semibold text-foreground">Suggested Response: <span className="font-normal text-muted-foreground">{item.response}</span></p>
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
                                            <p>{line.line}</p>
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
