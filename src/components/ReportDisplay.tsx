
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
  FileOutput,
  PieChart as PieChartIcon,
  BarChart,
  LineChart,
  Target,
  ListOrdered
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { GenerateLegalSummaryOutput } from "@/ai/flows/generate-legal-summary";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Pie, Cell, PieChart as RechartsPieChart, Bar, BarChart as RechartsBarChart, XAxis, YAxis, CartesianGrid, Line, LineChart as RechartsLineChart } from 'recharts';

interface ReportDisplayProps {
  reportData: GenerateLegalSummaryOutput;
  query: string;
}

export function ReportDisplay({ reportData, query }: ReportDisplayProps) {
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('Summary');
  const [readingTime, setReadingTime] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  const { summary, rankedCases, keyPrinciples, charts } = reportData;
  const fullReportText = [summary, rankedCases?.map(c => `${c.title}\n${c.summary}`).join('\n\n'), keyPrinciples?.map(p => `${p.principle}\n${p.cases.join(', ')}`).join('\n\n')].join('\n\n');


  useEffect(() => {
    const wordCount = fullReportText.split(/\s+/).length;
    const avgReadingSpeed = 200;
    setReadingTime(Math.ceil(wordCount / avgReadingSpeed));
  }, [fullReportText]);


  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await navigator.clipboard.writeText(fullReportText);
      
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
    // This is a simplified print handler. A real one would need more complex styling.
    try {
      const printContent = `
        <h1>Legal Research Report</h1>
        <h2>Query: ${query}</h2>
        <hr/>
        <h3>Summary</h3>
        <p>${summary.replace(/\n/g, '<br/>')}</p>
        <h3>Ranked Cases</h3>
        ${rankedCases?.map(c => `<h4>${c.rank}. ${c.title} (${c.citation})</h4><p>${c.summary.replace(/\n/g, '<br/>')}</p>`).join('')}
        <h3>Key Principles</h3>
         ${keyPrinciples?.map(p => `<h4>${p.principle}</h4><p>Established in: ${p.cases.join(', ')}</p>`).join('')}
      `;
      const printWindow = window.open('', '_blank');
      if(printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
      }
    } catch(e) {
        toast({ variant: 'destructive', title: 'Print failed' });
    }
    finally {
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
  
  const getChartIcon = (type: string) => {
    switch (type) {
      case 'pie': return PieChartIcon;
      case 'bar': return BarChart;
      case 'line': return LineChart;
      default: return PieChartIcon;
    }
  };

  const reportSections = [
    { title: 'Summary', data: summary, icon: FileText, condition: !!summary },
    { title: 'Ranked Case Analysis', data: rankedCases, icon: ListOrdered, condition: !!rankedCases?.length },
    { title: 'Key Legal Principles', data: keyPrinciples, icon: Gavel, condition: !!keyPrinciples?.length },
    { title: 'Visualizations', data: charts, icon: PieChartIcon, condition: !!charts?.length },
  ].filter(s => s.condition);

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
              <CardDescription asChild>
                  <div className="flex items-center gap-4 flex-wrap">
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
                  </div>
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="ghost" size="sm" onClick={handleShare} className="flex items-center gap-1"><Share2 className="h-3 w-3" />Share</Button>
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={isCopying} className="flex items-center gap-1"><Copy className="h-3 w-3" />{isCopying ? 'Copied!' : 'Copy'}</Button>
              <Button variant="ghost" size="sm" onClick={handlePrint} disabled={isPrinting} className="flex items-center gap-1"><Printer className="h-3 w-3" />{isPrinting ? 'Printing...' : 'Print'}</Button>
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

      {(reportSections.length > 1) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-headline">Report Sections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {reportSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Button
                    key={section.title}
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
        <CardContent className={cn("p-6", isExpanded ? "max-h-none" : "max-h-[80vh] overflow-y-auto")}>
            <div className="space-y-8">
            {/* Summary Section */}
            {summary && (
              <motion.div id="section-summary" className="scroll-mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex items-center gap-3 mb-4"><motion.span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10" whileHover={{ scale: 1.2, rotate: 15 }}><FileText className="h-4 w-4 text-primary" /></motion.span><h3 className="text-xl font-semibold font-headline text-foreground m-0">Summary</h3></div>
                <Separator className="mb-4" />
                <div className="whitespace-pre-wrap leading-relaxed text-foreground/90 pl-11">{summary}</div>
              </motion.div>
            )}

            {/* Ranked Cases Section */}
            {rankedCases && rankedCases.length > 0 && (
                <motion.div id="section-ranked-case-analysis" className="scroll-mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center gap-3 mb-4"><motion.span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10" whileHover={{ scale: 1.2, rotate: 15 }}><ListOrdered className="h-4 w-4 text-primary" /></motion.span><h3 className="text-xl font-semibold font-headline text-foreground m-0">Ranked Case Analysis</h3></div>
                    <Separator className="mb-4" />
                    <div className="space-y-4 pl-11">
                        {rankedCases.map(item => (
                            <div key={item.rank}>
                                <h4 className="font-semibold text-md flex items-center gap-2">
                                    <Badge variant="secondary" className="text-base">{item.rank}</Badge> 
                                    {item.title}
                                </h4>
                                <div className="text-xs text-muted-foreground mt-1 mb-2 flex items-center gap-4">
                                    <span>{item.citation}</span>
                                    <span>{item.jurisdiction}</span>
                                    <span>{item.date}</span>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">Read Full Text <ExternalLink className="h-3 w-3"/></a>
                                </div>
                                <p className="text-sm text-foreground/80">{item.summary}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Key Principles Section */}
            {keyPrinciples && keyPrinciples.length > 0 && (
                 <motion.div id="section-key-legal-principles" className="scroll-mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-3 mb-4"><motion.span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10" whileHover={{ scale: 1.2, rotate: 15 }}><Gavel className="h-4 w-4 text-primary" /></motion.span><h3 className="text-xl font-semibold font-headline text-foreground m-0">Key Legal Principles</h3></div>
                    <Separator className="mb-4" />
                    <div className="space-y-4 pl-11">
                        {keyPrinciples.map((item, index) => (
                            <div key={index}>
                                <h4 className="font-semibold text-md">{item.principle}</h4>
                                <p className="text-sm text-muted-foreground">Established in: {item.cases.join(', ')}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Charts Section */}
            {charts && charts.length > 0 && (
                <motion.div id="section-visualizations" className="scroll-mt-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="flex items-center gap-3 mb-4"><motion.span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10" whileHover={{ scale: 1.2, rotate: 15 }}><PieChartIcon className="h-4 w-4 text-primary" /></motion.span><h3 className="text-xl font-semibold font-headline text-foreground m-0">Visualizations</h3></div>
                    <Separator className="mb-4" />
                    <div className="pl-11 grid grid-cols-1 md:grid-cols-2 gap-8">
                       {charts.map((chart, index) => {
                           const chartConfig = chart.data.reduce((acc, item) => {
                              acc[item.name] = { label: item.name, color: item.fill };
                              return acc;
                            }, {} as any);
                          
                          const renderChart = () => {
                              switch (chart.type) {
                                  case 'pie':
                                    return (
                                        <RechartsPieChart>
                                            <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                                            <Pie data={chart.data} dataKey="value" nameKey="name" innerRadius={50} label >
                                                {chart.data.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.fill} />))}
                                            </Pie>
                                            <ChartLegend content={<ChartLegendContent />} />
                                        </RechartsPieChart>
                                    );
                                  case 'bar':
                                    return (
                                        <RechartsBarChart data={chart.data}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                            <YAxis />
                                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                            <Bar dataKey="value" radius={4}>
                                                {chart.data.map((entry, idx) => (<Cell key={`cell-${idx}`} fill={entry.fill} />))}
                                            </Bar>
                                        </RechartsBarChart>
                                    );
                                   case 'line':
                                        return (
                                            <RechartsLineChart data={chart.data}>
                                                <CartesianGrid vertical={false} />
                                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                                                <YAxis />
                                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                                                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                                            </RechartsLineChart>
                                        );
                                  default: return null;
                              }
                          }
                          
                          return (
                            <Card key={index}>
                                <CardHeader>
                                    <CardTitle className="text-base font-headline">{chart.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
                                       {renderChart()}
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                          )
                        })}
                    </div>
                </motion.div>
            )}
            </div>
        </CardContent>
      </Card>
      
    </div>
  );
}

    

    