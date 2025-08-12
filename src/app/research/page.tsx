
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { DocumentAnalyzer, type DocumentAnalysisResult } from '@/components/DocumentAnalyzer';
import { ReasoningMode, type ReasoningResult } from '@/components/ReasoningMode';
import { ModeSwitcher } from '@/components/ModeSwitcher';
import { type GenerateLegalSummaryOutput } from '@/ai/flows/generate-legal-summary';

export type Mode = 'research' | 'analyzer' | 'reasoning';

export type AnalysisResult = GenerateLegalSummaryOutput | DocumentAnalysisResult | ReasoningResult | null;

export default function ResearchPage() {
  const [selectedMode, setSelectedMode] = useState<Mode>('research');
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(null);

  const handleAnalysisStart = () => {
    setIsLoading(true);
    setAnalysisResult(null);
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setIsLoading(false);
  };

  const handleAnalysisError = () => {
    setIsLoading(false);
    setAnalysisResult(null);
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
                />;
      case 'analyzer':
        return <DocumentAnalyzer isLoading={isLoading} result={analysisResult as DocumentAnalysisResult | null} />;
      case 'reasoning':
        return <ReasoningMode isLoading={isLoading} result={analysisResult as ReasoningResult | null} />;
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
