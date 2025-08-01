"use client";

import { useState, useEffect } from 'react';
import { 
  Presentation, 
  PlusCircle, 
  FileText, 
  Clock, 
  Settings, 
  X,
  ChevronRight,
  Upload,
  Trash2,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PresentationSetup } from './presentation-setup';
import { PresentationConfig } from './presentation-config';
import { PresentationProgress } from './presentation-progress';
import { PresentationReview } from './presentation-review';
import { PresentationExport } from './presentation-export';
import { PresentationLibrary } from './presentation-library';
import { DocumentManagement } from './document-management';

type PresentationStep = 'dashboard' | 'setup' | 'config' | 'progress' | 'review' | 'export' | 'library' | 'documents';

interface PresentationDashboardProps {
  onClose: () => void;
}

// Export the interface so it can be imported by other components
export interface PresentationData {
  id?: string;
  clientName: string;
  industry: string;
  meetingType?: string;
  painPoints: string[];
  interests: string[];
  objectives?: string;
  template?: string;
  sections: Record<string, string>;
  slideCount?: number;
  style?: string;
  colorScheme?: string;
  slides?: any[];
  generatedAt?: string;
  presentationId?: string;
  systemPrompt?: string;
  documents?: string[];
}

export function PresentationDashboard({ onClose }: PresentationDashboardProps) {
  const [currentStep, setCurrentStep] = useState<PresentationStep>('dashboard');
  const [presentationData, setPresentationData] = useState<PresentationData>({
    id: crypto.randomUUID(),
    clientName: '',
    industry: '',
    painPoints: [],
    interests: [],
    sections: {},
  });
  const [loading, setLoading] = useState(false);
  
  // Log when component mounts
  useEffect(() => {
    console.log("PresentationDashboard component mounted");
    return () => {
      console.log("PresentationDashboard component unmounted");
    };
  }, []);
  
  // Log step changes
  useEffect(() => {
    console.log(`Navigation to step: ${currentStep}`);
  }, [currentStep]);
  
  // Mock data for past presentations
  const pastPresentations = [
    { id: '1', title: 'Acme Corp Solution Overview', date: '2025-03-15', slides: 12, client: 'Acme Corp', industry: 'Technology' },
    { id: '2', title: 'Healthcare Solutions Pitch', date: '2025-03-10', slides: 18, client: 'MediCare Inc', industry: 'Healthcare' },
    { id: '3', title: 'Financial Services Proposal', date: '2025-03-05', slides: 15, client: 'Global Bank', industry: 'Finance' },
  ];

  // Near the top of the file, add a validation utility function
  const validatePresentationData = (data: PresentationData, source: string): PresentationData => {
    console.log(`[validatePresentationData] ${source} - Validating presentation data:`, {
      clientName: data.clientName,
      industry: data.industry,
      hasSections: !!data.sections && Object.keys(data.sections).length > 0,
      sectionsCount: data.sections ? Object.keys(data.sections).length : 0,
      hasSlides: !!data.slides && data.slides.length > 0,
      slidesCount: data.slides ? data.slides.length : 0
    });

    const validatedData = { ...data };

    // Ensure client name exists
    if (!validatedData.clientName || validatedData.clientName.trim() === '') {
      console.warn('[validatePresentationData] Missing client name, using fallback');
      validatedData.clientName = 'Client';
    }

    // Ensure industry exists
    if (!validatedData.industry || validatedData.industry.trim() === '') {
      console.warn('[validatePresentationData] Missing industry, using fallback');
      validatedData.industry = 'Technology';
    }

    // If slides don't exist but sections do, create slides from sections
    if ((!validatedData.slides || validatedData.slides.length === 0) && 
        validatedData.sections && Object.keys(validatedData.sections).length > 0) {
      console.warn('[validatePresentationData] No slides but sections exist, creating slides from sections');
      validatedData.slides = createSlidesFromSections(validatedData.sections, validatedData.clientName, validatedData.industry);
    }

    // If neither slides nor sections exist, create fallback slides
    if ((!validatedData.slides || validatedData.slides.length === 0) && 
        (!validatedData.sections || Object.keys(validatedData.sections).length === 0)) {
      console.warn('[validatePresentationData] No slides or sections, creating fallback slides');
      validatedData.slides = createFallbackSlides(validatedData.clientName, validatedData.industry);
    }

    return validatedData;
  };

  // Add helper functions to create slides
  const createSlidesFromSections = (
    sections: Record<string, string>,
    clientName: string,
    industry: string
  ): any[] => {
    const slides: any[] = [];
    
    // Add title slide
    slides.push({
      title: "Title",
      content: `# ${clientName} Presentation\n\nIndustry: ${industry}`,
      section: "title"
    });
    
    // Create slides from sections
    Object.entries(sections).forEach(([sectionId, content]) => {
      if (content && content.trim().length > 0) {
        slides.push({
          title: getSectionTitle(sectionId),
          content: content,
          section: sectionId
        });
      } else {
        slides.push({
          title: getSectionTitle(sectionId),
          content: `# ${getSectionTitle(sectionId)}\n\nContent for this section is being generated.`,
          section: sectionId
        });
      }
    });
    
    console.log(`[createSlidesFromSections] Created ${slides.length} slides from sections`);
    return slides;
  };

  const createFallbackSlides = (clientName: string, industry: string): any[] => {
    console.warn('[createFallbackSlides] Creating complete fallback slides');
    
    return [
      {
        title: "Title",
        content: `# ${clientName} Presentation\n\nIndustry: ${industry}`,
        section: "title"
      },
      {
        title: "Executive Summary",
        content: "# Executive Summary\n\nThis presentation provides a comprehensive overview of our solution for your business needs.",
        section: "executive_summary"
      },
      {
        title: "Solution Overview",
        content: `# Solution Overview\n\nOur solution is tailored for the ${industry} industry, addressing key challenges and opportunities.`,
        section: "solution_overview"
      },
      {
        title: "Next Steps",
        content: "# Next Steps\n\n1. Review this proposal\n2. Schedule follow-up meeting\n3. Begin implementation planning",
        section: "next_steps"
      }
    ];
  };

  // Helper function to get section title
  const getSectionTitle = (sectionId: string): string => {
    const sectionNames: Record<string, string> = {
      'executive_summary': 'Executive Summary',
      'problem_statement': 'Problem Statement',
      'solution_overview': 'Solution Overview',
      'benefits': 'Benefits & Value Proposition',
      'features': 'Key Features & Capabilities',
      'case_studies': 'Case Studies & Success Stories',
      'differentiation': 'Competitive Differentiation',
      'implementation': 'Implementation Approach',
      'timeline': 'Project Timeline',
      'pricing': 'Pricing & Investment',
      'team': 'Team Introduction',
      'next_steps': 'Next Steps',
    };
    
    return sectionNames[sectionId] || sectionId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };
  
  // Modify the handleNext function to validate data
  // In the PresentationDashboard component
  const handleNext = (stepData: any) => {
    setLoading(true);
    
    // Apply the validation to the new presentation data
    const newPresentationData = validatePresentationData(
      { ...presentationData, ...stepData },
      `handleNext from ${currentStep}`
    );
    
    console.log(`[handleNext] Moving from ${currentStep} to next step with validated data`);
    setPresentationData(newPresentationData);
    
    // Set the appropriate next step
    if (currentStep === 'setup') {
      setCurrentStep('review');
    } else if (currentStep === 'review') {
      setCurrentStep('export');
    } else if (currentStep === 'export') {
      setCurrentStep('dashboard');
    }
    
    setTimeout(() => setLoading(false), 500);
  };

  const handlePreviousStep = () => {
    const steps: PresentationStep[] = ['dashboard', 'setup', 'config', 'progress', 'review', 'export'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'dashboard':
        return (
          <div className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Sales Presentation Generator</h1>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Recent Activity</h3>
                  <Clock className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold">{pastPresentations.length}</p>
                <p className="text-sm text-muted-foreground">Presentations created</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Document Library</h3>
                  <FileText className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold">125</p>
                <p className="text-sm text-muted-foreground">Sales documents ingested</p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Analytics</h3>
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-sm text-muted-foreground">Positive feedback rate</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="md:col-span-2">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                  <h2 className="text-lg font-medium mb-4">Recent Presentations</h2>
                  
                  <div className="space-y-4">
                    {pastPresentations.map(presentation => (
                      <div key={presentation.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <div>
                          <h4 className="font-medium">{presentation.title}</h4>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>{presentation.client}</span>
                            <span className="mx-2">•</span>
                            <span>{new Date(presentation.date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-indigo-600 dark:text-indigo-400"
                          onClick={() => {
                            setPresentationData({
                              id: presentation.id,
                              clientName: presentation.client,
                              industry: presentation.industry,
                              painPoints: [],
                              interests: [],
                              sections: {},
                            });
                            setCurrentStep('review');
                          }}
                        >
                          View
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="mt-4 w-full"
                    onClick={() => setCurrentStep('library')}
                  >
                    View All Presentations
                  </Button>
                </div>
              </div>
              
              <div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-sm p-6 text-white h-full flex flex-col">
                  <h2 className="text-lg font-medium mb-4">Create New Presentation</h2>
                  <p className="mb-4 text-white/90">Generate professional sales presentations tailored to your client's needs in minutes.</p>
                  <Button 
                    className="mt-auto bg-white text-indigo-600 hover:bg-gray-100 hover:text-indigo-700"
                    onClick={() => setCurrentStep('setup')}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create New Presentation
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('documents')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Manage Sales Materials
              </Button>
              
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Close
              </Button>
            </div>
          </div>
        );
        
      case 'setup':
        return <PresentationSetup onNext={handleNext} onBack={() => setCurrentStep('dashboard')} />;
        
      case 'config':
        return <PresentationConfig onNext={handleNext} onBack={handlePreviousStep} data={presentationData} />;
        
      case 'progress':
        return <PresentationProgress onNext={handleNext} onBack={handlePreviousStep} data={presentationData} />;
        
      case 'review':
        return <PresentationReview 
          onNext={handleNext} 
          onBack={handlePreviousStep} 
          data={validatePresentationData(presentationData, 'renderStepContent-review')} 
        />;
        
      case 'export':
        return <PresentationExport 
          onFinishAction={() => setCurrentStep('dashboard')} 
          onBackAction={handlePreviousStep} 
          data={presentationData} 
        />;
        
      case 'library':
        return <PresentationLibrary onBack={() => setCurrentStep('dashboard')} onSelect={(id) => {
          setPresentationData({
            id,
            clientName: 'Loading...',
            industry: 'Loading...',
            painPoints: [],
            interests: [],
            sections: {},
          });
          setCurrentStep('review');
        }} />;
        
      case 'documents':
        return <DocumentManagement onBack={() => setCurrentStep('dashboard')} />;
        
      default:
        return null;
    }
  };

  return (
    <ScrollArea className="h-full">
      {renderStepContent()}
    </ScrollArea>
  );
}