"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Card,
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ArrowLeft, ArrowRight, FileText, Check, Info, AlertCircle, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { listDocuments, generatePresentationSection } from '@/lib/api';

interface PresentationSetupProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

// Define sections array at the beginning
const sections = [
  'executive_summary',
  'problem_statement',
  'solution_overview',
  'benefits',
  'features',
  'case_studies',
  'differentiation',
  'implementation',
  'timeline',
  'pricing',
  'team',
  'next_steps'
];

export function PresentationSetup({ onNext, onBack }: PresentationSetupProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    industry: '',
    meetingType: 'pitch',
    painPoints: [''],
    interests: [''],
    objectives: '',
    systemPrompt: 'Create professional sales presentation content with specific details for each section.',
    documents: [] as string[],
    sections: {} as Record<string, string>,
  });
  
  const [availableDocuments, setAvailableDocuments] = useState<any[]>([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState('');
  
  // Add tracking of sections being generated
  const [generationProgress, setGenerationProgress] = useState<{
    currentSection: string;
    completed: number;
    total: number;
  }>({
    currentSection: '',
    completed: 0,
    total: sections.length
  });
  
  const meetingTypes = [
    { id: 'pitch', name: 'Sales Pitch' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'discovery', name: 'Discovery Meeting' },
    { id: 'demo', name: 'Product Demo' },
    { id: 'follow_up', name: 'Follow-up Meeting' },
  ];
  
  const industries = [
    { id: 'technology', name: 'Technology' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'finance', name: 'Finance' },
    { id: 'retail', name: 'Retail' },
    { id: 'manufacturing', name: 'Manufacturing' },
    { id: 'education', name: 'Education' },
    { id: 'government', name: 'Government' },
    { id: 'energy', name: 'Energy' },
  ];
  
  // Load available documents on component mount
  useEffect(() => {
    const fetchDocuments = async () => {
      setIsLoadingDocuments(true);
      setDocumentError('');
      
      try {
        console.log('Fetching documents for presentation setup...');
        const documents = await listDocuments();
        console.log(`Received ${documents.length} documents from API`, documents);
        setAvailableDocuments(documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
        setDocumentError('Failed to load documents. Please try again.');
      } finally {
        setIsLoadingDocuments(false);
      }
    };
    
    fetchDocuments();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleListItemChange = (listName: 'painPoints' | 'interests', index: number, value: string) => {
    const newList = [...formData[listName]];
    newList[index] = value;
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };
  
  const addListItem = (listName: 'painPoints' | 'interests') => {
    setFormData(prev => ({
      ...prev,
      [listName]: [...prev[listName], '']
    }));
  };
  
  const removeListItem = (listName: 'painPoints' | 'interests', index: number) => {
    const newList = [...formData[listName]];
    newList.splice(index, 1);
    setFormData(prev => ({ ...prev, [listName]: newList }));
  };
  
  const toggleDocumentSelection = (docId: string) => {
    setFormData(prev => {
      const documents = [...prev.documents];
      if (documents.includes(docId)) {
        // Remove document if already selected
        return { ...prev, documents: documents.filter(id => id !== docId) };
      } else {
        // Add document if not selected
        return { ...prev, documents: [...documents, docId] };
      }
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenerationError('');
    setGenerationProgress({
      currentSection: '',
      completed: 0,
      total: sections.length
    });

    console.log("[PresentationSetup] Starting handleSubmit with form data:", {
      clientName: formData.clientName,
      industry: formData.industry,
      meetingType: formData.meetingType,
      documentsSelected: formData.documents ? formData.documents.length : 0,
      sections: formData.sections ? Object.keys(formData.sections) : []
    });

    // Validate essentials
    if (!formData.clientName || formData.clientName.trim() === '') {
      console.warn("[PresentationSetup] Missing client name, using default");
      formData.clientName = "Client";
    }
    
    if (!formData.industry || formData.industry.trim() === '') {
      console.warn("[PresentationSetup] Missing industry, using default");
      formData.industry = "Technology";
    }

    try {
      console.log('Starting presentation generation with the following data:', formData);
      
      // Generate content for each section
      const generatedSections: Record<string, string> = {};
      
      // Create the presentation context
      const presentationContext = {
        clientName: formData.clientName,
        industry: formData.industry,
        meetingType: formData.meetingType,
        painPoints: formData.painPoints.filter(p => p.trim()),
        interests: formData.interests.filter(i => i.trim()),
        objectives: formData.objectives
      };

      console.log('Using presentation context:', presentationContext);
      
      // Document selection is now truly optional
      const selectedDocuments = formData.documents && formData.documents.length > 0 
        ? formData.documents 
        : undefined;
      console.log('Selected documents:', selectedDocuments);

      // Create the configuration
      const config = {
        systemPrompt: formData.systemPrompt,
        temperature: 0.3,
        includeSourceAttribution: true
      };
      
      // Create an array to track progress of generation
      const totalSections = sections.length;
      let completedSections = 0;
      
      // Generate each section in sequence
      for (const section of sections) {
        try {
          // Update progress state
          setGenerationProgress({
            currentSection: getSectionTitle(section),
            completed: completedSections,
            total: totalSections
          });
          
          console.log(`Generating ${section} section...`);
          
          // Try to generate content with the API
          let content = '';
          try {
            // API call with timeout to prevent hanging
            const timeoutPromise = new Promise<string>((_, reject) => {
              setTimeout(() => reject(new Error('API request timed out')), 120000);
            });
            
            // Race between the API call and the timeout
            content = await Promise.race([
              generatePresentationSection(
                section,
                presentationContext, 
                config,
                selectedDocuments // Pass undefined if no documents are selected
              ),
              timeoutPromise
            ]);
            
            // Check if content is actually returned and not empty
            if (!content || content.trim().length < 10) {
              throw new Error('API returned empty or insufficient content');
            }
            
            console.log(`Generated ${section} section (${content.length} chars)`);
          } catch (apiError) {
            console.error(`API error generating section ${section}:`, apiError);
            // Generate fallback content
            content = generateSampleContent(section, presentationContext);
            console.log(`Using fallback content for ${section} (${content.length} chars)`);
          }
          
          completedSections++;
          
          // Update progress state
          setGenerationProgress({
            currentSection: getSectionTitle(section),
            completed: completedSections,
            total: totalSections
          });
          
          // Store content (either API-generated or fallback)
          generatedSections[section] = content;
        } catch (sectionError: any) {
          console.error(`Error generating section ${section}:`, sectionError);
          const errorMessage = sectionError instanceof Error ? sectionError.message : 'Unknown error';
          
          // Generate fallback content even in case of errors
          const fallbackContent = generateSampleContent(section, presentationContext);
          generatedSections[section] = fallbackContent;
          console.log(`Using fallback content for ${section} due to error: ${errorMessage}`);
          
          completedSections++;
          // Update progress state
          setGenerationProgress({
            currentSection: getSectionTitle(section),
            completed: completedSections,
            total: totalSections
          });
        }
      }

      // All sections generated (or failed) - pass the data to the next step
      console.log(`Presentation generation complete with ${completedSections}/${totalSections} successful sections`);
      
      // Log the generated sections
      console.log("Generated sections:", Object.keys(generatedSections).map(key => `${key}: ${generatedSections[key].length} chars`));
      
      // Validate that we have content for all required sections
      const missingSections = sections.filter(section => !generatedSections[section] || generatedSections[section].trim().length < 10);
      
      if (missingSections.length > 0) {
        console.warn(`Missing or empty content for sections: ${missingSections.join(', ')}`);
        
        // Generate fallback content for any missing sections
        for (const section of missingSections) {
          console.log(`Generating fallback content for missing section: ${section}`);
          generatedSections[section] = generateSampleContent(section, presentationContext);
        }
      }
      
      // Final check to ensure we have content for all sections
      sections.forEach(section => {
        if (!generatedSections[section] || generatedSections[section].trim().length < 10) {
          console.error(`Section ${section} still has no content after fallback generation`);
          generatedSections[section] = `# ${getSectionTitle(section)}\n\nContent for this section could not be generated.`;
        }
      });
      
      // Prepare the slides data structure
      const slides = sections.map(section => ({
        title: getSectionTitle(section),
        content: generatedSections[section],
        section: section
      }));
      
      console.log(`Prepared ${slides.length} slides for presentation`);
      
      // Add detailed logging to verify content of each slide
      console.log("Slide content validation:");
      slides.forEach((slide, index) => {
        const contentLength = slide.content ? slide.content.length : 0;
        const contentPreview = slide.content 
          ? slide.content.substring(0, Math.min(50, contentLength)) + (contentLength > 50 ? "..." : "") 
          : "EMPTY";
        
        console.log(`Slide ${index + 1} (${slide.section}): ${contentLength} chars - "${contentPreview}"`);
        
        if (!slide.content || slide.content.trim().length < 10) {
          console.warn(`Warning: Slide ${index + 1} (${slide.section}) has insufficient content!`);
        }
      });

      // Log the final data being passed
      console.log("Passing final data to next step:", {
        clientName: formData.clientName,
        industry: formData.industry,
        meetingType: formData.meetingType,
        slidesCount: slides.length,
        sectionsCount: Object.keys(generatedSections).length
      });

      // In the final onNext call, add additional validation to ensure all data is present
      const finalData = {
        clientName: formData.clientName || "Client",
        industry: formData.industry || "Technology",
        meetingType: formData.meetingType,
        sections: generatedSections,
        slides: slides, // Add slides array for direct rendering
        generatedAt: new Date().toISOString(),
      };
      
      console.log(`[PresentationSetup] Completed generation. Sending data to dashboard:`, {
        clientName: finalData.clientName,
        industry: finalData.industry,
        meetingType: finalData.meetingType,
        sectionsCount: Object.keys(finalData.sections).length,
        sections: Object.keys(finalData.sections)
      });

      setIsGenerating(false);
      onNext(finalData);
    } catch (error: any) {
      console.error('Error generating presentation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGenerationError(`Failed to generate presentation: ${errorMessage}`);
    }
  };
  
  // Helper function to generate sample content for a section when the API fails
  const generateSampleContent = (section: string, context: any): string => {
    const { clientName, industry, painPoints = [], interests = [] } = context;
    
    switch (section) {
      case 'executive_summary':
        return `# Executive Summary for ${clientName}\n\nThis presentation outlines our proposed solutions for ${clientName} in the ${industry} industry, addressing key challenges and providing innovative solutions tailored to your specific needs.`;
      
      case 'problem_statement':
        return `# Problem Statement\n\n${clientName} faces significant challenges in the ${industry} sector, including:\n\n${painPoints.map((p: string) => `- ${p}`).join('\n') || '- Challenge 1\n- Challenge 2\n- Challenge 3'}`;
      
      case 'solution_overview':
        return `# Solution Overview\n\nOur comprehensive solution for ${clientName} addresses your specific needs with cutting-edge technology and proven methodologies tailored to the ${industry} industry.`;
      
      case 'benefits':
        return `# Benefits\n\nImplementing our solution provides ${clientName} with:\n\n- Increased operational efficiency\n- Cost reduction\n- Enhanced customer satisfaction\n- Improved market positioning`;
      
      case 'features':
        return `# Key Features\n\nOur solution includes the following key features designed to address ${clientName}'s needs:\n\n- Seamless integration with existing systems\n- Advanced analytics and reporting\n- User-friendly interfaces\n- Secure data management`;
      
      case 'case_studies':
        return `# Case Studies\n\nOther clients in the ${industry} industry have achieved significant results with our solutions:\n\n- Company A: 30% increase in efficiency\n- Company B: 25% cost reduction\n- Company C: Expanded market reach by 40%`;
      
      case 'differentiation':
        return `# Competitive Differentiation\n\nWhat sets our solution apart for ${clientName}:\n\n- Industry-specific expertise in ${industry}\n- Customizable platform tailored to your needs\n- Award-winning customer support\n- Ongoing innovation and updates`;
      
      case 'implementation':
        return `# Implementation Approach\n\nOur proven implementation process for ${clientName} ensures a smooth transition:\n\n1. Discovery & Planning\n2. Configuration & Setup\n3. Testing & Validation\n4. Training & Deployment\n5. Ongoing Support`;
      
      case 'timeline':
        return `# Project Timeline\n\nEstimated timeline for implementing the solution at ${clientName}:\n\n- Week 1-2: Discovery & Planning\n- Week 3-5: Initial Setup\n- Week 6-8: Testing & Refinement\n- Week 9-10: Training & Go-Live\n- Ongoing: Support & Optimization`;
      
      case 'pricing':
        return `# Pricing & Investment\n\nInvestment required for ${clientName}:\n\n- Implementation: $X\n- Annual Licensing: $Y\n- Optional Add-ons: $Z\n\nROI typically achieved within 6-12 months.`;
      
      case 'team':
        return `# Our Team\n\nThe dedicated team supporting ${clientName}:\n\n- Account Manager: Your primary point of contact\n- Solutions Architect: Technical design and implementation\n- Industry Specialist: ${industry}-specific expertise\n- Support Team: 24/7 assistance`;
      
      case 'next_steps':
        return `# Next Steps\n\nRecommended next steps for ${clientName}:\n\n1. Review proposal details\n2. Schedule technical assessment\n3. Finalize timeline and scope\n4. Sign agreement\n5. Begin implementation process`;
      
      default:
        return `# ${section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')}\n\nCustom content for ${clientName} in the ${industry} industry will be generated for this section.`;
    }
  };

  // Helper function to get a human-readable section title
  function getSectionTitle(sectionId: string): string {
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
    
    return sectionNames[sectionId] || sectionId;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Presentation Setup</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs defaultValue="client" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="client">Client Information</TabsTrigger>
            <TabsTrigger value="goals">Goals & Interests</TabsTrigger>
            <TabsTrigger value="context">Knowledge Context</TabsTrigger>
          </TabsList>
          
          <TabsContent value="client" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  name="clientName"
                  placeholder="Enter client name"
                  value={formData.clientName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Select
                  value={formData.industry}
                  onValueChange={(value) => handleSelectChange('industry', value)}
                >
                  <SelectTrigger id="industry">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry.id} value={industry.id}>
                        {industry.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meetingType">Meeting Type</Label>
              <ToggleGroup 
                type="single" 
                className="justify-start" 
                value={formData.meetingType} 
                onValueChange={(value) => {
                  if (value) handleSelectChange('meetingType', value);
                }}
                id="meetingType"
              >
                {meetingTypes.map((type) => (
                  <ToggleGroupItem 
                    key={type.id} 
                    value={type.id} 
                    aria-label={type.name} 
                    id={`meeting-type-${type.id}`}
                  >
                    {type.name}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="pain-point-0">Pain Points</Label>
              {formData.painPoints.map((point, index) => (
                <div key={`pain-${index}`} className="flex gap-2">
                  <Input
                    placeholder={`Pain point ${index + 1}`}
                    value={point}
                    onChange={(e) => handleListItemChange('painPoints', index, e.target.value)}
                    className="flex-1"
                    id={`pain-point-${index}`}
                    name={`pain-point-${index}`}
                    aria-label={`Pain point ${index + 1}`}
                  />
                  {formData.painPoints.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeListItem('painPoints', index)}
                    >
                      -
                    </Button>
                  )}
                  {index === formData.painPoints.length - 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => addListItem('painPoints')}
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interest-0">Interests/Needs</Label>
              {formData.interests.map((interest, index) => (
                <div key={`interest-${index}`} className="flex gap-2">
                  <Input
                    placeholder={`Interest ${index + 1}`}
                    value={interest}
                    onChange={(e) => handleListItemChange('interests', index, e.target.value)}
                    className="flex-1"
                    id={`interest-${index}`}
                    name={`interest-${index}`}
                    aria-label={`Interest ${index + 1}`}
                  />
                  {formData.interests.length > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => removeListItem('interests', index)}
                    >
                      -
                    </Button>
                  )}
                  {index === formData.interests.length - 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => addListItem('interests')}
                    >
                      +
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="objectives">Key Objectives</Label>
              <Textarea
                id="objectives"
                name="objectives"
                placeholder="What are the key objectives of this presentation?"
                value={formData.objectives}
                onChange={handleInputChange}
                rows={3}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="context" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Instructions</Label>
              <Textarea
                id="systemPrompt"
                name="systemPrompt"
                placeholder="Additional instructions for the AI"
                value={formData.systemPrompt}
                onChange={handleInputChange}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                These instructions guide the AI in generating your presentation content.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Available Documents <span className="text-xs text-muted-foreground ml-1">(Optional)</span></Label>
                <Badge variant={formData.documents.length > 0 ? "default" : "outline"}>
                  {formData.documents.length} selected
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground mb-2 flex items-center">
                <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                <span>
                  Document selection is optional. Your presentation will be generated even if no documents are selected.
                </span>
              </div>
              
              {documentError && (
                <div className="flex items-center text-amber-500 text-sm mb-2">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {documentError}
                </div>
              )}
              
              <ScrollArea className="h-[350px] border rounded-md p-2">
                {isLoadingDocuments ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-500 mr-2"></div>
                      <span>Loading documents...</span>
                    </div>
                  </div>
                ) : availableDocuments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No documents found.</p>
                    <p className="text-sm">Upload documents to enhance your presentation with relevant information.</p>
                    <p className="text-sm mt-2 text-indigo-600 dark:text-indigo-400">You can still generate a presentation without documents.</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {availableDocuments.map((doc) => (
                      <Card key={doc.doc_id || doc.id} className={`
                        border mb-1 ${formData.documents.includes(doc.doc_id || doc.id) 
                          ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950/20' 
                          : ''}
                      `}>
                        <div className="p-2 flex justify-between items-center">
                          <div className="flex items-center flex-1 min-w-0">
                            <FileText className="h-4 w-4 text-indigo-500 flex-shrink-0 mr-2" />
                            <div className="truncate font-medium text-sm">
                              {doc.name || 'Unnamed Document'}
                            </div>
                            {formData.documents.includes(doc.doc_id || doc.id) && (
                              <Check className="h-4 w-4 text-indigo-500 ml-2 flex-shrink-0" />
                            )}
                          </div>
                          <Button 
                            type="button"
                            variant={formData.documents.includes(doc.doc_id || doc.id) ? "default" : "outline"}
                            size="sm"
                            className={formData.documents.includes(doc.doc_id || doc.id) ? "bg-indigo-500 hover:bg-indigo-600 h-7 px-2" : "h-7 px-2"}
                            onClick={() => toggleDocumentSelection(doc.doc_id || doc.id)}
                          >
                            {formData.documents.includes(doc.doc_id || doc.id) ? 'Selected' : 'Select'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <p className="text-xs text-muted-foreground flex items-center">
                <Info className="h-3 w-3 mr-1" />
                Selected documents will be used as knowledge context when generating your presentation. This step is optional.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        {generationError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                  Error Generating Presentation
                </h4>
                <p className="text-xs text-red-700 dark:text-red-400">
                  {generationError}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-xs h-7 px-2 py-0"
                  onClick={() => setGenerationError('')}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
            disabled={isGenerating}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          
          <Button 
            type="submit" 
            disabled={isGenerating || !formData.clientName || !formData.industry}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Create Presentation <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
        
        {isGenerating && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h3 className="text-sm font-medium mb-2">Generating Presentation</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Progress: {generationProgress.completed} of {generationProgress.total} sections</span>
                <span>{Math.round((generationProgress.completed / generationProgress.total) * 100)}%</span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(generationProgress.completed / generationProgress.total) * 100}%` }}
                ></div>
              </div>
              
              {generationProgress.currentSection && (
                <p className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">
                  Currently generating: {generationProgress.currentSection}
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}