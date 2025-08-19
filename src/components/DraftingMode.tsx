
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
    SkipForward
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock types - replace with your actual types
export type DraftResult = {
    id?: string;
    title: string;
    fullDraft: string;
    clauses: Array<{
        title: string;
        content: string;
        risk: 'low' | 'medium' | 'high';
        riskExplanation: string;
    }>;
    metadata?: {
        documentType: string;
        wordCount: number;
        estimatedReviewTime: number;
        createdAt: Date;
        lastModified: Date;
    };
};

interface DraftingModeProps {
    isLoading: boolean;
    result: DraftResult | null;
    onGenerateDocument?: (prompt: string, documentType: string) => Promise<DraftResult>;
}

type WorkflowStep = 'draft' | 'review' | 'finalized';

interface AutoDraftingConfig {
    enabled: boolean;
    templates: string[];
    currentTemplateIndex: number;
    interval: number; // seconds
    isRunning: boolean;
}

interface DocumentTemplate {
    id: string;
    name: string;
    prompt: string;
    documentType: string;
    dependencies?: string[]; // IDs of documents this depends on
}

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

const defaultTemplates: DocumentTemplate[] = [
    {
        id: 'nda',
        name: 'Non-Disclosure Agreement',
        prompt: 'Create a comprehensive NDA for business partnerships',
        documentType: 'contract'
    },
    {
        id: 'service-agreement',
        name: 'Service Agreement',
        prompt: 'Draft a professional service agreement template',
        documentType: 'contract'
    },
    {
        id: 'privacy-policy',
        name: 'Privacy Policy',
        prompt: 'Generate a GDPR-compliant privacy policy for web services',
        documentType: 'policy'
    },
    {
        id: 'terms-of-service',
        name: 'Terms of Service',
        prompt: 'Create comprehensive terms of service for digital platform',
        documentType: 'policy'
    }
];

