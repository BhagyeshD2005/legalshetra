


'use client';

import * as React from 'react';
import type { Mode, AnalysisResult } from '@/app/research/page';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
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
    Handshake,
    Swords,
    Component,
    CalendarClock,
    Camera,
    Plus,
    FileKey,
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { reasonAboutScenario } from '@/ai/flows/reason-about-scenario';
import { analyzeDocument } from '@/ai/flows/analyze-document';
import { draftLegalDocument } from '@/ai/flows/draft-legal-document';
import { predictCaseOutcome } from '@/ai/flows/predict-case-outcome';
import { negotiationSupport } from '@/ai/flows/negotiation-support';
import { crossExaminationPrep } from '@/ai/flows/cross-examination-prep';
import { generateLitigationTimeline } from '@/ai/flows/generate-litigation-timeline';
import { analyzeEvidence } from '@/ai/flows/analyze-evidence';
import { patentSearch } from '@/ai/flows/patent-search';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { type User } from "firebase/auth";

import { sampleResearchInput } from '@/sample/research';
import { sampleAnalyzerInput } from '@/sample/analyzer';
import { sampleReasoningInput } from '@/sample/reasoning';
import { sampleDraftingInput } from '@/sample/drafting';
import { samplePredictionInput } from '@/sample/prediction';
import { sampleNegotiationInput } from '@/sample/negotiation';
import { sampleCrossExaminationInput } from '@/sample/cross-examination';
import { sampleOrchestrateInput } from '@/sample/orchestrate';
import { sampleTimelineInput } from '@/sample/timeline';
import { sampleEvidenceInput } from '@/sample/evidence';
import { samplePatentSearchInput } from '@/sample/patent-search';
import { app } from '@/lib/firebase';
import { getAuth, GoogleAuthProvider, signInWithPopup, OAuthCredential } from "firebase/auth";

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

const crossExaminationFormSchema = z.object({
    witnessStatement: z.string().min(50, { message: 'Please provide the witness statement (at least 50 characters).' }),
    evidenceSummary: z.string().min(50, { message: 'Please provide an evidence summary (at least 50 characters).' }),
    myRole: z.enum(['prosecution', 'defense']),
    simulationRole: z.enum(['witness', 'opposing_counsel']),
});

const orchestrateFormSchema = z.object({
  objective: z.string()
    .min(20, { message: 'Please describe your objective in at least 20 characters.' })
    .max(1500, { message: 'Objective must be less than 1500 characters.' })
});

const timelineFormSchema = z.object({
    jurisdiction: z.string().min(3, { message: "Please specify a jurisdiction."}),
    caseType: z.string().min(3, { message: "Please specify a case type."}),
    startDate: z.date({
        required_error: "A start date is required.",
    }),
    knownDates: z.string().optional(),
});

const evidenceFormSchema = z.object({
    caseContext: z.string().min(20, { message: 'Please provide a brief case context (at least 20 characters).' }),
    evidenceFiles: z.array(z.object({
        fileName: z.string(),
        fileType: z.string(),
        dataUri: z.string(),
    })).min(1, { message: "Please upload at least one evidence file." }),
});

const patentSearchFormSchema = z.object({
  inventionDescription: z.string().min(50, { message: 'Please describe your invention in at least 50 characters.' }),
});


