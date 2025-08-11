
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { 
  Copy, 
  Printer, 
  FileText, 
  Calendar,
  Clock,
  Search,
  CheckCircle2,
  ExternalLink,
  Maximize2,
  Minimize2,
  Share2,
  Gavel,
  BookOpen,
  FileOutput
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ReportDisplayProps {
  report: string;
  query: string;
}

interface ReportSection {
  title: string;
  content: string;
  type: 'summary' | 'cases' | 'analysis' | 'conclusion' | 'references';
}

function formatContent(content: string) {
    // Convert markdown bold to strong tags
    let html = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert markdown list items to html list items, preserving indentation
    html = html.replace(/^\s*\*\s+/gm, '<li>');
    return { __html: html };
}

export function ReportDisplay({ report, query }: ReportDisplayProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [readingTime, setReadingTime] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  // Calculate reading time
  useEffect(() => {
    const wordCount = report.split(/\s+/).length;
    const avgReadingSpeed = 200; // words per minute
    setReadingTime(Math.ceil(wordCount / avgReadingSpeed));
  }, [report]);

  // Parse report into sections
  const parseReportSections = (text: string): ReportSection[] => {
    const sections: ReportSection[] = [];
    const lines = text.split('\n');
    let currentSection: ReportSection | null = null;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      const headerMatch = trimmedLine.match(/^\*\*(.*?)\*\*$/) || trimmedLine.match(/^(.*?):$/);
      if (headerMatch && headerMatch[1].split(' ').length < 10 && headerMatch[1].trim()) { 
        if (currentSection) {
          sections.push(currentSection);
        }
        
        const title = headerMatch[1].trim();
        const type = getSectionType(title);
        
        currentSection = {
          title,
          content: '',
          type
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    }
    
    if (currentSection) {
      sections.push(currentSection);
    }
    
    if (sections.length === 0 && text.trim().length > 0) {
      return [{
        title: 'Legal Research Report',
        content: text,
        type: 'summary'
      }];
    }

    return sections;
  };

  const getSectionType = (title: string): ReportSection['type'] => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('summary') || lowerTitle.includes('overview') || lowerTitle.includes('introduction')) return 'summary';
    if (lowerTitle.includes('case') || lowerTitle.includes('judgment')) return 'cases';
    if (lowerTitle.includes('analysis') || lowerTitle.includes('interpretation')) return 'analysis';
    if (lowerTitle.includes('conclusion') || lowerTitle.includes('recommendation')) return 'conclusion';
    if (lowerTitle.includes('reference') || lowerTitle.includes('citation')) return 'references';
    return 'summary';
  };

  const getSectionIcon = (type: ReportSection['type']) => {
    switch (type) {
      case 'summary': return FileText;
      case 'cases': return Gavel;
      case 'analysis': return BookOpen;
      case 'conclusion': return FileOutput;
      case 'references': return ExternalLink;
      default: return FileText;
    }
  };

  const sections = parseReportSections(report);

  const handleCopy = async () => {
    setIsCopying(true);
    try {
      const formattedReport = `Legal Research Report\n\nQuery: ${query}\n\nGenerated on: ${new Date().toLocaleDateString()}\n\n${report}`;
      await navigator.clipboard.writeText(formattedReport);
      
      toast({
        title: "Copied successfully!",
        description: "Report has been copied to your clipboard.",
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Copy failed",
        description: "Unable to copy to clipboard. Please try selecting and copying manually."
      });
    } finally {
      setTimeout(() => setIsCopying(false), 2000);
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    try {
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Legal Research Report</title>
            <link rel="preconnect" href="https://fonts.googleapis.com">
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
            <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">
            <style>
              body { 
                font-family: 'PT Sans', sans-serif;
                line-height: 1.6; 
                color: #1f2937;
                font-size: 12px;
              }
              h1, h2, h3, h4 { font-family: 'Playfair Display', serif; }
              strong { font-weight: 700; }
              ul { padding-left: 20px; }
              li { margin-bottom: 5px; }
              .header {
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 { 
                font-size: 24px; 
                font-weight: 700; 
                color: #111827;
                margin-bottom: 8px;
              }
              .header .meta {
                color: #6b7280;
                font-size: 11px;
                display: flex;
                gap: 20px;
                flex-wrap: wrap;
              }
              .query-section {
                background: #f9fafb;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 25px;
                border-left: 4px solid #3b82f6;
              }
              .query-section h3 {
                font-size: 14px;
                font-weight: 600;
                margin-bottom: 8px;
                color: #374151;
              }
              .content {
                white-space: pre-wrap;
                word-wrap: break-word;
                font-size: 11px;
                line-height: 1.7;
              }
              .section {
                margin-bottom: 25px;
                break-inside: avoid;
              }
              .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #111827;
                margin-bottom: 12px;
                padding-bottom: 5px;
                border-bottom: 1px solid #e5e7eb;
              }
              @media print {
                body { font-size: 11px; }
                .header { page-break-after: avoid; }
                .section { page-break-inside: avoid; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Legal Research Report</h1>
              <div class="meta">
                <span>Generated: ${new Date().toLocaleString()}</span>
                <span>Reading Time: ~${readingTime} min</span>
                <span>Source: LegalshetraAI</span>
              </div>
            </div>
            
            <div class="query-section">
              <h3>Research Query</h3>
              <div>${query}</div>
            </div>
            
            <div class="content">${report.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `;
      
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      } else {
        throw new Error('Unable to open print window');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Print failed",
        description: "Unable to open print dialog. Please try again.",
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Legal Research Report',
          text: `Legal research report for: ${query}`,
          url: window.location.href,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy(); 
    }
  };

  const scrollToSection = (sectionTitle: string) => {
    const element = document.getElementById(`section-${sectionTitle.toLowerCase().replace(/\s+/g, '-')}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionTitle);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg border-l-4 border-l-primary">
        <CardHeader>
          <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <CardTitle className="font-headline text-2xl">Legal Research Report</CardTitle>
              </div>
              <CardDescription className="flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date().toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{readingTime} min read
                </span>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  AI Generated
                </Badge>
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare}
                className="flex items-center gap-1"
              >
                <Share2 className="h-3 w-3" />
                Share
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCopy} 
                disabled={isCopying}
                className="flex items-center gap-1"
              >
                <Copy className="h-3 w-3" />
                {isCopying ? 'Copied!' : 'Copy'}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handlePrint} 
                disabled={isPrinting}
                className="flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                {isPrinting ? 'Printing...' : 'Print'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3 p-4 bg-muted/10 rounded-lg border">
            <Search className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1 flex-1">
              <p className="text-sm font-medium text-muted-foreground">Research Query</p>
              <p className="font-medium">{query}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {sections.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-headline">Report Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {sections.map((section, index) => {
                const Icon = getSectionIcon(section.type);
                return (
                  <Button
                    key={index}
                    variant={activeSection === section.title ? "default" : "outline"}
                    size="sm"
                    onClick={() => scrollToSection(section.title)}
                    className="flex items-center gap-1"
                  >
                    <Icon className="h-3 w-3" />
                    {section.title}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-0">
          <div 
            ref={reportRef}
            id="report-content" 
            className={cn(
              "prose prose-sm max-w-none p-6 transition-all duration-300 prose-strong:font-semibold",
              isExpanded ? "max-h-none" : "max-h-[70vh] overflow-y-auto"
            )}
          >
            {sections.length > 1 ? (
              <div className="space-y-8">
                {sections.map((section, index) => {
                  const Icon = getSectionIcon(section.type);
                  return (
                    <motion.div 
                      key={index}
                      id={`section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="scroll-mt-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <motion.span 
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
                          whileHover={{ scale: 1.2, rotate: 15 }}
                        >
                          <Icon className="h-4 w-4 text-primary" />
                        </motion.span>
                        <h3 className="text-xl font-semibold font-headline text-foreground m-0">
                          {section.title}
                        </h3>
                      </div>
                      <Separator className="mb-4" />
                      <div 
                        className="whitespace-pre-wrap leading-relaxed text-foreground/90 pl-11"
                        dangerouslySetInnerHTML={formatContent(section.content.trim())}
                      />
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div 
                className="whitespace-pre-wrap leading-relaxed text-foreground"
                dangerouslySetInnerHTML={formatContent(report)}
              />
            )}
          </div>
          
          {!isExpanded && (
            <div className="border-t bg-muted/50 p-3 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="flex items-center gap-1"
              >
                <Maximize2 className="h-3 w-3" />
                Show Full Report
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{report.split(/\s+/).length}</p>
              <p className="text-xs text-muted-foreground">Words</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{sections.length}</p>
              <p className="text-xs text-muted-foreground">Sections</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-primary">{readingTime}</p>
              <p className="text-xs text-muted-foreground">Min Read</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

    