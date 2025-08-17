
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Dot, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export type ReasoningResult = {
  analysis: string;
}

interface ReasoningModeProps {
    isLoading: boolean;
    result: ReasoningResult | null;
}

interface AnalysisSection {
    title: string;
    points: string[];
}

const parseAnalysis = (analysis: string): AnalysisSection[] => {
    const sections: AnalysisSection[] = [];
    const parts = analysis.split(/\n*##?\s*(?:\d+\.\s*)?/m).filter(p => p.trim());

    parts.forEach(part => {
        const lines = part.trim().split('\n');
        const titleLine = lines.shift() || '';
        const title = titleLine.replace(/:$/, '').trim();
        
        if (title) {
            const points = lines
                .map(line => line.trim().replace(/^\*\s*/, ''))
                .filter(point => point.length > 0);
            
            sections.push({ title, points });
        }
    });

    // Fallback for when the splitting doesn't work
    if (sections.length === 0 && analysis.trim()) {
      return [{ title: "Logical Analysis", points: analysis.trim().split('\n').map(p => p.trim().replace(/^\*\s*/, '')) }]
    }

    return sections;
}

export function ReasoningMode({ isLoading, result }: ReasoningModeProps) {
  const { toast } = useToast();
  
  if (isLoading) {
    return (
       <Card>
          <CardHeader>
              <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <br/>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/6" />
          </CardContent>
      </Card>
    )
  }

  const parsedAnalysis = result?.analysis ? parseAnalysis(result.analysis) : [];

  const handlePrint = () => {
    if (!result || !parsedAnalysis.length) return;
    
    const printContent = `
        <style>
            body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.5; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
            h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            ul { list-style-type: disc; padding-left: 20px; }
            li { margin-bottom: 8px; }
        </style>
        <h1>Reasoning Analysis Report</h1>
        
        ${parsedAnalysis.map(section => `
            <div class="section">
                <h2>${section.title}</h2>
                <ul>
                    ${section.points.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
        `).join('')}
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

  return (
    <div className="space-y-4">
        <AnimatePresence>
          {result && parsedAnalysis.length > 0 ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Reasoning Analysis Report</CardTitle>
                            <CardDescription>A step-by-step logical breakdown of the scenario.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Report
                        </Button>
                    </div>
                </CardHeader>
              </Card>

              {parsedAnalysis.map((section, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg font-headline">{section.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {section.points.map((point, pIndex) => (
                                    <div key={pIndex} className="flex items-start gap-2">
                                        <Dot className="h-4 w-4 mt-1 flex-shrink-0 text-primary" />
                                        <p className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: point.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
              <BrainCircuit className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold font-headline">Ready for Analysis</h3>
              <p className="text-muted-foreground max-w-md">
                Provide a detailed scenario and a clear question on the left. The AI will apply legal principles to reason through the problem and provide a structured answer.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