export function DraftingMode({ isLoading, result, onGenerateDocument }: DraftingModeProps) {
    const [workflowStep, setWorkflowStep] = useState<WorkflowStep>('draft');
    const [documents, setDocuments] = useState<DraftResult[]>([]);
    const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
    const [autoDrafting, setAutoDrafting] = useState<AutoDraftingConfig>({
        enabled: false,
        templates: defaultTemplates.map(t => t.id),
        currentTemplateIndex: 0,
        interval: 10,
        isRunning: false
    });
    const [showSettings, setShowSettings] = useState(false);

    // Auto-drafting automation
    useEffect(() => {
        let interval: NodeJS.Timeout;
        
        if (autoDrafting.enabled && autoDrafting.isRunning && onGenerateDocument) {
            interval = setInterval(async () => {
                const template = defaultTemplates[autoDrafting.currentTemplateIndex];
                if (template) {
                    try {
                        const newDoc = await onGenerateDocument(template.prompt, template.documentType);
                        newDoc.id = `${template.id}-${Date.now()}`;
                        setDocuments(prev => [...prev, newDoc]);
                        
                        // Move to next template
                        setAutoDrafting(prev => ({
                            ...prev,
                            currentTemplateIndex: (prev.currentTemplateIndex + 1) % defaultTemplates.length
                        }));
                    } catch (error) {
                        console.error('Auto-drafting failed:', error);
                    }
                }
            }, autoDrafting.interval * 1000);
        }

        return () => clearInterval(interval);
    }, [autoDrafting.enabled, autoDrafting.isRunning, autoDrafting.currentTemplateIndex, autoDrafting.interval, onGenerateDocument]);

    // Add current result to documents when it changes
    useEffect(() => {
        if (result && !documents.find(doc => doc.title === result.title)) {
            const enhancedResult = {
                ...result,
                id: result.id || `doc-${Date.now()}`,
                metadata: {
                    documentType: 'contract',
                    wordCount: result.fullDraft.split(' ').length,
                    estimatedReviewTime: Math.ceil(result.fullDraft.split(' ').length / 200), // 200 words per minute
                    createdAt: new Date(),
                    lastModified: new Date(),
                    ...result.metadata
                }
            };
            setDocuments(prev => [...prev, enhancedResult]);
            setActiveDocumentId(enhancedResult.id);
        }
    }, [result, documents]);

    const activeDocument = activeDocumentId 
        ? documents.find(doc => doc.id === activeDocumentId) || result
        : result;

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Toast would be called here
    };

    const handleDownloadPDF = async (docToDownload: DraftResult) => {
        try {
            // Create a formatted HTML version of the document
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
                        @page {
                            margin: 1in;
                            size: letter;
                        }
                        body {
                            font-family: 'Times New Roman', serif;
                            font-size: 12pt;
                            line-height: 1.6;
                            color: #000;
                            max-width: 100%;
                            margin: 0;
                            padding: 0;
                        }
                        .document-title {
                            font-size: 24pt;
                            font-weight: bold;
                            text-align: center;
                            margin-bottom: 32px;
                            border-bottom: 3px solid #000;
                            padding-bottom: 16px;
                        }
                        .document-content {
                            text-align: justify;
                        }
                        h1, h2, h3 {
                            page-break-after: avoid;
                        }
                        p {
                            margin-bottom: 12px;
                            orphans: 2;
                            widows: 2;
                        }
                        .metadata {
                            font-size: 10pt;
                            color: #666;
                            margin-top: 32px;
                            border-top: 1px solid #ccc;
                            padding-top: 16px;
                        }
                    </style>
                </head>
                <body>
                    <div class="document-title">${docToDownload.title}</div>
                    <div class="document-content">${formattedContent}</div>
                    <div class="metadata">
                        Generated on: ${new Date().toLocaleDateString()}<br>
                        Word Count: ${docToDownload.metadata?.wordCount || docToDownload.fullDraft.split(' ').length} words<br>
                        Document Type: ${docToDownload.metadata?.documentType || 'Legal Document'}
                    </div>
                </body>
                </html>
            `;

            // Create blob and download
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${docToDownload.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
            a.click();
            URL.revokeObjectURL(url);

            // Also trigger print dialog for PDF conversion
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
        }
    };

    const handleDownloadAllPDF = async () => {
        if (documents.length === 0) return;
        
        try {
            const allDocsHTML = documents.map(doc => {
                const formattedContent = doc.fullDraft
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^### (.*$)/gim, '<h3 style="font-size: 18px; font-weight: 600; margin: 16px 0 8px 0;">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 style="font-size: 20px; font-weight: 700; margin: 24px 0 12px 0; border-bottom: 1px solid #ccc; padding-bottom: 8px;">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 style="font-size: 24px; font-weight: 800; margin: 32px 0 16px 0; border-bottom: 2px solid #333; padding-bottom: 8px;">$1</h1>')
                    .replace(/\n/g, '<br />');

                return `
                    <div style="page-break-before: always;">
                        <div style="font-size: 24pt; font-weight: bold; text-align: center; margin-bottom: 32px; border-bottom: 3px solid #000; padding-bottom: 16px;">
                            ${doc.title}
                        </div>
                        <div style="text-align: justify;">
                            ${formattedContent}
                        </div>
                        <div style="font-size: 10pt; color: #666; margin-top: 32px; border-top: 1px solid #ccc; padding-top: 16px;">
                            Generated on: ${new Date().toLocaleDateString()}<br>
                            Word Count: ${doc.metadata?.wordCount || doc.fullDraft.split(' ').length} words<br>
                            Document Type: ${doc.metadata?.documentType || 'Legal Document'}
                        </div>
                    </div>
                `;
            }).join('');

            const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Legal Document Collection</title>
                    <style>
                        @page { margin: 1in; size: letter; }
                        body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #000; margin: 0; padding: 0; }
                        h1, h2, h3 { page-break-after: avoid; }
                        p { margin-bottom: 12px; orphans: 2; widows: 2; }
                    </style>
                </head>
                <body>${allDocsHTML}</body>
                </html>
            `;

            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `legal-documents-collection-${new Date().toISOString().split('T')[0]}.html`;
            a.click();
            URL.revokeObjectURL(url);

            // Open print dialog
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(htmlContent);
                printWindow.document.close();
                setTimeout(() => printWindow.print(), 500);
            }
        } catch (e) {
            console.error('Bulk PDF generation failed:', e);
        }
    };

    const removeDocument = (docId: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== docId));
        if (activeDocumentId === docId) {
            setActiveDocumentId(documents[0]?.id || null);
        }
    };

    const toggleAutoDrafting = () => {
        setAutoDrafting(prev => ({
            ...prev,
            isRunning: !prev.isRunning
        }));
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
                {/* Auto-drafting controls */}
                <Card className="border-dashed">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Zap className="h-5 w-5 text-amber-500" />
                                    Auto Document Drafting
                                </CardTitle>
                                <CardDescription>
                                    Automatically generate multiple legal documents using predefined templates
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowSettings(!showSettings)}
                            >
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {showSettings && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 p-4 border rounded-lg bg-muted/30"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium">Interval (seconds)</label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="300"
                                            value={autoDrafting.interval}
                                            onChange={(e) => setAutoDrafting(prev => ({
                                                ...prev,
                                                interval: parseInt(e.target.value) || 10
                                            }))}
                                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Templates</label>
                                        <div className="mt-1 space-y-1">
                                            {defaultTemplates.map(template => (
                                                <label key={template.id} className="flex items-center gap-2 text-sm">
                                                    <input
                                                        type="checkbox"
                                                        checked={autoDrafting.templates.includes(template.id)}
                                                        onChange={(e) => {
                                                            const templates = e.target.checked
                                                                ? [...autoDrafting.templates, template.id]
                                                                : autoDrafting.templates.filter(t => t !== template.id);
                                                            setAutoDrafting(prev => ({ ...prev, templates }));
                                                        }}
                                                    />
                                                    {template.name}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                        
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={toggleAutoDrafting}
                                variant={autoDrafting.isRunning ? "destructive" : "default"}
                                disabled={!onGenerateDocument || autoDrafting.templates.length === 0}
                            >
                                {autoDrafting.isRunning ? (
                                    <>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Stop Auto-Drafting
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Start Auto-Drafting
                                    </>
                                )}
                            </Button>
                            
                            {autoDrafting.isRunning && (
                                <Badge variant="outline" className="animate-pulse">
                                    <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                                    Next: {defaultTemplates[autoDrafting.currentTemplateIndex]?.name}
                                </Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <motion.div
                    key="initial"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center min-h-[40vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
                >
                    <DraftingCompass className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold font-headline">AI Document Drafting Suite</h3>
                    <p className="text-muted-foreground max-w-md">
                        Create individual documents or use auto-drafting to generate multiple legal documents automatically.
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
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleDownloadAllPDF}
                                disabled={documents.length === 0}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download All as PDF
                            </Button>
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
                                            <p className="text-xs text-muted-foreground">
                                                {doc.metadata?.wordCount} words • {doc.metadata?.documentType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge 
                                            variant="outline" 
                                            className={cn(
                                                "text-xs",
                                                riskConfig[doc.clauses.reduce((highest, clause) => 
                                                    clause.risk === 'high' ? 'high' : 
                                                    (clause.risk === 'medium' && highest !== 'high') ? 'medium' : highest
                                                , 'low')].badgeClass
                                            )}
                                        >
                                            {doc.clauses.reduce((highest, clause) => 
                                                clause.risk === 'high' ? 'high' : 
                                                (clause.risk === 'medium' && highest !== 'high') ? 'medium' : highest
                                            , 'low')} risk
                                        </Badge>
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
    
    const renderContent = () => {
        if (!activeDocument) return null;

        switch(workflowStep) {
            case 'review':
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl">Clause Analysis</CardTitle>
                                <CardDescription>
                                    AI-powered risk assessment for each clause
                                </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-xs">
                                {activeDocument.clauses.length} clauses analyzed
                            </Badge>
                        </div>
                        
                        <ScrollArea className="h-[50vh] p-4 border rounded-lg">
                           <div className="space-y-4">
                                {activeDocument.clauses.map((clause, index) => {
                                    const config = riskConfig[clause.risk];
                                    const Icon = config.icon;
                                    return (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
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
                                                    <p className="text-sm text-muted-foreground mb-3" 
                                                       dangerouslySetInnerHTML={{ __html: clause.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                                    <Separator className="my-3"/>
                                                    <div className="text-xs p-3 bg-muted/50 rounded-md">
                                                        <p className="font-semibold text-foreground mb-1 flex items-center gap-1">
                                                            <Bot className="h-3 w-3" />
                                                            AI Risk Assessment:
                                                        </p>
                                                        <p className="text-muted-foreground" 
                                                           dangerouslySetInnerHTML={{ __html: clause.riskExplanation.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
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
                 const formattedDraft = activeDocument.fullDraft
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.125rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem;">$1</h3>')
                    .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">$1</h2>')
                    .replace(/^# (.*$)/gim, '<h1 style="font-size: 1.5rem; font-weight: 800; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem;">$1</h1>');

                 return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl">Final Document</CardTitle>
                                <CardDescription>
                                    Production-ready document with formatting applied
                                </CardDescription>
                            </div>
                            {activeDocument.metadata && (
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                    <span>{activeDocument.metadata.wordCount} words</span>
                                    <span>•</span>
                                    <span>{activeDocument.metadata.estimatedReviewTime} min read</span>
                                </div>
                            )}
                        </div>
                        
                        <div className="p-6 border rounded-lg bg-gradient-to-br from-background to-muted/20 prose prose-sm max-w-none prose-headings:font-headline leading-relaxed">
                           <div 
                                style={{ lineHeight: '1.6' }}
                                dangerouslySetInnerHTML={{ __html: formattedDraft.replace(/\n/g, '<br />') }} 
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Button onClick={() => handleCopyToClipboard(activeDocument.fullDraft)}>
                                <ClipboardCheck className="mr-2 h-4 w-4" />
                                Copy Text
                            </Button>
                            <Button variant="outline" onClick={() => handleDownloadPDF(activeDocument)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </Button>
                            <Button variant="outline" onClick={() => {
                                const formattedText = activeDocument.fullDraft.replace(/\*\*(.*?)\*\*/g, '$1');
                                const blob = new Blob([formattedText], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${activeDocument.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}>
                                <FileSignature className="mr-2 h-4 w-4" />
                                Download TXT
                            </Button>
                        </div>
                    </div>
                );
            default: // 'draft'
                return (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="font-headline text-xl">Raw Draft</CardTitle>
                                <CardDescription>
                                    Initial AI-generated content ready for review
                                </CardDescription>
                            </div>
                            {activeDocument.metadata && (
                                <Badge variant="outline">
                                    {activeDocument.metadata.documentType}
                                </Badge>
                            )}
                        </div>
                        
                        <ScrollArea className="h-[50vh] p-4 border rounded-lg bg-muted/30">
                           <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{activeDocument.fullDraft}</pre>
                        </ScrollArea>
                        
                        <div className="flex items-center gap-2">
                            <Button 
                                onClick={() => setWorkflowStep('review')}
                                size="sm"
                            >
                                <SkipForward className="mr-2 h-4 w-4" />
                                Quick Review
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Document Collection */}
            {renderDocumentList()}
            
            {/* Auto-drafting Status */}
            {autoDrafting.isRunning && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                    <RefreshCw className="h-4 w-4 animate-spin text-amber-600" />
                    <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        Auto-drafting in progress... Next: {defaultTemplates[autoDrafting.currentTemplateIndex]?.name}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleAutoDrafting}
                        className="ml-auto"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </motion.div>
            )}

            {/* Main Document Viewer */}
            {activeDocument && (
                <Card className="shadow-lg">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div className="space-y-1">
                                <CardTitle className="font-headline flex items-center gap-2">
                                    {activeDocument.title}
                                    {documents.length > 1 && (
                                        <Badge variant="secondary" className="text-xs">
                                            {documents.findIndex(d => d.id === activeDocumentId) + 1} of {documents.length}
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>AI-Generated Legal Document</CardDescription>
                            </div>
                            
                            {/* Workflow Navigation */}
                            <div className="flex items-center gap-2">
                                <Button 
                                    variant={workflowStep === 'draft' ? 'default' : 'outline'}
                                    onClick={() => setWorkflowStep('draft')}
                                    size="sm"
                                >
                                    <FileSignature className="mr-2 h-4 w-4" /> Draft
                                </Button>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <Button 
                                    variant={workflowStep === 'review' ? 'default' : 'outline'}
                                    onClick={() => setWorkflowStep('review')}
                                    size="sm"
                                >
                                    <Bot className="mr-2 h-4 w-4" /> Review
                                </Button>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                <Button 
                                    variant={workflowStep === 'finalized' ? 'default' : 'outline'}
                                    onClick={() => setWorkflowStep('finalized')}
                                    size="sm"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Finalize
                                </Button>
                            </div>
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
