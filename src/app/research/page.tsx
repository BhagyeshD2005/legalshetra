
'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';
import { ReasoningMode } from '@/components/ReasoningMode';
import { ModeSwitcher } from '@/components/ModeSwitcher';

export type Mode = 'research' | 'analyzer' | 'reasoning';

export default function ResearchPage() {
  const [selectedMode, setSelectedMode] = useState<Mode>('research');

  const modeComponents: Record<Mode, React.ReactNode> = {
      research: <ResearchClient />,
      analyzer: <DocumentAnalyzer />,
      reasoning: <ReasoningMode />,
  }

  return (
    <MainLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mt-6">
            <div className="lg:col-span-1">
                 <ModeSwitcher selectedMode={selectedMode} onModeChange={setSelectedMode} />
            </div>
            <div className="lg:col-span-2">
                {modeComponents[selectedMode]}
            </div>
        </div>
    </MainLayout>
  );
}