const modes = [
  { value: 'orchestrate' as Mode, label: 'Orchestrate AI', icon: Component },
  { value: 'research' as Mode, label: 'AI Legal Research', icon: FileSearch },
  { value: 'patent' as Mode, label: 'Patent Search', icon: FileKey },
  { value: 'timeline' as Mode, label: 'Litigation Timeline', icon: CalendarClock },
  { value: 'evidence' as Mode, label: 'Evidence Analysis', icon: Camera },
  { value: 'analyzer' as Mode, label: 'Document Review', icon: FileText },
  { value: 'reasoning' as Mode, label: 'Reasoning Mode', icon: BrainCircuit },
  { value: 'drafting' as Mode, label: 'Drafting Mode', icon: DraftingCompass },
  { value: 'prediction' as Mode, label: 'Predictive Analytics', icon: TrendingUp },
  { value: 'negotiation' as Mode, label: 'Negotiation Mode', icon: Handshake },
  { value: 'cross-examination' as Mode, label: 'Cross-Examination Prep', icon: Swords },
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
  const evidenceFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedEvidenceFiles, setSelectedEvidenceFiles] = useState<File[]>([]);
  
  const [user, setUser] = useState<User | null>(null);
  const [isDriveConnected, setIsDriveConnected] = useState(false);
  const [driveFiles, setDriveFiles] = useState<{ id: string; name: string }[]>([]);


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
      prompt: '',
      tone: 'neutral',
      jurisdiction: 'generic',
    },
  });

  const predictionForm = useForm<z.infer<typeof predictionFormSchema>>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: {
      caseType: 'civil',
      jurisdiction: 'generic',
      judgeName: 'other',
      caseSummary: '',
    },
  });

  const negotiationForm = useForm<z.infer<typeof negotiationFormSchema>>({
    resolver: zodResolver(negotiationFormSchema),
    defaultValues: {
      currentClause: '',
      myGoal: '',
      opponentPosition: '',
      opponentStyle: 'default',
      context: '',
    },
  });

  const crossExaminationForm = useForm<z.infer<typeof crossExaminationFormSchema>>({
    resolver: zodResolver(crossExaminationFormSchema),
    defaultValues: {
        witnessStatement: '',
        evidenceSummary: '',
        myRole: 'prosecution',
        simulationRole: 'witness',
    },
  });

   const orchestrateForm = useForm<z.infer<typeof orchestrateFormSchema>>({
    resolver: zodResolver(orchestrateFormSchema),
    defaultValues: { objective: '' },
  });

  const timelineForm = useForm<z.infer<typeof timelineFormSchema>>({
    resolver: zodResolver(timelineFormSchema),
    defaultValues: {
      jurisdiction: '',
      caseType: '',
      knownDates: '',
    },
  });

   const evidenceForm = useForm<z.infer<typeof evidenceFormSchema>>({
    resolver: zodResolver(evidenceFormSchema),
    defaultValues: {
      caseContext: '',
      evidenceFiles: [],
    },
  });

  const patentSearchForm = useForm<z.infer<typeof patentSearchFormSchema>>({
    resolver: zodResolver(patentSearchFormSchema),
    defaultValues: { inventionDescription: '' },
  });

  // Reset forms when mode changes to prevent state leakage
  useEffect(() => {
    researchForm.reset();
    analyzerForm.reset();
    reasoningForm.reset();
    draftingForm.reset();
    predictionForm.reset();
    negotiationForm.reset();
    crossExaminationForm.reset();
    orchestrateForm.reset();
    timelineForm.reset();
    evidenceForm.reset();
    patentSearchForm.reset();
    setSelectedEvidenceFiles([]);
  }, [selectedMode, researchForm, analyzerForm, reasoningForm, draftingForm, predictionForm, negotiationForm, crossExaminationForm, orchestrateForm, timelineForm, evidenceForm, patentSearchForm]);

  const onResearchSubmit: SubmitHandler<z.infer<typeof researchFormSchema>> = async (data) => {
    onAnalysisStart(data);
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

  const onCrossExaminationSubmit: SubmitHandler<z.infer<typeof crossExaminationFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await crossExaminationPrep(data);
        onAnalysisComplete(result);
        // crossExaminationForm.reset();
        toast({
          title: "Preparation Ready",
          description: "The AI has generated your cross-examination materials.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Preparation Failed",
            description: "An error occurred while generating the prep materials.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };

  const onOrchestrateSubmit: SubmitHandler<z.infer<typeof orchestrateFormSchema>> = async (data) => {
    // This will be handled by the OrchestrateMode component, which will call the flow
    // and provide step-by-step updates. Here, we just initiate it.
    onAnalysisStart({ query: data.objective });
  };
  
  const onTimelineSubmit: SubmitHandler<z.infer<typeof timelineFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const input = {
            ...data,
            startDate: format(data.startDate, 'yyyy-MM-dd'),
        };
        const result = await generateLitigationTimeline(input);
        onAnalysisComplete(result);
        // timelineForm.reset();
        toast({
          title: "Timeline Generated",
          description: "The AI has generated a procedural timeline for your case.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Timeline Generation Failed",
            description: "An error occurred while generating the timeline.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };

  const onEvidenceSubmit: SubmitHandler<z.infer<typeof evidenceFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await analyzeEvidence(data);
        onAnalysisComplete(result);
        evidenceForm.reset();
        setSelectedEvidenceFiles([]);
        toast({
          title: "Analysis Complete",
          description: "The AI has analyzed the provided evidence.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Evidence Analysis Failed",
            description: "An error occurred while analyzing the evidence.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };

  const onPatentSearchSubmit: SubmitHandler<z.infer<typeof patentSearchFormSchema>> = async (data) => {
    setIsSubmitting(true);
    onAnalysisStart();
    try {
        const result = await patentSearch(data);
        onAnalysisComplete(result);
        // patentSearchForm.reset();
        toast({
          title: "Patent Search Complete",
          description: "The AI has generated a novelty report for your invention.",
        });
    } catch (error) {
         toast({
            variant: "destructive",
            title: "Search Failed",
            description: "An error occurred while performing the patent search.",
        });
        onAnalysisError();
    }
    setIsSubmitting(false);
  };


  const sampleDataMap: Record<string, any> = {
      research: sampleResearchInput,
      analyzer: sampleAnalyzerInput,
      reasoning: sampleReasoningInput,
      drafting: sampleDraftingInput,
      prediction: samplePredictionInput,
      negotiation: sampleNegotiationInput,
      'cross-examination': sampleCrossExaminationInput,
      orchestrate: sampleOrchestrateInput,
      timeline: sampleTimelineInput,
      evidence: sampleEvidenceInput,
      patent: samplePatentSearchInput,
    };

  const handleLoadSampleData = () => {
    const sampleData = sampleDataMap[selectedMode];
    if (!sampleData) {
        toast({ variant: 'destructive', title: 'No sample data available for this mode.' });
        return;
    }

    switch(selectedMode) {
        case 'research': researchForm.reset(sampleData); break;
        case 'analyzer': analyzerForm.reset(sampleData); break;
        case 'reasoning': reasoningForm.reset(sampleData); break;
        case 'drafting': draftingForm.reset(sampleData); break;
        case 'prediction': predictionForm.reset(sampleData); break;
        case 'negotiation': negotiationForm.reset(sampleData); break;
        case 'cross-examination': crossExaminationForm.reset(sampleData); break;
        case 'orchestrate': orchestrateForm.reset(sampleData); break;
        case 'patent': patentSearchForm.reset(sampleData); break;
        case 'timeline':
            // The date needs to be converted from string to Date object for the form
            timelineForm.reset({
                ...sampleData,
                startDate: new Date(sampleData.startDate),
            });
            break;
        case 'evidence': 
            evidenceForm.reset(sampleData); 
            // Note: This won't show files in the UI as we can't create File objects,
            // but the data URI is present for submission. This is a known limitation.
            toast({ title: 'Sample evidence loaded.', description: 'Note: File list UI will not update for this sample.' });
            break;
        default: break;
    }
    toast({ title: 'Sample data loaded!', description: 'The form has been populated with sample input.' });
  };

  const handleConnectDrive = async () => {
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    // Request read-only access to Google Drive files.
    provider.addScope('https://www.googleapis.com/auth/drive.readonly');

    setIsSubmitting(true);
    toast({ title: "Connecting to Google Drive...", description: "Please sign in with Google to grant access." });

    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      
      if (!credential) {
        throw new Error("Could not get credential from sign-in result.");
      }
      
      // IMPORTANT: In a real production app, you would send this idToken
      // to your secure backend server. The server would then use it to
      // securely obtain an OAuth2 access token for the Google Drive API.
      // We simulate this by just storing the user and setting the connected state.
      // const idToken = await result.user.getIdToken();
      // await fetch('/api/google-drive-auth', { method: 'POST', body: JSON.stringify({ token: idToken }) });

      setUser(result.user);
      setIsDriveConnected(true);
      
      // Simulate fetching files from Google Drive API
      // In a real app, this would be an API call to your backend,
      // which then uses the stored credentials to query the Drive API.
      setDriveFiles([
        { id: '1', name: 'Client_Contract_v2.docx' },
        { id: '2', name: 'Property_Lease_Agreement.pdf' },
        { id: '3', name: 'NDA_Template.docx' },
        { id: '4', name: 'Shareholder_Resolution.pdf' },
      ]);

      toast({ title: "Connected!", description: `Signed in as ${result.user.displayName}. You can now select files.` });

    } catch (error: any) {
      console.error("Google Sign-In error:", error);
      toast({ variant: 'destructive', title: 'Connection Failed', description: error.message || 'Could not connect to Google Drive.' });
      setIsDriveConnected(false);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSelectDriveFile = (fileName: string) => {
    // This is a placeholder. In a real app, this would use the Google Drive API
    // to fetch the file content and convert it to a data URI.
    toast({ title: "Selected File", description: `${fileName} is being prepared for analysis.`});
    // For demonstration, we'll just set a dummy data URI.
    analyzerForm.setValue('documentDataUri', `data:text/plain;base64,U2FtcGxlIGNvbnRlbnQgZnJvbSAi${fileName.replace(/\s+/g, '')}Ig`);
    analyzerForm.setValue('documentText', ''); // Clear text input
    analyzerForm.handleSubmit(onAnalyzerSubmit)(); // Automatically submit for analysis
  };


  const renderLoadSampleButton = () => (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      className="h-auto px-3 py-1 text-xs"
      onClick={handleLoadSampleData}
    >
      Load Sample
    </Button>
  );


  const renderForm = () => {
    switch(selectedMode) {
      case 'orchestrate':
         return (
            <Form {...orchestrateForm}>
              <form onSubmit={orchestrateForm.handleSubmit(onOrchestrateSubmit)} className="space-y-4" key="orchestrate-form">
                <FormField
                  control={orchestrateForm.control}
                  name="objective"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex justify-between items-center">
                        <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Overall Objective
                        </FormLabel>
                        {renderLoadSampleButton()}
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Research precedents for contract disputes involving force majeure due to floods in Mumbai, then draft a legal notice to the defaulting party.'"
                          className="min-h-[150px] resize-none focus-visible:ring-2 focus-visible:ring-primary"
                          {...field}
                          disabled={isSubmitting}
                          maxLength={1500}
                        />
                      </FormControl>
                      <div className="flex justify-between items-center">
                        <FormMessage />
                         <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                            {field.value?.length || 0}/1500
                            </span>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Orchestrating...</>
                               : <><Sparkles className="mr-2 h-4 w-4" /> Begin Workflow</>}
                </Button>
              </form>
            </Form>
        );
      case 'research':
        return (
            <Form {...researchForm}>
              <form onSubmit={researchForm.handleSubmit(onResearchSubmit)} className="space-y-4" key="research-form">
                <FormField
                  control={researchForm.control}
                  name="query"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Legal Query
                        </FormLabel>
                        {renderLoadSampleButton()}
                      </div>
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
                         <div className="flex items-center gap-4">
                            <span className="text-xs text-muted-foreground">
                            {field.value?.length || 0}/1000
                            </span>
                        </div>
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
              <form onSubmit={analyzerForm.handleSubmit(onAnalyzerSubmit)} className="space-y-4" key="analyzer-form">
                
                <div className="space-y-2">
                  <FormLabel>Input Source</FormLabel>
                  <div className="p-2 border rounded-lg bg-muted/30 space-y-4">
                    {isDriveConnected ? (
                      <div>
                        <p className="text-sm font-medium mb-2">Select a file from Google Drive</p>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {driveFiles.map(file => (
                            <Button key={file.id} variant="outline" className="w-full justify-start" onClick={() => handleSelectDriveFile(file.name)}>
                              <FileIcon className="mr-2 h-4 w-4" /> {file.name}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={handleConnectDrive} disabled={isSubmitting}>
                        <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2"><title>Google Drive</title><path d="M18.706 11.213L24 20.46l-5.879 1.46-3.064-5.328zM8.288 0l-5.88 10.247 5.88 10.246h11.759L24 10.247zm-3.064 5.328H1.46L0 8.392l5.224-3.064z"/></svg>
                        Connect Google Drive
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                    <Separator className="flex-1" />
                    <span className="text-xs text-muted-foreground">OR</span>
                    <Separator className="flex-1" />
                </div>
                
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
                      <div className="flex justify-between items-center">
                        <FormLabel>Paste Text</FormLabel>
                        {renderLoadSampleButton()}
                      </div>
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
                      <div className="flex justify-between items-center">
                        <FormMessage />
                      </div>
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
              <form onSubmit={reasoningForm.handleSubmit(onReasoningSubmit)} className="space-y-4" key="reasoning-form">
                <FormField
                  control={reasoningForm.control}
                  name="scenario"
                  render={({ field }) => (
                    <FormItem>
                       <div className="flex justify-between items-center">
                        <FormLabel>Case Scenario</FormLabel>
                        {renderLoadSampleButton()}
                       </div>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the factual matrix of the case..."
                          className="min-h-[200px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                       <div className="flex justify-between items-center">
                        <FormMessage />
                      </div>
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
                       <div className="flex justify-between items-center">
                        <FormMessage />
                      </div>
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
                  <form onSubmit={draftingForm.handleSubmit(onDraftingSubmit)} className="space-y-4" key="drafting-form">
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
                           <div className="flex justify-between items-center">
                            <FormLabel>Drafting Prompt</FormLabel>
                            {renderLoadSampleButton()}
                           </div>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'Draft a basic rental agreement between John Doe (Landlord) and Jane Smith (Tenant) for a property in Delhi...'"
                              className="min-h-[150px] resize-y"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <div className="flex justify-between items-center">
                            <FormMessage />
                          </div>
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
                  <form onSubmit={predictionForm.handleSubmit(onPredictionSubmit)} className="space-y-4" key="prediction-form">
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
                          <div className="flex justify-between items-center">
                            <FormLabel>Case Summary</FormLabel>
                            {renderLoadSampleButton()}
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Provide a detailed summary of the facts, arguments, and context of the case..."
                              className="min-h-[150px] resize-y"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                           <div className="flex justify-between items-center">
                            <FormMessage />
                          </div>
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
                  <form onSubmit={negotiationForm.handleSubmit(onNegotiationSubmit)} className="space-y-4" key="negotiation-form">
                    <FormField
                      control={negotiationForm.control}
                      name="currentClause"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Clause Under Negotiation</FormLabel>
                            {renderLoadSampleButton()}
                          </div>
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
                           <div className="flex justify-between items-center">
                            <FormMessage />
                          </div>
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
        case 'cross-examination':
            return (
                 <Form {...crossExaminationForm}>
                  <form onSubmit={crossExaminationForm.handleSubmit(onCrossExaminationSubmit)} className="space-y-4" key="cross-examination-form">
                     <FormField
                      control={crossExaminationForm.control}
                      name="witnessStatement"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Witness Statement</FormLabel>
                            {renderLoadSampleButton()}
                          </div>
                          <FormControl>
                            <Textarea
                              placeholder="Paste the full text of the witness's statement here."
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
                      control={crossExaminationForm.control}
                      name="evidenceSummary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Evidence Summary</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Summarize the key pieces of evidence you have that relate to this witness."
                              className="min-h-[100px] resize-y"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                           <div className="flex justify-between items-center">
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={crossExaminationForm.control}
                            name="myRole"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>My Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="prosecution">Prosecution / Plaintiff</SelectItem>
                                    <SelectItem value="defense">Defense</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={crossExaminationForm.control}
                            name="simulationRole"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>AI Simulation Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select AI role" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="witness">As the Witness</SelectItem>
                                    <SelectItem value="opposing_counsel">As Opposing Counsel</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Preparing...</> 
                                 : <><Swords className="mr-2 h-4 w-4" /> Prepare for Examination</>}
                    </Button>
                  </form>
                </Form>
            );
        case 'timeline':
            return (
                 <Form {...timelineForm}>
                  <form onSubmit={timelineForm.handleSubmit(onTimelineSubmit)} className="space-y-4" key="timeline-form">
                     <FormField
                      control={timelineForm.control}
                      name="jurisdiction"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-center">
                            <FormLabel>Jurisdiction</FormLabel>
                            {renderLoadSampleButton()}
                          </div>
                          <FormControl>
                             <Input
                              placeholder="e.g., 'Delhi High Court', 'US Federal Court'"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={timelineForm.control}
                      name="caseType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Case Type</FormLabel>
                          <FormControl>
                             <Input
                              placeholder="e.g., 'Civil Commercial Suit', 'Criminal Appeal'"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={timelineForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Start Date (Filing/Incident)</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                   disabled={isSubmitting}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarClock className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={timelineForm.control}
                      name="knownDates"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Known Dates (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="e.g., 'First Hearing: 2025-09-10, Evidence Submission: 2025-11-15'"
                              className="min-h-[80px] resize-y"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                           <div className="flex justify-between items-center">
                                <FormMessage />
                           </div>
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Generating...</> 
                                 : <><Sparkles className="mr-2 h-4 w-4" /> Generate Timeline</>}
                    </Button>
                  </form>
                </Form>
            );
      case 'evidence':
        return (
             <Form {...evidenceForm}>
              <form onSubmit={evidenceForm.handleSubmit(onEvidenceSubmit)} className="space-y-4" key="evidence-form">
                <FormField
                  control={evidenceForm.control}
                  name="caseContext"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Case Context</FormLabel>
                        {renderLoadSampleButton()}
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Briefly describe the case context..."
                          className="min-h-[100px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                       <div className="flex justify-between items-center">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                    control={evidenceForm.control}
                    name="evidenceFiles"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Upload Evidence</FormLabel>
                             <FormControl>
                                <div>
                                    <Input 
                                        type="file"
                                        className="hidden"
                                        ref={evidenceFileInputRef}
                                        multiple
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || []);
                                            if (files.length > 0) {
                                                const newFiles = [...selectedEvidenceFiles, ...files];
                                                setSelectedEvidenceFiles(newFiles);
                                                
                                                const fileDataPromises = newFiles.map(async (file) => ({
                                                    fileName: file.name,
                                                    fileType: file.type,
                                                    dataUri: await readFileAsDataUri(file),
                                                }));

                                                const fileData = await Promise.all(fileDataPromises);
                                                field.onChange(fileData);
                                            }
                                        }}
                                        accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
                                        disabled={isSubmitting}
                                    />
                                    <div 
                                        className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                        onClick={() => evidenceFileInputRef.current?.click()}
                                    >
                                        <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                                        <p className="font-medium mt-2">Click to upload files</p>
                                        <p className="text-xs text-muted-foreground">Images, Audio, Video, Docs</p>
                                    </div>
                                </div>
                            </FormControl>
                            <FormMessage />
                            {selectedEvidenceFiles.length > 0 && (
                                <div className="space-y-2 mt-2">
                                    <p className="text-sm font-medium">Selected files:</p>
                                    {selectedEvidenceFiles.map((file, index) => (
                                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded-md">
                                             <div className="flex items-center gap-2">
                                                <FileIcon className="h-4 w-4" />
                                                <span>{file.name}</span>
                                            </div>
                                             <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const updatedFiles = selectedEvidenceFiles.filter((_, i) => i !== index);
                                                    setSelectedEvidenceFiles(updatedFiles);
                                                    evidenceForm.setValue('evidenceFiles', updatedFiles.map(f => evidenceForm.getValues('evidenceFiles').find(ef => ef.fileName === f.name)!));
                                                }}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> 
                             : <><Sparkles className="mr-2 h-4 w-4" /> Analyze Evidence</>}
                </Button>
              </form>
            </Form>
        );
      case 'patent':
        return (
            <Form {...patentSearchForm}>
              <form onSubmit={patentSearchForm.handleSubmit(onPatentSearchSubmit)} className="space-y-4" key="patent-form">
                <FormField
                  control={patentSearchForm.control}
                  name="inventionDescription"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between items-center">
                        <FormLabel>Invention Description</FormLabel>
                        {renderLoadSampleButton()}
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your invention in detail, including its components, functionality, and what makes it unique..."
                          className="min-h-[200px] resize-y"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                       <div className="flex justify-between items-center">
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Searching...</> 
                             : <><Search className="mr-2 h-4 w-4" /> Search for Prior Art</>}
                </Button>
              </form>
            </Form>
        );
      default:
        return null;
    }
  }

  const renderFooter = () => {
    const tips = {
      research: (
        <>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-yellow-500" />
            Research Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Be specific with section numbers and acts.</li>
            <li>Include jurisdiction if relevant.</li>
            <li>Mention a time period for recent cases.</li>
          </ul>
        </>
      ),
      orchestrate: (
        <>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-yellow-500" />
            Orchestration Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Clearly state your final goal (e.g., "draft a contract," "prepare for a hearing").</li>
            <li>Provide all necessary context in your prompt.</li>
            <li>The AI will break it down into steps and execute them for you.</li>
          </ul>
        </>
      ),
      patent: (
        <>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
            <Lightbulb className="h-3 w-3 text-yellow-500" />
            Patent Search Tips
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
            <li>Describe the problem your invention solves.</li>
            <li>List the key components and how they interact.</li>
            <li>Explain what you believe is novel about your approach.</li>
          </ul>
        </>
      )
    };

    const tipContent = tips[selectedMode as keyof typeof tips];
    
    if (!tipContent) return null;

    return (
        <CardFooter>
            <div className="p-4 bg-muted/50 rounded-lg w-full">
                 {tipContent}
            </div>
        </CardFooter>
    )
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
        <div className="flex justify-between items-center">
            <CardTitle className="font-headline flex items-center gap-2">
                {modes.find(m => m.value === selectedMode)?.icon && 
                    React.createElement(modes.find(m => m.value === selectedMode)!.icon, { className: "h-5 w-5 text-primary" })}
                {modes.find(m => m.value === selectedMode)?.label}
            </CardTitle>
        </div>
        <CardDescription>
            {
                selectedMode === 'research' ? 'Enter your legal query to start comprehensive AI-powered research.' :
                selectedMode === 'analyzer' ? 'Upload a document or paste text for an AI-powered review of anomalies and risks.' :
                selectedMode === 'drafting' ? 'Create contracts, petitions, and more with AI assistance.' :
                selectedMode === 'prediction' ? 'Get probability-based case strategy insights using historical data and trends.' :
                selectedMode === 'negotiation' ? 'Get AI-powered advice for contract and settlement discussions.' :
                selectedMode === 'cross-examination' ? 'Prepare for court by analyzing statements, generating questions, and simulating scenarios.' :
                selectedMode === 'orchestrate' ? 'Describe a complex legal workflow, and the AI will coordinate multiple agents to complete it.' :
                selectedMode === 'timeline' ? 'Generate a procedural timeline for a case based on jurisdiction, case type, and key dates.' :
                selectedMode === 'evidence' ? 'Upload multimodal evidence (audio, video, images, docs) for forensic analysis and contradiction detection.' :
                selectedMode === 'patent' ? 'Describe your invention to search for prior art and generate a novelty analysis report.' :
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

    



