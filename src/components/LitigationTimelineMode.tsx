
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarClock, Download, AlertTriangle, FileText, FileSpreadsheet, FileType } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { type LitigationTimelineOutput } from '@/ai/types';
import { Alert, AlertDescription } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useToast } from '@/hooks/use-toast';

export type LitigationTimelineResult = LitigationTimelineOutput;

interface LitigationTimelineModeProps {
    isLoading: boolean;
    result: LitigationTimelineResult | null;
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

export function LitigationTimelineMode({ isLoading, result }: LitigationTimelineModeProps) {
    const { toast } = useToast();

    const handleExport = (format: 'csv' | 'pdf' | 'text') => {
        if (!result) return;
        const { exportContent } = result;
        const baseFileName = 'Litigation-Timeline';
        
        try {
            switch(format) {
                case 'csv':
                    downloadFile(exportContent.csv, `${baseFileName}.csv`, 'text/csv;charset=utf-8;');
                    break;
                case 'pdf':
                    // PDF generation is complex on the client. We'll use a print-friendly markdown.
                    // For a real app, a library like jsPDF would be used here.
                    const pdfWindow = window.open("", "_blank");
                    pdfWindow?.document.write('<pre>' + exportContent.pdf + '</pre>');
                    pdfWindow?.print();
                    break;
                case 'text':
                     downloadFile(exportContent.text, `${baseFileName}.txt`, 'text/plain;charset=utf-8;');
                    break;
            }
            toast({
                title: "Export Successful",
                description: `Timeline has been prepared as a ${format.toUpperCase()} file.`,
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
                <CalendarClock className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold font-headline">Litigation Timeline Generator</h3>
                <p className="text-muted-foreground max-w-md">
                   Provide jurisdiction, case type, and key dates on the left to generate a procedural timeline. Data is not saved.
                </p>
            </motion.div>
        );
    }

    const { dueToday, timeline, assumptions, exportContent } = result;

    return (
        <div className="space-y-6">
            <AnimatePresence>
                <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-300">
                        <AlertTriangle className="h-4 w-4 !text-yellow-600" />
                        <AlertDescription>
                            Data is temporary and will be lost after this session unless exported. This timeline is a procedural estimate, not legal advice.
                        </AlertDescription>
                    </Alert>

                    {dueToday.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline text-lg">What's Due Today</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="list-disc list-inside space-y-1">
                                    {dueToday.map((task, index) => (
                                        <li key={index} className="text-sm">{task}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Procedural Timeline</CardTitle>
                            <CardDescription>
                                A generated timeline of procedural steps and estimated deadlines.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[80px]">Step</TableHead>
                                            <TableHead>Task / Filing Required</TableHead>
                                            <TableHead className="w-[150px]">Deadline</TableHead>
                                            <TableHead>Notes / Dependencies</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {timeline.map((item) => (
                                            <TableRow key={item.stepNumber}>
                                                <TableCell className="font-medium">{item.stepNumber}</TableCell>
                                                <TableCell>{item.task}</TableCell>
                                                <TableCell>{item.deadline}</TableCell>
                                                <TableCell className="text-xs text-muted-foreground">{item.notes}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-lg">Assumptions & Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                {assumptions.map((note, index) => (
                                    <li key={index}>{note}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2">
                                <Download className="h-5 w-5 text-primary" />
                                Export Timeline
                            </CardTitle>
                            <CardDescription>
                                Download the generated timeline in your preferred format.
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
