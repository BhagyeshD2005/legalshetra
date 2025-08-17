
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Download, AlertTriangle, FileText, FileSpreadsheet, FileType, Clapperboard, Mic, FileQuestion, BadgeCheck, BadgeAlert, Printer } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type AnalyzeEvidenceOutput } from '@/ai/types';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Badge } from './ui/badge';

export type EvidenceAnalysisResult = AnalyzeEvidenceOutput;

interface EvidenceAnalysisModeProps {
    isLoading: boolean;
    result: EvidenceAnalysisResult | null;
}

const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('audio')) return <Mic className="h-4 w-4" />;
    if (fileType.startsWith('video')) return <Clapperboard className="h-4 w-4" />;
    if (fileType.startsWith('image')) return <Camera className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
}

export function EvidenceAnalysisMode({ isLoading, result }: EvidenceAnalysisModeProps) {
    const { toast } = useToast();

    const handlePrint = () => {
        if (!result) return;
        
        const { evidenceSummary, detailedAnalysis, contradictionReport, exportContent } = result;

        const printContent = `
            <style>
                body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.5; }
                h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
                h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
                h3 { font-size: 14px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }
                p { margin-bottom: 8px; }
                .section { margin-bottom: 24px; page-break-inside: avoid; }
                .item { margin-bottom: 12px; padding: 8px; border: 1px solid #f0f0f0; border-radius: 4px; }
                .bold { font-weight: bold; }
                .italic { font-style: italic; }
                table { width: 100%; border-collapse: collapse; margin-top: 12px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                pre { white-space: pre-wrap; background: #f9f9f9; padding: 8px; border-radius: 4px; }
            </style>
            <h1>Evidence Analysis Report</h1>
            
            <div class="section">
                <h2>Evidence Summary</h2>
                <table>
                    <thead><tr><th>File</th><th>Quality</th><th>Summary</th></tr></thead>
                    <tbody>${evidenceSummary.map(item => `<tr><td>${item.fileName}</td><td>${item.quality}</td><td>${item.summary}</td></tr>`).join('')}</tbody>
                </table>
            </div>

            <div class="section">
                <h2>Detailed Analysis</h2>
                ${detailedAnalysis.map(item => `
                    <div>
                        <h3>${item.fileName} (${item.analysisType})</h3>
                        ${item.documentType ? `<p><span class="bold">Document Type:</span> ${item.documentType}</p>` : ''}
                        <h4>${item.analysisType === 'transcript' ? 'Full Transcript' : 'OCR Output'}</h4>
                        <pre>${item.transcript || item.ocrText}</pre>
                        ${item.keyStatements && item.keyStatements.length > 0 ? `
                            <h4>Key Statements</h4>
                            <ul>
                                ${item.keyStatements.map(ks => `<li><span class="bold">(${ks.timestamp})</span> "${ks.statement}" - <span class="italic">${ks.relevance}</span></li>`).join('')}
                            </ul>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
            
            <div class="section">
                <h2>Contradiction Report</h2>
                 <table>
                    <thead><tr><th>Reference</th><th>Original Statement</th><th>Contradicting Source</th><th>Contradicting Statement</th><th>Notes</th></tr></thead>
                    <tbody>${contradictionReport.map(item => `<tr><td>${item.reference}</td><td class="italic">"${item.statement}"</td><td>${item.contradictingSource}</td><td class="italic">"${item.contradictingStatement}"</td><td>${item.notes}</td></tr>`).join('')}</tbody>
                </table>
                ${contradictionReport.length === 0 ? `<p>No contradictions found.</p>` : ''}
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


    const handleExport = (format: 'csv' | 'pdf' | 'text') => {
        if (!result || !result.exportContent) {
             toast({
                variant: 'destructive',
                title: "Export Failed",
                description: "No exportable content available.",
            });
            return;
        };

        const { exportContent } = result;
        const baseFileName = 'Evidence-Analysis-Report';
        
        try {
            switch(format) {
                case 'csv':
                    downloadFile(exportContent.csv, `${baseFileName}.csv`, 'text/csv;charset=utf-8;');
                    break;
                case 'pdf':
                    const pdfWindow = window.open("", "_blank");
                    if(pdfWindow) {
                        pdfWindow.document.write('<pre>' + exportContent.pdf + '</pre>');
                        pdfWindow.print();
                    } else {
                        throw new Error("Could not open print window.");
                    }
                    break;
                case 'text':
                     downloadFile(exportContent.text, `${baseFileName}.txt`, 'text/plain;charset=utf-8;');
                    break;
            }
            toast({
                title: "Export Successful",
                description: `Analysis report has been prepared as a ${format.toUpperCase()} file.`,
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Export Failed",
                description: "There was an error preparing your file for download.",
            });
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
                <Camera className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-headline">Forensic Evidence Analyst</h3>
                <p className="text-muted-foreground max-w-md">
                   Upload multimodal evidence (audio, video, images, documents) on the left. The AI will transcribe, perform OCR, and detect contradictions.
                </p>
            </motion.div>
        );
    }

    const { evidenceSummary, detailedAnalysis, contradictionReport } = result;

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
                                    <CardTitle className="font-headline">Evidence Analysis Report</CardTitle>
                                    <CardDescription>A forensic breakdown of all provided evidence.</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Full Report
                                </Button>
                            </div>
                        </CardHeader>
                    </Card>

                    <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
                        <AlertTriangle className="h-4 w-4 !text-yellow-600" />
                        <AlertDescription>
                            Data is temporary and will be lost after this session unless exported.
                        </AlertDescription>
                    </Alert>

                     <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Evidence Summary</CardTitle>
                            <CardDescription>
                                High-level overview of the uploaded evidence and its quality.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File</TableHead>
                                        <TableHead>Quality</TableHead>
                                        <TableHead>Summary</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {evidenceSummary.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="font-medium flex items-center gap-2">
                                                {getFileIcon(item.fileType)} {item.fileName}
                                            </TableCell>
                                            <TableCell><Badge variant="outline">{item.quality}</Badge></TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{item.summary}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Detailed Analysis</CardTitle>
                            <CardDescription>
                                Transcripts, OCR results, and highlighted statements from the evidence.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue={detailedAnalysis[0]?.fileName}>
                                <TabsList>
                                    {detailedAnalysis.map(item => (
                                         <TabsTrigger key={item.fileName} value={item.fileName}>
                                            {getFileIcon(item.analysisType === 'transcript' && item.transcript ? 'audio' : 'text/plain')} {item.fileName}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {detailedAnalysis.map(item => (
                                    <TabsContent key={item.fileName} value={item.fileName} className="mt-4">
                                        <Card className="bg-muted/30">
                                            <CardHeader>
                                                <CardTitle className="text-base">{item.analysisType === 'transcript' ? 'Full Transcript' : 'OCR Output'}</CardTitle>
                                                {item.documentType && <div className="text-sm text-muted-foreground">Detected Document Type: <Badge variant="secondary">{item.documentType}</Badge></div>}
                                            </CardHeader>
                                            <CardContent>
                                                <pre className="text-sm whitespace-pre-wrap font-sans p-4 bg-background rounded-md max-h-[400px] overflow-y-auto">
                                                    {item.transcript || item.ocrText}
                                                </pre>

                                                {item.keyStatements && item.keyStatements.length > 0 && (
                                                    <>
                                                        <h4 className="font-semibold mt-4 mb-2">Key Statements</h4>
                                                        <div className="space-y-2">
                                                            {item.keyStatements.map((ks, i) => (
                                                                <div key={i} className="p-3 border-l-2 border-primary">
                                                                    <p className="text-sm font-medium">"{ks.statement}"</p>
                                                                    <p className="text-xs text-muted-foreground mt-1">
                                                                        <span className="font-semibold">Timestamp:</span> {ks.timestamp} | <span className="font-semibold">Relevance:</span> {ks.relevance}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <BadgeAlert className="h-5 w-5 text-destructive" />
                                Contradiction Report
                            </CardTitle>
                             <CardDescription>
                                Discrepancies identified between the provided evidence sources.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Original Statement</TableHead>
                                        <TableHead>Contradicting Source</TableHead>
                                        <TableHead>Explanation</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contradictionReport.map((item, index) => (
                                        <TableRow key={index} className="bg-red-50/50 dark:bg-red-900/10">
                                            <TableCell><Badge variant="destructive" className="font-mono">{item.reference}</Badge></TableCell>
                                            <TableCell className="italic">"{item.statement}"</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold">{item.contradictingSource}</span>
                                                    <span className="text-xs text-muted-foreground italic">"{item.contradictingStatement}"</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">{item.notes}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {contradictionReport.length === 0 && <p className="text-center text-muted-foreground p-4">No contradictions found.</p>}
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Download className="h-5 w-5 text-primary" />
                                Export Full Report
                            </CardTitle>
                            <CardDescription>
                                Download the complete analysis in your preferred format.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Button variant="outline" onClick={() => handleExport('csv')}>
                                <FileSpreadsheet className="mr-2 h-4 w-4"/> CSV
                            </Button>
                             <Button variant="outline" onClick={() => handleExport('pdf')}>
                                <FileType className="mr-2 h-4 w-4"/> PDF
                            </Button>
                             <Button variant="outline" onClick={() => handleExport('text')}>
                                <FileText className="mr-2 h-4 w-4"/> Plain Text
                            </Button>
                        </CardContent>
                    </Card>

                </motion.div>
            </AnimatePresence>
        </div>
    );
}
