
import { MainLayout } from '@/components/MainLayout';
import { ResearchClient } from '@/components/ResearchClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DocumentAnalyzer } from '@/components/DocumentAnalyzer';
import { FileSearch, FileText } from 'lucide-react';

export default function ResearchPage() {
  return (
    <MainLayout>
      <Tabs defaultValue="research" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-lg mx-auto">
          <TabsTrigger value="research">
            <FileSearch className="mr-2 h-4 w-4" />
            AI Legal Research
          </TabsTrigger>
          <TabsTrigger value="analyzer">
            <FileText className="mr-2 h-4 w-4" />
            Document Analyzer
          </TabsTrigger>
        </TabsList>
        <TabsContent value="research">
          <ResearchClient />
        </TabsContent>
        <TabsContent value="analyzer">
          <DocumentAnalyzer />
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
