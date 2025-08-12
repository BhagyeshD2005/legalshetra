
'use client';

import { FileText, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';

export type DocumentAnalysisResult = {
  summary: string;
};

interface DocumentAnalyzerProps {
    isLoading: boolean;
    result: DocumentAnalysisResult | null;
}

export function DocumentAnalyzer({ isLoading, result }: DocumentAnalyzerProps) {

  if (isLoading) {
    return (
       <Card>
          <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
          </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="space-y-8">
        <AnimatePresence>
          {result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Analysis Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{result.summary}</p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold font-headline">Ready for Analysis</h3>
              <p className="text-muted-foreground max-w-md">
                Upload a legal document or paste text on the left and click "Analyze Document" to get started. The AI can help you summarize key points, identify entities, and more.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
