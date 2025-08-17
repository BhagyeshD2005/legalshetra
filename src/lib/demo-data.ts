
import { 
    Component, 
    FileSearch, 
    CalendarClock, 
    Camera, 
    FileText, 
    BrainCircuit, 
    DraftingCompass,
    TrendingUp,
    Handshake,
    Swords,
} from 'lucide-react';
import type { Mode } from '@/app/research/page';

export interface DemoMode {
    mode: string;
    icon: React.ComponentType<{ className?: string }>;
    sampleInput: string;
    sampleOutput: string;
    tryThisLink: string;
}

export const demoData: DemoMode[] = [
    {
        mode: 'Orchestrate AI',
        icon: Component,
        sampleInput: `Objective: "Research precedents for contract disputes involving force majeure due to floods in Mumbai, then draft a legal notice to the defaulting party."`,
        sampleOutput: `1. <strong>Research</strong>: Found 3 relevant cases on force majeure in Mumbai.<br/>2. <strong>Draft</strong>: Generated a legal notice based on findings.<br/>3. <strong>Result</strong>: A complete, context-aware legal notice, ready to send.`,
        tryThisLink: '/research?mode=orchestrate&sample=true'
    },
    {
        mode: 'AI Legal Research',
        icon: FileSearch,
        sampleInput: `Query: "Landmark Supreme Court judgments related to the 'basic structure' doctrine."`,
        sampleOutput: `<strong>Top Case:</strong> Kesavananda Bharati v. State of Kerala<br/><strong>Principle:</strong> Parliament cannot alter the Constitution's basic structure.<br/><strong>Summary:</strong> The report provides a ranked list of cases and key principles.`,
        tryThisLink: '/research?mode=research&sample=true'
    },
    {
        mode: 'Document Review',
        icon: FileText,
        sampleInput: `Pasting a 5-page rental agreement...`,
        sampleOutput: `<strong>Anomaly Detected:</strong> Clause 5.2 (Liability) is ambiguous.<br/><strong>Risk:</strong> High<br/><strong>Recommendation:</strong> "Suggest clarifying liability terms to be limited to the annual rental value."`,
        tryThisLink: '/research?mode=analyzer&sample=true'
    },
    {
        mode: 'Predictive Analytics',
        icon: TrendingUp,
        sampleInput: `Case Summary: "Corporate case in Mumbai HC, alleging shareholder oppression..."`,
        sampleOutput: `<strong>Win Probability:</strong> 68%<br/><strong>Key Factor:</strong> Judge's history of siding with minority shareholders in similar cases.<br/><strong>Strategy:</strong> Focus on precedents for dividend payouts.`,
        tryThisLink: '/research?mode=prediction&sample=true'
    },
];
