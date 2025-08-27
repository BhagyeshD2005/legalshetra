
'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrainCircuit, Printer, BookText, Scale, Gavel, ShieldAlert, CheckSquare, ExternalLink, Wand2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { type ReasonAboutScenarioOutput, type AnalyzeJudgmentOutput } from '@/ai/types';
import { analyzeJudgment } from '@/ai/flows/analyze-judgment';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog"

export type ReasoningResult = ReasonAboutScenarioOutput;

interface ReasoningModeProps {
    isLoading: boolean;
    result: ReasoningResult | null;
}

const AnalysisResultDisplay = ({ result }: { result: AnalyzeJudgmentOutput | null }) => {
  if (!result) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-6 w-1/4 mt-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }
  
  const sections = [
    { title: "Facts of the Case", content: result.facts },
    { title: "Issues Framed by the Court", content: result.issues.join('\n- ') },
    { title: "Arguments of the Petitioner", content: result.petitionerArguments },
    { title: "Arguments of the Respondent", content: result.respondentArguments },
    { title: "Decision / Holding", content: result.decision },
    { title: "Ratio Decidendi", content: result.ratioDecidendi },
    { title: "Obiter Dicta", content: result.obiterDicta },
    { title: "Cited Precedents", content: result.citedPrecedents.map(p => `${p.caseName} (${p.treatment})`).join('\n- ') },
    { title: "Practical Impact / Risk Analysis", content: result.impactAnalysis },
  ];

  return (
    <div className="space-y-4 text-sm">
      {sections.map(section => section.content && (
        <div key={section.title}>
          <h4 className="font-semibold text-base mb-1">{section.title}</h4>
          <p className="whitespace-pre-wrap text-muted-foreground">{section.content}</p>
        </div>
      ))}
    </div>
  )
}

const Section = ({ icon: Icon, title, content, delay, children }: { icon: React.ElementType, title: string, content?: string | null, delay: number, children?: React.ReactNode }) => {
    if (!content && !children) return null;

    return (
         <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
        >
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg font-headline flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                   {content && <p className="text-sm text-muted-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />}
                   {children}
                </CardContent>
            </Card>
        </motion.div>
    )
}

export function ReasoningMode({ isLoading, result }: ReasoningModeProps) {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeJudgmentOutput | null>(null);
  
  if (isLoading) {
    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/6" />
                </CardContent>
            </Card>
        </div>
    )
  }

  const handleAnalyzeJudgment = async (judgmentText: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeJudgment({ judgmentText });
      setAnalysisResult(result);
    } catch (error: any) {
       toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: error.message || "Could not analyze the judgment.",
      });
      setAnalysisResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const handlePrint = () => {
    if (!result) return;
    
    const printContent = `
        <style>
            body { font-family: 'PT Sans', sans-serif; font-size: 12px; line-height: 1.5; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 16px; font-family: 'Playfair Display', serif; }
            h2 { font-size: 18px; font-weight: bold; margin-top: 24px; margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            p { margin-bottom: 8px; white-space: pre-wrap; }
            ul { list-style-type: none; padding-left: 0; }
            li { margin-bottom: 8px; }
            a { color: blue; text-decoration: none; }
        </style>
        <h1>Reasoning Analysis Report</h1>
        
        <div class="section">
            <h2>Fact Analysis</h2>
            <p>${result.factAnalysis}</p>
        </div>
        <div class="section">
            <h2>Legal Principles</h2>
            <p>${result.legalPrinciples}</p>
        </div>
         <div class="section">
            <h2>Cited Precedents</h2>
            <ul>
                ${result.citedCases.map(c => `<li><a href="${c.url}">${c.title}</a></li>`).join('')}
            </ul>
        </div>
        <div class="section">
            <h2>Application of Principles to Facts</h2>
            <p>${result.application}</p>
        </div>
        <div class="section">
            <h2>Counter-Arguments</h2>
            <p>${result.counterArguments}</p>
        </div>
        <div class="section">
            <h2>Conclusion</h2>
            <p>${result.conclusion}</p>
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

  return (
    <div className="space-y-4">
        <AnimatePresence>
          {result ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="font-headline">Agentic Reasoning Report</CardTitle>
                            <CardDescription>A step-by-step logical breakdown of the scenario, powered by legal research.</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Report
                        </Button>
                    </div>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                  <Section icon={BookText} title="Fact Analysis" content={result.factAnalysis} delay={0.1} />
                  <Section icon={Gavel} title="Legal Principles" content={result.legalPrinciples} delay={0.2} />
                  
                  {result.citedCases.length > 0 && (
                       <Section icon={Scale} title="Cited Precedents" delay={0.3}>
                           <div className="space-y-2">
                            {result.citedCases.map((c, i) => (
                                <div key={i} className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-md">
                                    <a 
                                        href={c.url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 hover:underline"
                                    >
                                        <span>{c.title}</span>
                                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                    </a>
                                     <Dialog>
                                      <DialogTrigger asChild>
                                        <Button size="sm" variant="ghost" onClick={() => handleAnalyzeJudgment(c.snippet)}>
                                            <Wand2 className="mr-2 h-3 w-3" /> Analyze
                                        </Button>
                                      </DialogTrigger>
                                      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                                        <DialogHeader>
                                          <DialogTitle className="font-headline">Judgment Analysis: {c.title}</DialogTitle>
                                          <DialogDescription>
                                            An AI-generated breakdown of the key components of the judgment.
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="py-4">
                                          <AnalysisResultDisplay result={isAnalyzing ? null : analysisResult} />
                                        </div>
                                        <DialogFooter>
                                          <DialogClose asChild>
                                            <Button type="button" variant="secondary">
                                              Close
                                            </Button>
                                          </DialogClose>
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>
                                </div>
                            ))}
                           </div>
                       </Section>
                  )}

                  <Section icon={CheckSquare} title="Application of Principles to Facts" content={result.application} delay={0.4} />
                  <Section icon={ShieldAlert} title="Counter-Arguments" content={result.counterArguments} delay={0.5} />

                   <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                       <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="text-lg font-headline flex items-center gap-3">
                                    <BrainCircuit className="h-5 w-5 text-primary" />
                                    Conclusion
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-base text-foreground" dangerouslySetInnerHTML={{ __html: result.conclusion.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            </CardContent>
                        </Card>
                   </motion.div>
              </div>
            </div>
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
                Provide a detailed scenario and a clear question on the left. The AI will research relevant law and apply it to reason through the problem.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
