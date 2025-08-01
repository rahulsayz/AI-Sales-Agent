"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, CheckCircleIcon } from 'lucide-react';
import { PresentationData } from "./presentation-dashboard";

interface PresentationProgressProps {
  onNext: (data: PresentationData) => void;
  onBack: () => void;
  data: PresentationData;
}

export function PresentationProgress({ onNext, onBack, data }: PresentationProgressProps) {
  // Get sections keys from the received data
  const sections = Object.keys(data.sections || {});
  const totalSections = sections.length;

  // Section names for display
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

  // Simple effect to log received data
  useEffect(() => {
    console.log("PresentationProgress received data:", data);
    // Verify received sections
    if (totalSections > 0) {
      console.log(`Received ${totalSections} sections:`, sections.join(', '));
    } else {
      console.warn("PresentationProgress received no sections!");
    }
  }, [data, sections, totalSections]);

  const handleContinue = () => {
    console.log("Proceeding to review step with sections:", data.sections);

    // Create slides directly from the received data.sections
    const slides = [];
    
    // Add title slide
    slides.push({
      id: 'slide-title',
      title: 'Title Slide',
      content: `${data.clientName || 'Client'} Presentation`,
      section: 'title',
    });
    
    // Add content slides for each section using data.sections
    sections.forEach((section: string) => {
      const content = data.sections?.[section] || generateSampleContent(section, data); // Use fallback if content is missing
      
      slides.push({
        id: `slide-${section}`,
        title: sectionNames[section] || section,
        content,
        section: section,
      });
    });
    
    // Pass the original data along, adding the created slides array
    const finalData = {
      ...data,
      slides,
      // Ensure sections object is passed correctly
      sections: data.sections || {},
      // generatedContent is no longer managed here
    };
    
    onNext(finalData);
  };

  // Re-add generateSampleContent locally as it's needed for fallback in handleContinue
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
        return `# ${section.charAt(0).toUpperCase() + section.slice(1).replace('_', ' ')}

Content generated for this section.`;
    }
  };

  // Display a simple confirmation/status view
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Preparing Presentation</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Content Generated Successfully</h3>
          <p className="text-muted-foreground mb-4">
            {totalSections} sections have been generated for your presentation.
          </p>
          <Progress value={100} className="h-2 mb-4" aria-label="Generation complete" />
          <p className="text-sm text-muted-foreground">
            Click continue to review and edit your slides.
          </p>
        </div>

        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="button"
            onClick={handleContinue}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            Review Presentation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}