
'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileSignature, 
    Bot, 
    ClipboardCheck, 
    AlertTriangle, 
    Shield, 
    CheckCircle2, 
    ChevronRight, 
    DraftingCompass, 
    Printer,
    Plus,
    Trash2,
    Download,
    RefreshCw,
    Zap,
    Layers,
    Eye,
    Settings,
    X,
    Play,
    Pause,
    SkipForward,
    Search,
    AlertCircle,
    FileCode,
    MessageSquareQuote,
    ClipboardPenLine,
    CircleDot
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type DraftLegalDocumentOutput } from '@/ai/types';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

export type DraftResult = DraftLegalDocumentOutput;

interface DraftingModeProps {
    isLoading: boolean;
    result: DraftResult | null;
    onGenerateDocument?: (prompt: string, documentType: string) => Promise<DraftResult>;
}

type WorkflowStep = 'plan' | 'draft' | 'critique' | 'refine';


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

const severityConfig = {
    info: {
        icon: CircleDot,
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        textClass: 'text-blue-600',
    },
    warning: {
        icon: AlertTriangle,
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        textClass: 'text-yellow-600',
    },
    critical: {
        icon: AlertCircle,
        badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        textClass: 'text-red-600',
    }
};



export function DraftingMode({ isLoading, result, onGenerateDocument }: DraftingModeProps) {
    const { toast } = useToast();
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('plan');
    const [documents, setDocuments] = useState<DraftResult[]>([]);
    const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
    const [clauseSearchTerm, setClauseSearchTerm] = useState("");


    // Add current result to documents when it changes
    useEffect(() => {
        if (result && !documents.find(doc => doc.title === result.title)) {
            const enhancedResult: DraftResult = {
                ...result,
                id: result.id || `doc-${Date.now()}`,
            };
            setDocuments(prev => [...prev, enhancedResult]);
            setActiveDocumentId(enhancedResult.id);
            setWorkflowStep('plan'); // Reset to first step for new document
        }
    }, [result, documents]);

    const activeDocument = activeDocumentId 
        ? documents.find(doc => doc.id === activeDocumentId) || result
        : result;

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    };

    const handleDownloadPDF = async (docToDownload: DraftResult) => {
        if (!docToDownload) return;
        try {
            const formattedContent = docToDownload.fullDraft
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.125rem; font-weight: 600; margin: 16px 0 8px 0;">$1</h3>')
                .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 700; margin: 24px 0 12px 0; border-bottom: 1px solid #ccc; padding-bottom: 8px;">$1</h2>')
                .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.5rem; font-weight: 800; margin: 32px 0 16px 0; border-bottom: 2px solid #333; padding-bottom: 8px;">$1</h1>')
                .replace(/\n/g, '<br />');

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>${docToDownload.title}</title>
                    <style>
                        @page { margin: 1in; size: letter; }
                        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; max-width: 100%; margin: 0; padding: 0; }
                        .document-title { font-size: 24pt; font-weight: bold; text-align: center; margin-bottom: 32px; border-bottom: 3px solid #000; padding-bottom: 16px; }
                        .document-content { text-align: justify; }
                        h1, h2, h3 { page-break-after: avoid; }
                        p { margin-bottom: 12px; orphans: 2; widows: 2; }
                    </style>
                </head>
                <body>
                    <div class="document-title">${docToDownload.title}</div>
                    <div class="document-content">${formattedContent}</div>
                </body>
                </html>
            `;

            // Open print dialog for PDF conversion
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            }
        } catch (e) {
            console.error('PDF generation failed:', e);
            toast({ variant: 'destructive', title: 'PDF Generation Failed', description: 'Could not open print dialog.' });
        }
    };


    const handlePrintReport = () => {
        if (!activeDocument) return;
        const { title, draftingPlan, fullDraft, clauseAnalysis, alternativeClauses, complianceNotes } = activeDocument;

        const printContent = `
            <style>
                body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.5; }
                h1, h2, h3, h4 { font-family: 'Playfair Display', serif; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; }
                h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                h3 { font-size: 16px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }
                p, li { margin-bottom: 8px; }
                .section { margin-bottom: 24px; page-break-inside: avoid; }
                .item { margin-bottom: 12px; padding: 8px; border: 1px solid #f0f0f0; border-radius: 4px; }
                .bold { font-weight: bold; }
                .italic { font-style: italic; }
                .pre { white-space: pre-wrap; font-family: monospace; background: #f9f9f9; padding: 8px; border-radius: 4px;}
                ul { list-style-type: disc; padding-left: 20px; }
            </style>
            <h1>Drafting Report: ${title}</h1>
            
            ${draftingPlan ? `
            <div class="section">
                <h2>Drafting Plan</h2>
                <ul>${draftingPlan.map(step => `<li>${step}</li>`).join('')}</ul>
            </div>` : ''}

            <div class="section">
                <h2>Final Draft</h2>
                <div class="pre">${fullDraft.replace(/\n/g, '<br/>')}</div>
            </div>

            ${clauseAnalysis && clauseAnalysis.length > 0 ? `
            <div class="section">
                <h2>Critique & Clause Analysis</h2>
                ${clauseAnalysis.map(c => `
                    <div class="item">
                        <h3>Clause: ${c.title} <span class="italic bold">(${c.risk} risk)</span></h3>
                        <p><span class="bold">Critique:</span> ${c.critique}</p>
                    </div>
                `).join('')}
            </div>` : ''}

            ${alternativeClauses && alternativeClauses.length > 0 ? `
            <div class="section">
                <h2>Refinement: Alternative Clauses</h2>
                ${alternativeClauses.map(ac => `
                    <div class="item">
                        <h3>Original Clause: ${ac.originalClauseTitle}</h3>
                        <h4>Suggested Alternative:</h4>
                        <div class="pre">${ac.suggestedClause}</div>
                        <p><span class="bold">Reasoning:</span> ${ac.reasoning}</p>
                    </div>
                `).join('')}
            </div>` : ''}

            ${complianceNotes && complianceNotes.length > 0 ? `
             <div class="section">
                <h2>Validation: Compliance Notes</h2>
                <ul>
                ${complianceNotes.map(note => `
                    <li><span class="bold">[${note.severity.toUpperCase()}]:</span> ${note.note}</li>
                `).join('')}
                </ul>
            </div>
            ` : ''}
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


    const removeDocument = (docId: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        if (activeDocumentId === docId) {
            setActiveDocumentId(documents[0]?.id || null);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="animate-pulse space-y-2">
                            <div className="h-6 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-1/2"></div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!activeDocument && documents.length === 0) {
        return (
            <div className="space-y-6">
                <motion.div
                    key="initial"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
                >
                    <DraftingCompass className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold font-headline">AI Document Drafting Suite</h3>
                    <p className="text-muted-foreground max-w-md">
                        Create production-ready legal documents through a structured, multi-step AI workflow.
                    </p>
                </motion.div>
            </div>
        );
    }

    const renderDocumentList = () => {
        if (documents.length === 0) return null;

        return (
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Layers className="h-5 w-5" />
                                Document Collection ({documents.length})
                            </CardTitle>
                            <CardDescription>
                                Manage your drafted documents
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-32">
                        <div className="space-y-2">
                            {documents.map((doc, index) => (
                                <motion.div
                                    key={doc.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={cn(
                                        "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                                        activeDocumentId === doc.id 
                                            ? "bg-primary/10 border-primary" 
                                            : "hover:bg-muted/50"
                                    )}
                                    onClick={() => setActiveDocumentId(doc.id!)}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileSignature className="h-4 w-4 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium text-sm">{doc.title}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeDocument(doc.id!);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        );
    };

    const filteredClauses = activeDocument?.clauseAnalysis?.filter(clause => 
        clause.title.toLowerCase().includes(clauseSearchTerm.toLowerCase()) ||
        clause.critique.toLowerCase().includes(clauseSearchTerm.toLowerCase())
    ) || [];
    
    const renderContent = () => {
        if (!activeDocument) return null;

        switch(workflowStep) {
            case 'plan':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl">Drafting Plan</CardTitle>
                                <CardDescription>
                                    The AI's step-by-step plan to construct the document.
                                </CardDescription>
                            </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg bg-muted/30">
                           <ul className="space-y-2">
                            {activeDocument.draftingPlan.map((step, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-1 flex-shrink-0"/>
                                    <span className="text-sm">{step}</span>
                                </motion.li>
                            ))}
                           </ul>
                        </div>
                    </div>
                );
            case 'draft':
                 return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl">Initial Draft</CardTitle>
                                <CardDescription>
                                    The raw, unformatted output from the AI model.
                                </CardDescription>
                            </div>
                        </div>
                        
                        <ScrollArea className="h-[50vh] p-4 border rounded-lg bg-muted/30">
                           <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{activeDocument.fullDraft}</pre>
                        </ScrollArea>
                    </div>
                );
            case 'critique':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl">AI Critique</CardTitle>
                                <CardDescription>
                                    Clause-by-clause risk assessment and analysis.
                                </CardDescription>
                            </div>
                            <div className="relative w-full max-w-xs">
                                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Search clauses..."
                                    className="pl-10 pr-4 py-2 text-sm border rounded-md bg-background w-full"
                                    value={clauseSearchTerm}
                                    onChange={(e) => setClauseSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <ScrollArea className="h-[50vh] p-1">
                           <div className="space-y-4 pr-4">
                                {filteredClauses.map((clause, index) => {
                                    const config = riskConfig[clause.risk];
                                    const Icon = config.icon;
                                    return (
                                        <motion.div 
                                            key={index}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card className="relative overflow-hidden">
                                                <div className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-1",
                                                    clause.risk === 'high' ? 'bg-red-500' :
                                                    clause.risk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                                )} />
                                                <CardHeader className="pb-3 pl-6">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="text-base font-semibold">{clause.title}</CardTitle>
                                                        <Badge variant="outline" className={cn("capitalize", config.badgeClass)}>
                                                            <Icon className={cn("h-3 w-3 mr-1", config.textClass)} />
                                                            {clause.risk} Risk
                                                        </Badge>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pl-6">
                                                    <div className="text-sm p-3 bg-muted/50 rounded-md">
                                                        <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
                                                            <Bot className="h-3 w-3" />
                                                            AI Critique:
                                                        </p>
                                                        <p className="text-muted-foreground" 
                                                           dangerouslySetInnerHTML={{ __html: clause.critique.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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
            case 'refine':
                 const formattedDraft = activeDocument.fullDraft
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.125rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">$1</h1>');

                 return (
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 space-y-4">
                            <div>
                                <CardTitle className="font-headline text-xl">Refined Document</CardTitle>
                                <CardDescription>
                                    The final, polished document ready for export.
                                </CardDescription>
                            </div>
                            
                            <ScrollArea className="h-[60vh] pr-4">
                                <div 
                                    className="p-6 border rounded-lg bg-gradient-to-br from-background to-muted/20 prose prose-sm max-w-none prose-headings:font-headline leading-relaxed"
                                    style={{ lineHeight: '1.6' }}
                                    dangerouslySetInnerHTML={{ __html: formattedDraft.replace(/\n/g, '<br />') }} 
                                />
                            </ScrollArea>
                        </div>
                        <div className="col-span-1 space-y-4">
                            {activeDocument.alternativeClauses && activeDocument.alternativeClauses.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><MessageSquareQuote className="h-4 w-4"/>Alternative Clauses</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-48 pr-2">
                                            <div className="space-y-3">
                                                {activeDocument.alternativeClauses.map((ac, index) => (
                                                    <div key={index} className="text-xs">
                                                        <p className="font-semibold">{ac.originalClauseTitle}</p>
                                                        <p className="my-1 p-2 rounded bg-muted font-mono">{ac.suggestedClause}</p>
                                                        <p className="italic text-muted-foreground">{ac.reasoning}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                             {activeDocument.complianceNotes && activeDocument.complianceNotes.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-base flex items-center gap-2"><ClipboardPenLine className="h-4 w-4"/>Validation Notes</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-48 pr-2">
                                        <ul className="space-y-3">
                                            {activeDocument.complianceNotes.map((note, index) => {
                                                const config = severityConfig[note.severity];
                                                const Icon = config.icon;
                                                
                                                return (
                                                    <motion.li 
                                                        key={index}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        className="flex items-start gap-3 text-xs p-2 rounded-md"
                                                    >
                                                        <Icon className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.textClass)}/>
                                                        <span className="text-muted-foreground">{note.note}</span>
                                                    </motion.li>
                                                )
                                            })}
                                        </ul>
                                        </ScrollArea>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                );
        }
    };

    const workflowSteps: { id: WorkflowStep, label: string, icon: React.ElementType }[] = [
        { id: 'plan', label: 'Plan', icon: FileCode },
        { id: 'draft', label: 'Draft', icon: FileSignature },
        { id: 'critique', label: 'Critique', icon: Bot },
        { id: 'refine', label: 'Refine', icon: CheckCircle2 },
    ];

    return (
        <div className="space-y-6">
            {/* Document Collection - This can be uncommented if needed later */}
            {/* renderDocumentList() */}

            {activeDocument && (
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <CardTitle className="font-headline flex items-center gap-2">
                                    {activeDocument.title}
                                </CardTitle>
                                <CardDescription>AI-Generated Legal Document</CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDownloadPDF(activeDocument)}
                                >
                                    <Download className="mr-2 h-4 w-4" /> Download PDF
                                </Button>
                                <Button 
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePrintReport}
                                >
                                    <Printer className="mr-2 h-4 w-4" /> Print Full Report
                                </Button>
                            </div>
                        </div>
                        <Separator className="mt-4" />
                         {/* Workflow Navigation */}
                        <div className="flex items-center gap-2 pt-4">
                            {workflowSteps.map((step, index) => (
                                <React.Fragment key={step.id}>
                                    <Button 
                                        variant={workflowStep === step.id ? 'default' : 'ghost'}
                                        onClick={() => setWorkflowStep(step.id)}
                                        size="sm"
                                        className="h-auto px-3 py-1.5"
                                    >
                                        <step.icon className="mr-2 h-4 w-4" /> {step.label}
                                    </Button>
                                    {index < workflowSteps.length - 1 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                </React.Fragment>
                            ))}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={`${workflowStep}-${activeDocumentId}`}
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
            )}
        </div>
    );
}
