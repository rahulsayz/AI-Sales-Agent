import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, PencilIcon, Copy } from "lucide-react";
import { saveAs } from "file-saver";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PresentationData } from "./presentation-dashboard";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Check for invalid/empty section content and display fallback message
const formatSectionContent = (content: string, section: string, clientName: string, industry: string) => {
  if (!content || content.trim().length < 10 || content.includes('Error generating')) {
    // Generate fallback content based on section type
    return generateSampleContent(section, { clientName, industry });
  }
  return content;
};

// Helper function to generate fallback content
const generateSampleContent = (section: string, context: any): string => {
  const { clientName, industry } = context;
  
  switch (section) {
    case 'executive_summary':
      return `# Executive Summary for ${clientName}\n\nThis presentation outlines our proposed solutions for ${clientName} in the ${industry} industry, addressing key challenges and providing innovative solutions tailored to your specific needs.`;
    
    case 'problem_statement':
      return `# Problem Statement\n\n${clientName} faces significant challenges in the ${industry} sector, including:\n\n- Challenge 1\n- Challenge 2\n- Challenge 3`;
    
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

interface PresentationViewerProps {
  data: PresentationData;
  onBack: () => void;
}

export function PresentationViewer({ data, onBack }: PresentationViewerProps) {
  // Define the order of sections in the presentation
  const slides = [
    "executive_summary",
    "problem_statement",
    "solution_overview",
    "benefits",
    "features",
    "case_studies",
    "differentiation",
    "implementation",
    "timeline",
    "pricing",
    "team",
    "next_steps",
  ];

  // State to hold section content (could be potentially edited in the future)
  const [sectionContent, setSectionContent] = useState<Record<string, string>>(
    data.sections || {}
  );

  // Generate section title display
  const getSectionTitle = (section: string): string => {
    return section
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Export as PDF
  const exportToPDF = async () => {
    const contentElement = document.getElementById("presentation-content");
    if (!contentElement) return;

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Capture each section as a canvas and add to PDF
    for (let i = 0; i < slides.length; i++) {
      const section = slides[i];
      const sectionElement = document.getElementById(`section-${section}`);
      
      if (sectionElement) {
        const canvas = await html2canvas(sectionElement, {
          scale: 2,
          logging: false,
        });
        
        const imgData = canvas.toDataURL("image/jpeg", 1.0);
        
        // Add a new page for each section except the first
        if (i > 0) pdf.addPage();
        
        // Calculate dimensions to fit on PDF
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add image centered on page
        pdf.addImage(imgData, "JPEG", 10, 10, imgWidth, imgHeight);
      }
    }

    pdf.save(`${data.clientName}-presentation.pdf`);
  };

  // Copy presentation to clipboard
  const copyToClipboard = () => {
    const contentString = slides
      .map((section) => {
        const title = getSectionTitle(section);
        const content = formatSectionContent(
          sectionContent[section] || '', 
          section, 
          data.clientName, 
          data.industry
        );
        return `# ${title}\n\n${content}`;
      })
      .join("\n\n");

    navigator.clipboard.writeText(contentString);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy All
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex items-center"
            onClick={exportToPDF}
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h1 className="text-2xl font-bold">{data.clientName} Presentation</h1>
        <p className="text-gray-500">
          Industry: {data.industry}
          {data.meetingType && ` | Meeting Type: ${data.meetingType}`}
        </p>
        <p className="text-gray-500 text-sm">
          Generated: {new Date(data.generatedAt || Date.now()).toLocaleString()}
        </p>
      </div>

      <div id="presentation-content">
        {slides.map((section) => {
          // Get the section content and apply formatting
          const content = formatSectionContent(
            sectionContent[section] || '',
            section,
            data.clientName,
            data.industry
          );

          return (
            <div
              key={section}
              id={`section-${section}`}
              className="bg-white p-8 rounded-lg shadow-md mb-6"
            >
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 