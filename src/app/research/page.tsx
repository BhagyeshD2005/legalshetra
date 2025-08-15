
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { DocumentReviewMode, type DocumentReviewResult } from '@/components/DocumentReviewMode';
import { ReasoningMode, type ReasoningResult } from '@/components/ReasoningMode';
import { DraftingMode, type DraftResult } from '@/components/DraftingMode';
import { PredictiveAnalyticsMode, type PredictiveAnalyticsResult } from '@/components/PredictiveAnalyticsMode';
import { NegotiationMode, type NegotiationResult } from '@/components/NegotiationMode';
import { CrossExaminationMode, type CrossExaminationResult } from '@/components/CrossExaminationMode';
import { OrchestrateMode, type OrchestrationResult } from '@/components/OrchestrateMode';
import { LitigationTimelineMode, type LitigationTimelineResult } from '@/components/LitigationTimelineMode';
import { EvidenceAnalysisMode, type EvidenceAnalysisResult } from '@/components/EvidenceAnalysisMode';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { type GenerateLegalSummaryOutput } from '@/ai/flows/generate-legal-summary';


export type Mode = 'research' | 'analyzer' | 'reasoning' | 'drafting' | 'prediction' | 'negotiation' | 'cross-examination' | 'orchestrate' | 'timeline' | 'evidence';

export type AnalysisResult = GenerateLegalSummaryOutput | DocumentReviewResult | ReasoningResult | DraftResult | PredictiveAnalyticsResult | NegotiationResult | CrossExaminationResult | OrchestrationResult | LitigationTimelineResult | EvidenceAnalysisResult | null;

export default function ResearchPage() {
  const [selectedMode, setSelectedMode] = useState<Mode>('evidence');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);
  const [initialQuery, setInitialQuery] = useState<{ query: string } | undefined>(undefined);
  const [orchestrationObjective, setOrchestrationObjective] = useState<string | undefined>(undefined);

  const handleAnalysisStart = (data?: { query: string }) => {
    setIsLoading(true);
    setAnalysisResult(null);
    setOrchestrationObjective(undefined);
    if(data && selectedMode === 'research') {
        setInitialQuery(data);
    }
    if (data && selectedMode === 'orchestrate') {
      setOrchestrationObjective(data.query);
    }
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsLoading(false);
    setInitialQuery(undefined);
    // Do not clear orchestration objective, so the result view can use it.
  };

  const handleAnalysisError = () => {
    setIsLoading(false);
    setInitialQuery(undefined);
    setOrchestrationObjective(undefined);
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
      case 'cross-examination':
        return <CrossExaminationMode isLoading={isLoading} result={analysisResult as CrossExaminationResult | null} />;
      case 'orchestrate':
        return <OrchestrateMode 
                    isLoading={isLoading} 
                    result={analysisResult as OrchestrationResult | null}
                    onOrchestrationStart={handleAnalysisStart}
                    onOrchestrationComplete={handleAnalysisComplete}
                    onOrchestrationError={handleAnalysisError}
                    objective={orchestrationObjective}
                />;
      case 'timeline':
        return <LitigationTimelineMode isLoading={isLoading} result={analysisResult as LitigationTimelineResult | null} />;
      case 'evidence':
        return <EvidenceAnalysisMode isLoading={isLoading} result={analysisResult as EvidenceAnalysisResult | null} />;
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
                        setOrchestrationObjective(undefined);
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
