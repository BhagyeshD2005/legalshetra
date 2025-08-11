'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';
import { ReasoningMode } from '@/components/ReasoningMode';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileSearch, FileText, BrainCircuit } from 'lucide-react';

type Mode = 'research' | 'analyzer' | 'reasoning';

const modes = [
  { value: 'research' as Mode, label: 'AI Legal Research', icon: FileSearch, component: <ResearchClient /> },
  { value: 'analyzer' as Mode, label: 'Document Analyzer', icon: FileText, component: <DocumentAnalyzer /> },
  { value: 'reasoning' as Mode, label: 'Reasoning Mode', icon: BrainCircuit, component: <ReasoningMode /> },
];

export default function ResearchPage() {
  const [selectedMode, setSelectedMode] = useState<Mode>('research');

  const handleModeChange = (value: string) => {
    setSelectedMode(value as Mode);
  };

  const activeMode = modes.find(m => m.value === selectedMode);
  const ActiveIcon = activeMode?.icon;

  return (
    <MainLayout>
      <div className="w-full space-y-6">
        <div className="flex justify-center">
          <Select onValueChange={handleModeChange} defaultValue={selectedMode}>
            <SelectTrigger className="w-full max-w-md h-12 text-lg font-headline">
                <div className="flex items-center gap-3">
                    {ActiveIcon && <ActiveIcon className="h-5 w-5 text-primary" />}
                    <SelectValue placeholder="Select a mode..." />
                </div>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                {modes.map(mode => {
                    const Icon = mode.icon;
                    return (
                    <SelectItem key={mode.value} value={mode.value}>
                        <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{mode.label}</span>
                        </div>
                    </SelectItem>
                    );
                })}
                </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4">
          {activeMode?.component}
        </div>
      </div>
    </MainLayout>
  );
}
