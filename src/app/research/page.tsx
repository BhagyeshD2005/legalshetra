
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';
import { ReasoningMode } from '@/components/ReasoningMode';
import { FileSearch, FileText, BrainCircuit } from 'lucide-react';

export default function ResearchPage() {
  return (
    <MainLayout>
      <Tabs defaultValue="research" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
          <TabsTrigger value="research">
            <FileSearch className="mr-2 h-4 w-4" />
            AI Legal Research
          </TabsTrigger>
          <TabsTrigger value="analyzer">
            <FileText className="mr-2 h-4 w-4" />
            Document Analyzer
          </TabsTrigger>
           <TabsTrigger value="reasoning">
            <BrainCircuit className="mr-2 h-4 w-4" />
            Reasoning Mode
          </TabsTrigger>
        </TabsList>
        <TabsContent value="research">
          <ResearchClient />
        </TabsContent>
        <TabsContent value="analyzer">
          <DocumentAnalyzer />
        </TabsContent>
        <TabsContent value="reasoning">
          <ReasoningMode />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
