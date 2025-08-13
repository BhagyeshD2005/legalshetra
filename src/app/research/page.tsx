
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { DocumentReviewMode, type DocumentReviewResult } from '@/components/DocumentReviewMode';
import { ReasoningMode, type ReasoningResult } from '@/components/ReasoningMode';
import { DraftingMode, type DraftResult } from '@/components/DraftingMode';
import { PredictiveAnalyticsMode, type PredictiveAnalyticsResult } from '@/components/PredictiveAnalyticsMode';
import { NegotiationMode, type NegotiationResult } from '@/components/NegotiationMode';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { type GenerateLegalSummaryOutput } from '@/ai/flows/generate-legal-summary';


export type Mode = 'research' | 'analyzer' | 'reasoning' | 'drafting' | 'prediction' | 'negotiation';

export type AnalysisResult = GenerateLegalSummaryOutput | DocumentReviewResult | ReasoningResult | DraftResult | PredictiveAnalyticsResult | NegotiationResult | null;

export default function ResearchPage() {
  const [selectedMode, setSelectedMode] = useState<Mode>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [initialQuery, setInitialQuery] = useState<{ query: string } | undefined>(undefined);

  const handleAnalysisStart = (data?: { query: string }) => {
    setIsLoading(true);
    setAnalysisResult(null);
    if(data && selectedMode === 'research') {
        setInitialQuery(data);
    }
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsLoading(false);
    setInitialQuery(undefined);
  };

  const handleAnalysisError = () => {
    setIsLoading(false);
    setInitialQuery(undefined);
  }

  const renderActiveComponent = () => {
    switch(selectedMode) {
      case 'research':
        return <ResearchClient 
                  isLoading={isLoading} 
                  reportData={analysisResult as GenerateLegalSummaryOutput | null} 
                  onAnalysisComplete={handleAnalysisComplete}
                  onAnalysisStart={handleAnalysisStart}
                  onAnalysisError={handleAnalysisError}
                  initialQuery={initialQuery}
                />;
      case 'analyzer':
        return <DocumentReviewMode isLoading={isLoading} result={analysisResult as DocumentReviewResult | null} />;
      case 'reasoning':
        return <ReasoningMode isLoading={isLoading} result={analysisResult as ReasoningResult | null} />;
      case 'drafting':
        return <DraftingMode isLoading={isLoading} result={analysisResult as DraftResult | null} />;
      case 'prediction':
        return <PredictiveAnalyticsMode isLoading={isLoading} result={analysisResult as PredictiveAnalyticsResult | null} />;
      case 'negotiation':
        return <NegotiationMode isLoading={isLoading} result={analysisResult as NegotiationResult | null} />;
      default:
        return null;
    }
  }

  return (
    <MainLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
            <div className="lg:col-span-1">
                 <ModeSwitcher 
                    selectedMode={selectedMode} 
                    onModeChange={(mode) => {
                        setSelectedMode(mode);
                        setAnalysisResult(null);
                        setInitialQuery(undefined);
                    }}
                    onAnalysisStart={handleAnalysisStart}
                    onAnalysisComplete={handleAnalysisComplete}
                    onAnalysisError={handleAnalysisError}
                 />
            </div>
            <div className="lg:col-span-2">
                {renderActiveComponent()}
            </div>
        </div>
    </MainLayout>
  );
}
