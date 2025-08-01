"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, RefreshCw, Trash2, Plus, Edit, Download, AlertCircle } from 'lucide-react';
import { generatePresentationSection } from '@/lib/api';

interface PresentationReviewProps {
  onNext: (data: any) => void;
  onBack: () => void;
  data: {
    clientName: string;
    industry: string;
    painPoints: string[];
    interests: string[];
    meetingType?: string;
    objectives?: string;
    systemPrompt?: string;
    documents?: string[];
    sections: Record<string, string>;
    generatedAt?: string;
    slides?: Array<{
      title: string;
      content: string;
      section: string;
    }>;
  };
}

interface Slide {
  id: string;
  title: string;
  content: string;
  section: string;
  isGenerating?: boolean;
  error?: string;
}

export function PresentationReview({ onNext, onBack, data }: PresentationReviewProps) {
  // Add this debugging log
  console.log("PresentationReview - Component rendering with data:", {
    clientName: data.clientName,
    industry: data.industry,
    hasSections: !!data.sections,
    sectionsCount: data.sections ? Object.keys(data.sections).length : 0,
    hasSlides: !!data.slides,
    slidesCount: data.slides ? data.slides.length : 0
  });

  const [activeSlide, setActiveSlide] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [slides, setSlides] = useState<Slide[]>([]);
  
  // Initialize slides from the generated content
  useEffect(() => {
    console.log("PresentationReview received data:", data);
    
    // Check if we already have slides data (preferred)
    if (data.slides && Array.isArray(data.slides) && data.slides.length > 0) {
      console.log(`Using ${data.slides.length} slides from data.slides`);
      
      // Convert to our internal Slide format if needed
      const initialSlides: Slide[] = data.slides.map((slide: any, index: number) => ({
        id: `slide-${index}`,
        title: slide.title || `Slide ${index + 1}`,
        content: slide.content || '',
        section: slide.section || `section-${index + 1}`,
        error: !slide.content || slide.content.trim().length < 10 ? 'Content is missing or too short' : undefined
      }));
      
      setSlides(initialSlides);
      return;
    }
    
    // If no slides, create from sections (backward compatibility)
    console.log("Creating slides from sections data");
    const initialSlides: Slide[] = [];
    
    // Add title slide
    initialSlides.push({
      id: 'slide-title',
      title: 'Title Slide',
      content: `${data.clientName} - Sales Presentation\nIndustry: ${data.industry}`,
      section: 'title'
    });
    
    // Add content slides and handle missing or empty sections
    if (data.sections && Object.keys(data.sections).length > 0) {
      Object.entries(data.sections).forEach(([section, content], index) => {
        // If content is missing or too short, generate fallback content
        const slideContent = !content || content.trim().length < 10 
          ? generateFallbackContent(section, data)
          : content;
        
        initialSlides.push({
          id: `slide-${index + 1}`,
          title: getSectionTitle(section),
          content: slideContent,
          section: section,
          error: !content || content.trim().length < 10 ? 'Using fallback content due to generation error' : undefined
        });
      });
    } else {
      // No sections data, add some basic fallback slides
      console.warn("No sections data available, creating basic fallback slides");
      ['executive_summary', 'problem_statement', 'solution_overview', 'next_steps'].forEach((section, index) => {
        initialSlides.push({
          id: `slide-${index + 1}`,
          title: getSectionTitle(section),
          content: generateFallbackContent(section, data),
          section: section,
          error: 'Using fallback content (no section data available)'
        });
      });
    }
    
    console.log(`Created ${initialSlides.length} slides (including ${initialSlides.filter(s => s.error).length} with errors)`);
    setSlides(initialSlides);
  }, [data]);
  
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
  
  const handleEditSlide = () => {
    if (editMode) {
      // Save changes
      setSlides(prev => prev.map((slide, index) => 
        index === activeSlide ? { ...slide, content: editContent } : slide
      ));
      setEditMode(false);
    } else {
      // Enter edit mode
      setEditContent(slides[activeSlide]?.content || '');
      setEditMode(true);
    }
  };
  
  const handleRegenerateSlide = async () => {
    const currentSlide = slides[activeSlide];
    if (!currentSlide || currentSlide.section === 'title') return;
    
    // Update slide state to show generation in progress
    setSlides(prev => prev.map((slide, index) => 
      index === activeSlide ? { ...slide, isGenerating: true, error: undefined } : slide
    ));
    
    try {
      console.log(`Regenerating content for section: ${currentSlide.section}`);
      
      // Create the presentation context from the data
      const presentationContext = {
        clientName: data.clientName,
        industry: data.industry,
        painPoints: data.painPoints,
        interests: data.interests,
        meetingType: data.meetingType || 'pitch',
        objectives: data.objectives
      };
      
      // Configuration options
      const sectionConfig = {
        systemPrompt: data.systemPrompt,
        temperature: 0.5, // Slightly higher temperature for regeneration to get variation
        includeSourceAttribution: true
      };
      
      // Call the API to generate new content
      let newContent = '';
      
      try {
        newContent = await generatePresentationSection(
          currentSlide.section,
          presentationContext,
          sectionConfig,
          data.documents
        );
        
        console.log(`Successfully regenerated content for section: ${currentSlide.section}`);
      } catch (apiError) {
        console.error(`API error regenerating content for ${currentSlide.section}:`, apiError);
        
        // Generate fallback content if API fails
        newContent = generateFallbackContent(currentSlide.section, presentationContext);
        console.log(`Using fallback content for ${currentSlide.section}`);
      }
      
      // Update slide with new content
      setSlides(prev => prev.map((slide, index) => 
        index === activeSlide 
          ? { ...slide, content: newContent, isGenerating: false, error: undefined } 
          : slide
      ));
      
      // Update edit content if in edit mode
      if (editMode) {
        setEditContent(newContent);
      }
    } catch (error) {
      console.error(`Error regenerating slide for section ${currentSlide.section}:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Create fallback content even on error
      try {
        const fallbackContent = generateFallbackContent(currentSlide.section, {
          clientName: data.clientName,
          industry: data.industry,
          painPoints: data.painPoints || [],
          interests: data.interests || []
        });
        
        setSlides(prev => prev.map((slide, index) => 
          index === activeSlide 
            ? { 
                ...slide, 
                content: fallbackContent, 
                isGenerating: false, 
                error: `API failed: ${errorMessage}. Using fallback content.` 
              } 
            : slide
        ));
        
        if (editMode) {
          setEditContent(fallbackContent);
        }
      } catch (fallbackError) {
        // If even fallback generation fails
        setSlides(prev => prev.map((slide, index) => 
          index === activeSlide 
            ? { ...slide, isGenerating: false, error: `Failed to regenerate content: ${errorMessage}` } 
            : slide
        ));
      }
    }
  };
  
  // Generate fallback content when API fails
  const generateFallbackContent = (section: string, context: any): string => {
    const { clientName, industry, painPoints = [], interests = [] } = context;
    
    switch (section) {
      case 'executive_summary':
        return `# Executive Summary for ${clientName}\n\nThis presentation outlines our proposed solutions for ${clientName} in the ${industry} industry, addressing key challenges and providing innovative solutions tailored to your specific needs.`;
      
      case 'problem_statement':
        return `# Problem Statement\n\n${clientName} faces significant challenges in the ${industry} sector, including:\n\n${painPoints.map((p: string) => `- ${p}`).join('\n')}`;
      
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
  
  const handleContinue = () => {
    // Ensure slides exist
    if (!slides || slides.length === 0) {
      console.error("Cannot continue - no slides data available");
      return;
    }
    
    console.log(`Continuing to export with ${slides.length} slides`);
    
    // Ensure we're passing all the necessary data with the updated slides
    const finalData = {
      ...data,
      slides: slides.map(slide => ({
        title: slide.title,
        content: slide.content,
        section: slide.section
      }))
    };
    
    // Log the data we're passing to export
    console.log("Data being passed to export:", {
      clientName: finalData.clientName,
      industry: finalData.industry,
      slidesCount: finalData.slides.length,
      hasSections: !!finalData.sections,
      sectionsCount: finalData.sections ? Object.keys(finalData.sections).length : 0
    });
    
    onNext(finalData);
  };

  function displaySlideContent(content: string): React.ReactNode {
    console.log(`displaySlideContent called with content length: ${content ? content.length : 0}`);
    console.log(`Content preview: ${content ? content.substring(0, Math.min(50, content.length)) : "NULL"}`);
    
    if (!content || content.trim().length === 0) {
      console.warn("Empty content detected for slide, displaying placeholder");
      return (
        <div className="text-center text-gray-500 italic">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No content available for this slide</p>
        </div>
      );
    }
    
    // Check if the content contains a source section (marked by ---)
    let mainContent = content;
    let sourceSection = '';
    
    if (content.includes('---')) {
      const parts = content.split('---');
      mainContent = parts[0].trim();
      sourceSection = parts.slice(1).join('---').trim();
    }
    
    // Process markdown for the main content
    const processedContent = processMarkdown(mainContent);
    
    if (sourceSection) {
      return (
        <>
          <div className="mb-6">{processedContent}</div>
          
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-4 text-xs text-gray-500 text-left">
            <div dangerouslySetInnerHTML={{ __html: sourceSection.replace(/\n/g, '<br/>') }} />
          </div>
        </>
      );
    }
    
    // If no source section is found, just return the processed content
    return processedContent;
  }
  
  // Process markdown text into formatted JSX
  function processMarkdown(text: string): React.ReactNode {
    // Split the text into lines
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    let inList = false;
    let listItems: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check for headers
      if (line.startsWith('# ')) {
        elements.push(<h1 key={`h1-${i}`} className="text-xl font-bold mb-3">{line.substring(2)}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={`h2-${i}`} className="text-lg font-bold mb-2">{line.substring(3)}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={`h3-${i}`} className="text-md font-bold mb-2">{line.substring(4)}</h3>);
      } 
      // Check for list items
      else if (line.match(/^[\*\-] /)) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        listItems.push(line.substring(2));
        
        // If this is the last line or the next line is not a list item, render the list
        if (i === lines.length - 1 || !lines[i + 1].match(/^[\*\-] /)) {
          elements.push(
            <ul key={`ul-${i}`} className="list-disc pl-5 mb-3">
              {listItems.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
          );
          inList = false;
        }
      }
      // Check for numbered list items
      else if (line.match(/^\d+\. /)) {
        if (!inList) {
          inList = true;
          listItems = [];
        }
        // Extract the text after the number and dot
        const match = line.match(/^\d+\. (.*)/);
        if (match) {
          listItems.push(match[1]);
        }
        
        // If this is the last line or the next line is not a numbered list item, render the list
        if (i === lines.length - 1 || !lines[i + 1].match(/^\d+\. /)) {
          elements.push(
            <ol key={`ol-${i}`} className="list-decimal pl-5 mb-3">
              {listItems.map((item, idx) => <li key={idx}>{item}</li>)}
            </ol>
          );
          inList = false;
        }
      }
      // Handle paragraph text
      else if (line.trim() !== '') {
        elements.push(<p key={`p-${i}`} className="mb-2">{line}</p>);
      }
      // Add spacing for empty lines
      else {
        elements.push(<div key={`space-${i}`} className="h-2"></div>);
      }
    }
    
    return <div className="text-left">{elements}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Review Your Presentation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="font-medium mb-4">Slides</h3>
          
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {slides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`p-2 rounded-md cursor-pointer ${
                  activeSlide === index 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                onClick={() => setActiveSlide(index)}
              >
                <div className="aspect-video bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mb-1 flex items-center justify-center">
                  <span className="text-xs text-gray-500">{index + 1}</span>
                </div>
                <div className="text-xs font-medium truncate">{slide.title}</div>
              </div>
            ))}
            
            <Button variant="outline" size="sm" className="w-full mt-2">
              <Plus className="h-4 w-4 mr-1" />
              Add Slide
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-3 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Slide {activeSlide + 1}: {slides[activeSlide]?.title}</h3>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleEditSlide}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  {editMode ? 'Save' : 'Edit'}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleRegenerateSlide}
                >
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Regenerate
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="aspect-video bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center p-6 overflow-auto">
              {slides[activeSlide]?.isGenerating ? (
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p>Regenerating content...</p>
                </div>
              ) : editMode ? (
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full resize-none"
                />
              ) : !slides[activeSlide] ? (
                <div className="text-center text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-4" />
                  <p>Error: Slide not found</p>
                  <p className="text-sm mt-2">There seems to be an issue with the slide data</p>
                </div>
              ) : (
                <div className="text-center w-full">
                  <h2 className="text-xl font-bold mb-4">{slides[activeSlide]?.title || `Slide ${activeSlide + 1}`}</h2>
                  
                  <div className="whitespace-pre-wrap text-left">
                    {slides[activeSlide]?.content ? 
                      displaySlideContent(slides[activeSlide].content) : 
                      <div className="p-4 bg-amber-50 text-amber-700 rounded-md">
                        <AlertCircle className="h-5 w-5 inline-block mr-2" />
                        No content available for this slide. Try regenerating it.
                      </div>
                    }
                  </div>
                  
                  {slides[activeSlide]?.error && (
                    <div className="mt-4 text-red-500 flex items-center justify-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {slides[activeSlide].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <Tabs defaultValue="notes">
              <TabsList className="mb-4">
                <TabsTrigger value="notes">Speaker Notes</TabsTrigger>
                <TabsTrigger value="settings">Slide Settings</TabsTrigger>
                <TabsTrigger value="media">Media</TabsTrigger>
              </TabsList>
              
              <TabsContent value="notes">
                <Textarea
                  placeholder="Add speaker notes for this slide..."
                  className="min-h-[100px]"
                />
              </TabsContent>
              
              <TabsContent value="settings">
                <div className="text-sm text-muted-foreground">
                  Slide layout and appearance settings will appear here.
                </div>
              </TabsContent>
              
              <TabsContent value="media">
                <div className="text-sm text-muted-foreground">
                  Add images, charts, and other media to this slide.
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          type="button" 
          onClick={handleContinue}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
        >
          Continue
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}