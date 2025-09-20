
'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSignature, Bot, ClipboardCheck, AlertTriangle, Shield, CheckCircle2, ChevronRight, DraftingCompass, Printer, Pencil, ScanText, FileCheck } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type DraftLegalDocumentOutput } from '@/ai/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { StepwiseLoading, type ProcessingStep } from './StepwiseLoading';


export type DraftResult = DraftLegalDocumentOutput;

interface DraftingModeProps {
    isLoading: boolean;
    result: DraftResult | null;
}

type WorkflowStep = 'draft' | 'review' | 'finalized';

const riskConfig = {
    low: {
        icon: Shield,
        badgeClass: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
        textClass: 'text-green-600',
    },
    medium: {
        icon: AlertTriangle,
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        textClass: 'text-yellow-600',
    },
    high: {
        icon: AlertTriangle,
        badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        textClass: 'text-red-600',
    }
};

const loadingSteps: ProcessingStep[] = [
    { id: 'draft', label: 'Generating Initial Draft', status: 'pending', icon: Pencil },
    { id: 'analyze', label: 'Analyzing Clauses for Risk', status: 'pending', icon: ScanText },
    { id: 'finalize', label: 'Assembling Final Document', status: 'pending', icon: FileCheck },
];

export function DraftingMode({ isLoading, result }: DraftingModeProps) {
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('draft');
    const { toast } = useToast();

    React.useEffect(() => {
        // When a new result comes in, reset the workflow to the start
        if (result) {
            setWorkflowStep('draft');
        }
    }, [result]);

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: "Copied to clipboard!",
            description: "The document text has been copied.",
        });
    }

    const handlePrint = () => {
        if (!result) return;
        const printContent = `
            <style>
                body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.6; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 24px; text-align: center; font-family: 'Playfair Display', serif; }
                pre { white-space: pre-wrap; font-family: 'PT Sans', sans-serif; }
            </style>
            <h1>${result.title}</h1>
            <pre>${result.fullDraft}</pre>
        `;

         try {
            const printWindow = window.open('', '_blank');
            if(printWindow) {
                printWindow.document.write(printContent);
                printWindow.document.close();
                printWindow.print();
                toast({ title: 'Printing...', description: 'Your document is being sent to the printer.' });
            }
        } catch (e) {
            toast({ variant: 'destructive', title: 'Print Failed', description: 'Could not open print dialog.' });
        }
    };

    if (isLoading) {
        return <StepwiseLoading 
                    title="Drafting Document..."
                    description="The AI is generating your legal document. Please wait."
                    initialSteps={loadingSteps}
                />;
    }

    if (!result) {
        return (
            <motion.div
                key="initial"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
                <DraftingCompass className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-headline">AI Document Drafting</h3>
                <p className="text-muted-foreground max-w-md">
                    Select document type, provide a prompt, and set the tone on the left to create a new legal document with AI assistance.
                </p>
            </motion.div>
        );
    }
    
    const workflowSteps = [
        { id: 'draft', label: 'Draft', icon: FileSignature },
        { id: 'review', label: 'Review Clauses', icon: Bot },
        { id: 'finalized', label: 'Finalize', icon: CheckCircle2 },
    ];


    const renderContent = () => {
        switch(workflowStep) {
            case 'review':
                return (
                    <div className="space-y-4">
                        <CardTitle className="font-headline text-xl">Review Clauses</CardTitle>
                        <CardDescription>
                            The AI has analyzed each clause for potential risks. Review the suggestions below.
                        </CardDescription>
                        <ScrollArea className="h-[60vh] p-4 border rounded-lg">
                           <div className="space-y-4">
                                {result.clauses.map((clause, index) => {
                                    const config = riskConfig[clause.risk];
                                    const Icon = config.icon;
                                    return (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card>
                                                <CardHeader className="pb-3">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base font-semibold">{clause.title}</CardTitle>
                                                        <Badge variant="outline" className={cn("capitalize", config.badgeClass)}>
                                                            <Icon className={cn("h-3 w-3 mr-1", config.textClass)} />
                                                            {clause.risk} Risk
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <p className="text-sm text-muted-foreground mb-3" dangerouslySetInnerHTML={{ __html: clause.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                    <Separator className="my-3"/>
                                                    <div className="text-xs p-3 bg-muted/50 rounded-md">
                                                        <p className="font-semibold text-foreground mb-1">AI Risk Explanation:</p>
                                                        <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: clause.riskExplanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                           </div>
                        </ScrollArea>
                    </div>
                );
            case 'finalized':
                 return (
                    <div className="space-y-4">
                        <CardTitle className="font-headline text-xl">Finalized Document</CardTitle>
                         <CardDescription>
                            This is the clean, finalized version of your document. You can copy or print it.
                        </CardDescription>
                        <ScrollArea className="h-[60vh] p-4 border rounded-lg bg-muted/30">
                           <pre className="text-sm whitespace-pre-wrap font-sans">{result.fullDraft}</pre>
                        </ScrollArea>
                        <div className="flex items-center gap-2">
                            <Button onClick={() => handleCopyToClipboard(result.fullDraft)}>
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Copy to Clipboard
                            </Button>
                             <Button variant="outline" onClick={handlePrint}>
                                <Printer className="mr-2 h-4 w-4" />
                                Print to PDF
                            </Button>
                        </div>
                    </div>
                );
            default: // 'draft'
                return (
                    <div className="space-y-4">
                        <CardTitle className="font-headline text-xl">Initial Draft</CardTitle>
                         <CardDescription>
                            Here is the initial AI-generated draft. Proceed to the next steps for analysis and finalization.
                        </CardDescription>
                        <ScrollArea className="h-[60vh] p-4 border rounded-lg">
                           <pre className="text-sm whitespace-pre-wrap font-sans">{result.fullDraft}</pre>
                        </ScrollArea>
                    </div>
                );
        }
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div className="space-y-1">
                        <CardTitle className="font-headline">{result.title}</CardTitle>
                        <CardDescription>Generated Legal Document</CardDescription>
                    </div>
                     <div className="flex items-center gap-2 flex-wrap">
                        {workflowSteps.map((step, index) => (
                            <React.Fragment key={step.id}>
                                <Button 
                                    variant={workflowStep === step.id ? 'default' : 'ghost'}
                                    onClick={() => setWorkflowStep(step.id as WorkflowStep)}
                                    size="sm"
                                    className="flex items-center gap-2"
                                >
                                    <step.icon className="h-4 w-4" />
                                    {step.label}
                                </Button>
                                {index < workflowSteps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                             </React.Fragment>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={workflowStep}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                      {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
