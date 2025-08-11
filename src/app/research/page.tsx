
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';
import { ReasoningMode } from '@/components/ReasoningMode';

export type Mode = 'research' | 'analyzer' | 'reasoning';

export default function ResearchPage() {
  const [selectedMode, setSelectedMode] = useState<Mode>('research');

  const handleModeChange = (value: string) => {
    setSelectedMode(value as Mode);
  };
  
  const modeComponents: Record<Mode, React.ReactNode> = {
      research: <ResearchClient selectedMode={selectedMode} onModeChange={handleModeChange} />,
      analyzer: <DocumentAnalyzer selectedMode={selectedMode} onModeChange={handleModeChange} />,
      reasoning: <ReasoningMode selectedMode={selectedMode} onModeChange={handleModeChange} />,
  }

  return (
    <MainLayout>
      <div className="w-full">
        <div className="mt-4">
          {modeComponents[selectedMode]}
        </div>
      </div>
    </MainLayout>
  );
}
