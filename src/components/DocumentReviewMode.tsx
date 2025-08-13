
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Skeleton } from './ui/skeleton';
import { FileText, AlertTriangle, Calendar, ClipboardList } from 'lucide-react';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

type Anomaly = {
    clause: string;
    description: string;
    severity: 'high' | 'medium' | 'low';
    recommendation: string;
};

type KeyDate = {
    date: string;
    description: string;
};

export type DocumentReviewResult = {
  summary: string;
  anomalies: Anomaly[];
  keyDates: KeyDate[];
};

interface DocumentReviewModeProps {
    isLoading: boolean;
    result: DocumentReviewResult | null;
}

const severityConfig = {
    high: {
        badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
        textClass: 'text-red-600',
        icon: AlertTriangle
    },
    medium: {
        badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
        textClass: 'text-yellow-600',
        icon: AlertTriangle
    },
    low: {
        badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
        textClass: 'text-blue-600',
        icon: AlertTriangle
    }
};

export function DocumentReviewMode({ isLoading, result }: DocumentReviewModeProps) {

  if (isLoading) {
    return (
        <div className="space-y-4">
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
             <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
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
              className="space-y-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Overall Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-muted-foreground">{result.summary}</p>
                </CardContent>
              </Card>

              {result.anomalies?.length > 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-primary" />
                            Anomalies & Risks
                        </CardTitle>
                        <CardDescription>
                            The AI has identified the following potential issues or unusual terms.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {result.anomalies.map((anomaly, index) => {
                             const config = severityConfig[anomaly.severity];
                             const Icon = config.icon;
                             return (
                                <div key={index} className="p-4 border rounded-lg bg-muted/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-foreground">{anomaly.clause}</h4>
                                        <Badge variant="outline" className={cn("capitalize", config.badgeClass)}>
                                            <Icon className={cn("h-3 w-3 mr-1", config.textClass)} />
                                            {anomaly.severity} Risk
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3">{anomaly.description}</p>
                                    <Separator className="my-2" />
                                    <div>
                                        <p className="text-xs font-semibold text-foreground">Recommendation:</p>
                                        <p className="text-xs text-muted-foreground italic">{anomaly.recommendation}</p>
                                    </div>
                                </div>
                             )
                        })}
                    </CardContent>
                </Card>
              )}

              {result.keyDates?.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Key Dates & Timelines
                        </CardTitle>
                        <CardDescription>
                            Important dates identified within the document.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {result.keyDates.map((kd, index) => (
                                <li key={index} className="flex items-center gap-4 p-2 border-b">
                                    <Badge variant="secondary">{kd.date}</Badge>
                                    <span className="text-sm text-muted-foreground">{kd.description}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
              )}


            </motion.div>
          ) : (
            <motion.div
              key="initial"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] border-2 border-dashed rounded-lg p-12 text-center bg-gradient-to-br from-card to-muted/20"
            >
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold font-headline">Ready for Document Review</h3>
              <p className="text-muted-foreground max-w-md">
                Upload or paste a legal document on the left. The AI will review it for anomalies, highlight risks, and extract key dates to help you analyze it faster.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}

