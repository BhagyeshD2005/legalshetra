
'use client';

import type { Mode, AnalysisResult } from '@/app/research/page';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Separator } from './ui/separator';
import { 
    FileSearch, 
    FileText, 
    BrainCircuit, 
    RefreshCw, 
    Sparkles, 
    Wand2, 
    Search, 
    Lightbulb, 
    Upload, 
    File as FileIcon, 
    X,
    DraftingCompass,
    TrendingUp,
    Handshake
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { reasonAboutScenario } from '@/ai/flows/reason-about-scenario';
import { analyzeDocument } from '@/ai/flows/analyze-document';
import { draftLegalDocument } from '@/ai/flows/draft-legal-document';
import { predictCaseOutcome } from '@/ai/flows/predict-case-outcome';
import { negotiationSupport } from '@/ai/flows/negotiation-support';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { enhanceQueryClarity } from '@/ai/flows/enhance-query-clarity';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';


interface ModeSwitcherProps {
  selectedMode: Mode;
  onModeChange: (mode: Mode) => void;
  onAnalysisStart: (data?: {query: string}) => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  onAnalysisError: () => void;
}

const researchFormSchema = z.object({
  query: z.string()
    .min(10, { message: 'Please enter a legal query of at least 10 characters.' })
    .max(1000, { message: 'Query must be less than 1000 characters.' })
});

const analyzerFormSchema = z.object({
  documentText: z.string().optional(),
  documentDataUri: z.string().optional(),
}).refine(data => data.documentText || data.documentDataUri, {
    message: "Please either paste text or upload a file.",
    path: ['documentText'],
});


const reasoningFormSchema = z.object({
  scenario: z.string().min(50, { message: 'Please provide a scenario of at least 50 characters.' }),
  question: z.string().min(10, { message: 'Please provide a question of at least 10 characters.' }),
});

const draftingFormSchema = z.object({
    documentType: z.enum(['contract', 'petition', 'affidavit', 'notice']),
    prompt: z.string().min(20, { message: 'Please provide a detailed prompt of at least 20 characters.' }),
    tone: z.enum(['aggressive', 'neutral', 'conciliatory']),
    jurisdiction: z.enum(['delhi', 'mumbai', 'generic']),
});

const predictionFormSchema = z.object({
    caseType: z.enum(['civil', 'criminal', 'corporate', 'family']),
    jurisdiction: z.enum(['delhi_hc', 'mumbai_hc', 'sci', 'generic']),
    judgeName: z.enum(['justice_a_k_sarma', 'justice_r_m_lodha', 'other']),
    caseSummary: z.string().min(50, { message: 'Please provide a case summary of at least 50 characters.' }),
});

const negotiationFormSchema = z.object({
    currentClause: z.string().min(20, { message: 'Please provide the clause text (at least 20 characters).' }),
    myGoal: z.string().min(10, { message: 'Please describe your goal (at least 10 characters).' }),
    opponentPosition: z.string().min(10, { message: 'Please describe the opponent\'s position (at least 10 characters).' }),
    opponentStyle: z.enum(['aggressive', 'collaborative', 'compromising', 'avoiding', 'default']),
    context: z.string().min(20, { message: 'Please provide context (at least 20 characters).' }),
});


const modes = [
  { value: 'research' as Mode, label: 'AI Legal Research', icon: FileSearch },
  { value: 'analyzer' as Mode, label: 'Document Review', icon: FileText },
  { value: 'reasoning' as Mode, label: 'Reasoning Mode', icon: BrainCircuit },
  { value: 'drafting' as Mode, label: 'Drafting Mode', icon: DraftingCompass },
  { value: 'prediction' as Mode, label: 'Predictive Analytics', icon: TrendingUp },
  { value: 'negotiation' as Mode, label: 'Negotiation Mode', icon: Handshake },
];

const readFileAsDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export function ModeSwitcher({ 
    selectedMode, 
    onModeChange, 
    onAnalysisStart,
    onAnalysisComplete,
    onAnalysisError
}: ModeSwitcherProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const researchForm = useForm<z.infer<typeof researchFormSchema>>({
    resolver: zodResolver(researchFormSchema),
    defaultValues: { query: '' },
  });

  const analyzerForm = useForm<z.infer<typeof analyzerFormSchema>>({
    resolver: zodResolver(analyzerFormSchema),
    defaultValues: { documentText: '' },
  });

  const reasoningForm = useForm<z.infer<typeof reasoningFormSchema>>({
    resolver: zodResolver(reasoningFormSchema),
    defaultValues: { scenario: '', question: '' },
  });
  
  const draftingForm = useForm<z.infer<typeof draftingFormSchema>>({
    resolver: zodResolver(draftingFormSchema),
    defaultValues: {
      documentType: 'contract',
      prompt: 'Draft a simple one-page rental agreement for a residential property. The landlord is "John Doe" and the tenant is "Jane Smith". The property is located at "123 Main St, Anytown". The rent is $1000 per month, due on the 1st of each month. The lease term is for 12 months, starting on the first of next month.',
      tone: 'neutral',
      jurisdiction: 'delhi',
    },
  });

  const predictionForm = useForm<z.infer<typeof predictionFormSchema>>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      caseType: 'corporate',
      jurisdiction: 'delhi_hc',
      judgeName: 'justice_a_k_sarma',
      caseSummary: 'The case involves a breach of a software development contract. The client alleges that the delivered software did not meet the agreed-upon specifications and is withholding final payment. Our client, the development firm, argues that the specifications were met and the client requested numerous out-of-scope changes.',
    },
  });

  const negotiationForm = useForm<z.infer<typeof negotiationFormSchema>>({
    resolver: zodResolver(negotiationFormSchema),
    defaultValues: {
      currentClause: 'The licensor shall be liable for any and all damages arising from the use of the software, without limitation.',
      myGoal: 'Limit our liability to the total contract value. We cannot accept unlimited liability.',
      opponentPosition: 'They are demanding full and unlimited liability for any potential damages.',
      opponentStyle: 'aggressive',
      context: 'We are in the final stages of a large software licensing deal. This liability clause is the last major sticking point.',
    },
  });

  const onResearchSubmit: SubmitHandler<z.infer<typeof researchFormSchema>> = async (data) => {
    onAnalysisStart(data);
    researchForm.reset();
  };
  
  const onAnalyzerSubmit: SubmitHandler<z.infer<typeof analyzerFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await analyzeDocument(data);
        
        onAnalysisComplete(result);
        analyzerForm.reset();
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        toast({
          title: "Analysis Complete",
          description: "The AI has provided a summary of the document.",
        });

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Analysis Failed', description: 'Could not analyze the document.' });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };
  
  const onReasoningSubmit: SubmitHandler<z.infer<typeof reasoningFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await reasonAboutScenario(data);
        onAnalysisComplete(result);
        reasoningForm.reset();
        toast({
          title: "Analysis Complete",
          description: "The AI has provided a step-by-step reasoning for the scenario.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "An error occurred while analyzing the scenario.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };
  
  const onDraftingSubmit: SubmitHandler<z.infer<typeof draftingFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await draftLegalDocument(data);
        onAnalysisComplete(result);
        draftingForm.reset();
        toast({
          title: "Draft Generated",
          description: "The AI has generated the initial draft. Proceed to the review step.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Drafting Failed",
            description: "An error occurred while generating the document.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };
  
  const onPredictionSubmit: SubmitHandler<z.infer<typeof predictionFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await predictCaseOutcome(data);
        onAnalysisComplete(result);
        predictionForm.reset();
        toast({
          title: "Prediction Complete",
          description: "The AI has generated a case outcome analysis.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Prediction Failed",
            description: "An error occurred while generating the prediction.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };
  
  const onNegotiationSubmit: SubmitHandler<z.infer<typeof negotiationFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await negotiationSupport(data);
        onAnalysisComplete(result);
        // Do not reset form, user may want to tweak it
        // negotiationForm.reset();
        toast({
          title: "Negotiation Support Ready",
          description: "The AI has generated negotiation strategies and clauses.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Analysis Failed",
            description: "An error occurred while generating negotiation support.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };


  const renderForm = () => {
    switch(selectedMode) {
      case 'research':
        return (
            <Form {...researchForm}>
              <form onSubmit={researchForm.handleSubmit(onResearchSubmit)} className="space-y-6">
                <FormField
                  control={researchForm.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Legal Query
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Case laws related to anticipatory bail under Section 438 CrPC' or 'Recent judgments on trademark infringement in e-commerce'"
                          className="min-h-[150px] resize-none focus-visible:ring-2 focus-visible:ring-primary"
                          {...field}
                          disabled={isSubmitting}
                          maxLength={1000}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormMessage />
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/1000
                        </span>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Researching...</>
                               : <><Search className="mr-2 h-4 w-4" /> Start Research</>}
                </Button>
              </form>
            </Form>
        );
      case 'analyzer':
        return (
            <Form {...analyzerForm}>
              <form onSubmit={analyzerForm.handleSubmit(onAnalyzerSubmit)} className="space-y-6">
                <FormItem>
                    <FormLabel>Upload Document</FormLabel>
                    <FormControl>
                        <div>
                        <Input 
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  setSelectedFile(file);
                                  const dataUri = await readFileAsDataUri(file);
                                  analyzerForm.setValue('documentDataUri', dataUri);
                                  analyzerForm.setValue('documentText', '');
                                  analyzerForm.clearErrors('documentText');
                                }
                            }}
                            accept=".pdf,.doc,.docx,.txt"
                            disabled={isSubmitting}
                        />
                        <div 
                            className={cn(
                                "border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors",
                                selectedFile && "border-solid border-primary/50"
                            )}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {selectedFile ? (
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        <FileIcon className="h-4 w-4" />
                                        <span>{selectedFile.name}</span>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                            analyzerForm.setValue('documentDataUri', undefined);
                                            if(fileInputRef.current) fileInputRef.current.value = "";
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="font-medium">Click to upload or drag & drop</p>
                                    <p className="text-xs text-muted-foreground">PDF, DOC, DOCX, or TXT</p>
                                </div>
                            )}
                        </div>
                        </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>

                <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                </div>
                
                <FormField
                  control={analyzerForm.control}
                  name="documentText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Paste Text</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste the full text of a legal document here..."
                          className="min-h-[150px] resize-y"
                          {...field}
                          onChange={(e) => {
                              field.onChange(e);
                              if(e.target.value) {
                                  setSelectedFile(null);
                                  analyzerForm.setValue('documentDataUri', undefined);
                                  if (fileInputRef.current) fileInputRef.current.value = "";
                              }
                          }}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Reviewing...</> 
                             : <><Sparkles className="mr-2 h-4 w-4" /> Review Document</>}
                </Button>
              </form>
            </Form>
        );
      case 'reasoning':
        return (
            <Form {...reasoningForm}>
              <form onSubmit={reasoningForm.handleSubmit(onReasoningSubmit)} className="space-y-6">
                <FormField
                  control={reasoningForm.control}
                  name="scenario"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Scenario</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the factual matrix of the case..."
                          className="min-h-[200px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={reasoningForm.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specific Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Is the non-compete clause enforceable under the Indian Contract Act?'"
                          className="min-h-[80px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
                             : <><Wand2 className="mr-2 h-4 w-4" /> Analyze Scenario</>}
                </Button>
              </form>
            </Form>
        );
        case 'drafting':
            return (
                <Form {...draftingForm}>
                  <form onSubmit={draftingForm.handleSubmit(onDraftingSubmit)} className="space-y-6">
                    <FormField
                      control={draftingForm.control}
                      name="documentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Document Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a document type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="contract">Contract / Agreement</SelectItem>
                              <SelectItem value="petition">Petition</SelectItem>
                              <SelectItem value="affidavit">Affidavit</SelectItem>
                              <SelectItem value="notice">Legal Notice</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={draftingForm.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Drafting Prompt</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'Draft a basic rental agreement between John Doe (Landlord) and Jane Smith (Tenant) for a property in Delhi...'"
                              className="min-h-[150px] resize-y"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={draftingForm.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone</FormLabel>
                            <FormControl>
                               <ToggleGroup 
                                type="single" 
                                defaultValue="neutral" 
                                className="w-full grid grid-cols-3"
                                onValueChange={field.onChange}
                                disabled={isSubmitting}
                               >
                                    <ToggleGroupItem value="aggressive">Aggressive</ToggleGroupItem>
                                    <ToggleGroupItem value="neutral">Neutral</ToggleGroupItem>
                                    <ToggleGroupItem value="conciliatory">Conciliatory</ToggleGroupItem>
                                </ToggleGroup>
                            </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={draftingForm.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurisdiction</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select jurisdiction for boilerplate" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="delhi">Delhi</SelectItem>
                              <SelectItem value="mumbai">Mumbai</SelectItem>
                              <SelectItem value="generic">Generic</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Drafting...</> 
                                 : <><Sparkles className="mr-2 h-4 w-4" /> Start Drafting</>}
                    </Button>
                  </form>
                </Form>
            );
        case 'prediction':
            return (
                 <Form {...predictionForm}>
                  <form onSubmit={predictionForm.handleSubmit(onPredictionSubmit)} className="space-y-6">
                     <FormField
                      control={predictionForm.control}
                      name="caseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a case type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="civil">Civil</SelectItem>
                              <SelectItem value="criminal">Criminal</SelectItem>
                              <SelectItem value="corporate">Corporate</SelectItem>
                              <SelectItem value="family">Family</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={predictionForm.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Jurisdiction / Court</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a jurisdiction" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="delhi_hc">Delhi High Court</SelectItem>
                              <SelectItem value="mumbai_hc">Mumbai High Court</SelectItem>
                              <SelectItem value="sci">Supreme Court of India</SelectItem>
                              <SelectItem value="generic">Generic / Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={predictionForm.control}
                      name="judgeName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Presiding Judge (if known)</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a judge" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="justice_a_k_sarma">Justice A. K. Sarma</SelectItem>
                              <SelectItem value="justice_r_m_lodha">Justice R. M. Lodha</SelectItem>
                              <SelectItem value="other">Other / Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={predictionForm.control}
                      name="caseSummary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Summary</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Provide a detailed summary of the facts, arguments, and context of the case..."
                              className="min-h-[150px] resize-y"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
                                 : <><Sparkles className="mr-2 h-4 w-4" /> Generate Prediction</>}
                    </Button>
                  </form>
                </Form>
            );
        case 'negotiation':
            return (
                <Form {...negotiationForm}>
                  <form onSubmit={negotiationForm.handleSubmit(onNegotiationSubmit)} className="space-y-6">
                    <FormField
                      control={negotiationForm.control}
                      name="currentClause"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Clause Under Negotiation</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Paste the full text of the clause being negotiated."
                              className="min-h-[100px] resize-y font-mono text-xs"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={negotiationForm.control}
                      name="myGoal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>My Goal</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 'Limit our liability to the contract value.'"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={negotiationForm.control}
                      name="opponentPosition"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opponent's Position</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., 'They want us to accept unlimited liability.'"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={negotiationForm.control}
                      name="opponentStyle"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Opponent's Negotiation Style</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a style" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="aggressive">Aggressive</SelectItem>
                              <SelectItem value="collaborative">Collaborative</SelectItem>
                              <SelectItem value="compromising">Compromising</SelectItem>
                              <SelectItem value="avoiding">Avoiding</SelectItem>
                              <SelectItem value="default">Default / Unknown</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={negotiationForm.control}
                      name="context"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Context</FormLabel>
                          <FormControl>
                             <Textarea
                              placeholder="e.g., 'Final stages of a large software deal. This clause is the last sticking point.'"
                              className="min-h-[80px] resize-y"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
                                 : <><Sparkles className="mr-2 h-4 w-4" /> Get Negotiation Advice</>}
                    </Button>
                  </form>
                </Form>
            );
      default:
        return null;
    }
  }

  const renderFooter = () => {
    if (selectedMode === 'research') {
        return (
            <CardFooter>
                <div className="p-4 bg-muted/50 rounded-lg w-full">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    Research Tips
                    </h4>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Be specific with section numbers and acts.</li>
                    <li>Include jurisdiction if relevant.</li>
                    <li>Mention a time period for recent cases.</li>
                    </ul>
                </div>
            </CardFooter>
        )
    }
    return null;
  }

  return (
    <Card className="shadow-lg sticky top-24">
      <CardContent className="p-4">
        <Select onValueChange={(value) => onModeChange(value as Mode)} defaultValue={selectedMode}>
          <SelectTrigger className="w-full h-11 text-base font-medium">
            <div className="flex items-center gap-3">
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
                      {Icon && <Icon className="h-4 w-4" />}
                      <span>{mode.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectGroup>
          </SelectContent>
        </Select>
      </CardContent>
      <Separator />
      <CardHeader>
        <CardTitle className="font-headline flex items-center gap-2">
            {selectedMode === 'research' && <Sparkles className="h-5 w-5 text-primary" />}
            {modes.find(m => m.value === selectedMode)?.label}
        </CardTitle>
        <CardDescription>
            {
                selectedMode === 'research' ? 'Enter your legal query to start comprehensive AI-powered research.' :
                selectedMode === 'analyzer' ? 'Upload a document or paste text for an AI-powered review of anomalies and risks.' :
                selectedMode === 'drafting' ? 'Create contracts, petitions, and more with AI assistance.' :
                selectedMode === 'prediction' ? 'Get probability-based case strategy insights using historical data and trends.' :
                selectedMode === 'negotiation' ? 'Get AI-powered advice for contract and settlement discussions.' :
                'Provide a legal scenario and a question for the AI to reason about.'
            }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {renderForm()}
      </CardContent>
      {renderFooter()}
    </Card>
  );
}
