"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Download, Mail, Link2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import pptxgen from 'pptxgenjs';

interface PresentationExportProps {
  onFinishAction: () => void;
  onBackAction: () => void;
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
    presentationId?: string;
    template?: string;
    slides?: Array<{
      title: string;
      content: string;
      section: string;
    }>;
  };
}

export function PresentationExport({ onFinishAction, onBackAction, data }: PresentationExportProps) {
  // Add debugging logs
  console.log("PresentationExport - Component rendering with data:", {
    clientName: data.clientName,
    industry: data.industry,
    hasSections: !!data.sections,
    sectionsCount: data.sections ? Object.keys(data.sections).length : 0,
    hasSlides: !!data.slides,
    slidesCount: data.slides ? data.slides.length : 0
  });

  // Create fallback slides if needed
  const slides = data.slides && data.slides.length > 0 
    ? data.slides 
    : createFallbackSlides(data);

  // Original state initialization
  const [exportData, setExportData] = useState({
    title: data.clientName ? `${data.clientName} Presentation` : 'Sales Presentation',
    description: '',
    format: 'pptx',
    saveToLibrary: true,
    shareViaEmail: false,
    emailRecipients: '',
    theme: 'corporate',
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  // Function to create fallback slides if none exist
  function createFallbackSlides(data: PresentationExportProps['data']) {
    console.warn("No slides data available in PresentationExport, creating fallback slides");
    
    const fallbackSlides = [
      {
        title: "Title Slide",
        content: `# ${data.clientName} Presentation\n\nIndustry: ${data.industry}`,
        section: "title"
      }
    ];
    
    // Add some basic content slides if sections are available
    if (data.sections && Object.keys(data.sections).length > 0) {
      Object.entries(data.sections).forEach(([section, content]) => {
        if (content && content.trim().length > 0) {
          fallbackSlides.push({
            title: getSectionTitle(section),
            content: content,
            section: section
          });
        }
      });
    } else {
      // Add minimal fallback content if no sections
      fallbackSlides.push({
        title: "Overview",
        content: `# Solution Overview\n\nA comprehensive solution for ${data.clientName} in the ${data.industry} industry.`,
        section: "solution_overview"
      });
      
      fallbackSlides.push({
        title: "Next Steps",
        content: `# Next Steps\n\n1. Review proposal\n2. Schedule follow-up\n3. Begin implementation`,
        section: "next_steps"
      });
    }
    
    console.log(`Created ${fallbackSlides.length} fallback slides for export`);
    return fallbackSlides;
  }
  
  // Helper function to get section title
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
    
    return sectionNames[sectionId] || sectionId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Handle different export formats
      if (exportData.format === 'pptx') {
        await exportToPowerPoint();
      } else {
        // Original HTML export code
        const htmlContent = createPresentationHtml();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        
        // Create a download URL
        const url = URL.createObjectURL(blob);
        setExportUrl(url);
        
        // Trigger the download
        const a = document.createElement('a');
        a.href = url;
        a.download = `${exportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      
      // If saving to library is enabled, save the presentation data to local storage
      if (exportData.saveToLibrary) {
        saveToLibrary();
      }
      
      // If sharing via email is enabled, prepare the email
      if (exportData.shareViaEmail && exportData.emailRecipients) {
        // This would typically use an API to send emails, but we'll create a mailto link
        const emailSubject = `Sales Presentation: ${exportData.title}`;
        const emailBody = `Please find attached the sales presentation for ${data.clientName || 'your company'}.\n\n${exportData.description}\n\nGenerated on ${new Date().toLocaleDateString()}`;
        
        window.open(`mailto:${exportData.emailRecipients}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
      }
      
      toast.success(`Presentation exported successfully as ${exportData.format.toUpperCase()}!`);
      
      // Wait a bit before finishing to allow the user to see the success message
      setTimeout(() => {
        onFinishAction();
      }, 1500);
    } catch (error) {
      console.error("Error exporting presentation:", error);
      toast.error(`Failed to export presentation as ${exportData.format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  // Enhanced PowerPoint export function with improved formatting
  const exportToPowerPoint = async () => {
    try {
      // Create a new PowerPoint presentation
      const pptx = new pptxgen();
      
      // Set presentation properties
      pptx.title = exportData.title;
      pptx.subject = data.industry;
      pptx.company = data.clientName;
      pptx.author = "AI Sales Agent";
      pptx.revision = "1";
      
      // Define theme colors based on selection
      const themes = {
        corporate: {
          primary: '0F3C78', // Deep blue
          secondary: '2A7DE1', // Medium blue
          accent: 'E63946', // Accent red
          background: 'FFFFFF',
          text: '333333',
          lightText: '666666'
        },
        modern: {
          primary: '38383B', // Dark gray
          secondary: '7D7D7D', // Medium gray
          accent: '00B8D4', // Cyan
          background: 'FFFFFF',
          text: '333333',
          lightText: '666666'
        },
        vibrant: {
          primary: '6A0DAD', // Purple
          secondary: '9A4EAE', // Light purple
          accent: 'FF7043', // Orange
          background: 'FFFFFF',
          text: '333333',
          lightText: '666666'
        }
      };
      
      // Select theme
      const theme = themes[exportData.theme as keyof typeof themes] || themes.corporate;
      
      // Set global defaults for all slides
      pptx.layout = 'LAYOUT_16x9'; // Use widescreen layout
      pptx.defineLayout({
        name: 'WIDESCREEN',
        width: 10,
        height: 5.625
      });
      
      // Add master slide with consistent styling
      pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: theme.background },
        margin: [0.5, 0.5, 0.5, 0.5], // [top, right, bottom, left]
        slideNumber: { x: 0.5, y: '95%', color: theme.lightText, fontFace: 'Arial', fontSize: 10 },
        objects: [
          // Add a subtle colored rectangle at bottom instead of gradient (which isn't supported)
          { 
            rect: { 
              x: 0, y: 5.4, w: '100%', h: 0.225, 
              fill: { color: theme.primary, transparency: 85 }
            } 
          },
          // Add a thin accent line at the top
          { 
            rect: { 
              x: 0, y: 0, w: '100%', h: 0.08, 
              fill: { color: theme.accent }
            } 
          },
          // Add footer with company name
          {
            text: {
              text: data.clientName,
              options: {
                x: '90%', y: '95%', w: 2, h: 0.3,
                color: theme.primary, fontFace: 'Arial', fontSize: 10,
                align: 'right'
              }
            }
          }
        ]
      });
      
      // Create a modern title slide with a better visual layout
      const titleSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      // Add a transparent colored rectangle for visual interest
      titleSlide.addShape(pptx.ShapeType.rect, { 
        x: 0, 
        y: 0.08, 
        w: 3.5, 
        h: 5.32, 
        fill: { color: theme.primary, transparency: 15 } 
      });
      
      // Add a diagonal line for modern design
      titleSlide.addShape(pptx.ShapeType.line, {
        x: 3.5,
        y: 0.08,
        w: 1.5,
        h: 5.32,
        line: {
          color: theme.primary,
          width: 0,
          beginArrowType: 'none',
          endArrowType: 'none'
        },
        fill: { color: theme.primary, transparency: 25 }
      });
      
      // Add company logo placeholder
      titleSlide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 0.5,
        w: 2.5,
        h: 0.8,
        fill: { color: theme.secondary },
        line: { color: theme.primary, width: 1 }
      });
      
      titleSlide.addText("LOGO", {
        x: 0.5,
        y: 0.5,
        w: 2.5,
        h: 0.8,
        color: 'FFFFFF',
        fontFace: 'Arial',
        fontSize: 14,
        bold: true,
        align: 'center',
        valign: 'middle'
      });
      
      // Add a title to the slide with professional styling
      titleSlide.addText(exportData.title, {
        x: 0.5, 
        y: 1.8, 
        w: 9, 
        h: 1.0,
        fontSize: 44,
        color: theme.primary,
        fontFace: 'Arial',
        bold: true,
        align: 'left'
      });
      
      // Add a subtitle with client name and industry
      titleSlide.addText(`Prepared for: ${data.clientName}`, {
        x: 0.5, 
        y: 3.0, 
        w: 9, 
        h: 0.5,
        fontSize: 24,
        color: theme.secondary,
        fontFace: 'Arial',
        align: 'left'
      });
      
      titleSlide.addText(`Industry: ${data.industry}`, {
        x: 0.5, 
        y: 3.6, 
        w: 9, 
        h: 0.5,
        fontSize: 20,
        color: theme.lightText,
        fontFace: 'Arial',
        align: 'left'
      });
      
      // Add date with a more professional look
      titleSlide.addText(`Created: ${new Date().toLocaleDateString()}`, {
        x: 0.5, 
        y: 4.8, 
        w: 9, 
        h: 0.4,
        fontSize: 14,
        color: theme.lightText,
        fontFace: 'Arial',
        align: 'left',
        italic: true
      });
      
      // Add agenda slide
      const agendaSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      // Add a section title with background
      agendaSlide.addShape(pptx.ShapeType.rect, { 
        x: 0, 
        y: 0.08, 
        w: '100%', 
        h: 0.7, 
        fill: { color: theme.primary } 
      });
      
      agendaSlide.addText("Agenda", {
        x: 0.5, 
        y: 0.23, 
        w: 9, 
        h: 0.4,
        fontSize: 28,
        color: 'FFFFFF',
        fontFace: 'Arial',
        bold: true,
        align: 'left'
      });
      
      // Create agenda items from available slides
      const agendaItems = slides
        .filter(slide => slide.section !== 'title')
        .map(slide => slide.title || getSectionTitle(slide.section))
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
      
      if (agendaItems.length > 0) {
        // Create a formatted agenda list
        const formattedAgenda = agendaItems.map((item, i) => ({
          text: item,
          options: {
            bullet: { type: 'number' as const, numberType: 'arabicPeriod' as const },
            bold: i === 0, // Bold the first item for emphasis
            breakLine: true,
            indentLevel: 0
          }
        }));
        
        agendaSlide.addText(formattedAgenda, {
          x: 0.5,
          y: 1.0,
          w: 9,
          h: 4.0,
          color: theme.text,
          fontFace: 'Arial',
          fontSize: 20,
          lineSpacing: 36
        });
      } else {
        agendaSlide.addText("Presentation Overview", {
          x: 0.5,
          y: 1.0,
          w: 9,
          h: 4.0,
          color: theme.text,
          fontFace: 'Arial',
          fontSize: 20
        });
      }
      
      // Improved content slide creation
      if (slides && slides.length > 0) {
        // Skip the first slide if it's a title slide (since we already created one)
        const contentSlides = slides[0].section === 'title' ? slides.slice(1) : slides;
        
        contentSlides.forEach((slideData, index) => {
          const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
          
          // Add a section title with colored background
          slide.addShape(pptx.ShapeType.rect, { 
            x: 0, 
            y: 0.08, 
            w: '100%', 
            h: 0.7, 
            fill: { color: theme.primary } 
          });
          
          // Add slide title with better positioning
          slide.addText(slideData.title || getSectionTitle(slideData.section), {
            x: 0.5, 
            y: 0.23, 
            w: 9, 
            h: 0.4,
            fontSize: 28,
            color: 'FFFFFF',
            fontFace: 'Arial',
            bold: true,
            align: 'left'
          });
          
          // Add section indicator for better navigation
          slide.addText(getSectionTitle(slideData.section), {
            x: 7, 
            y: 0.8, 
            w: 2.5, 
            h: 0.25,
            fontSize: 10,
            color: theme.secondary,
            fontFace: 'Arial',
            italic: true,
            align: 'right'
          });
          
          // Process the content - convert from markdown to PowerPoint compatible format
          const { mainPoints, subPoints } = processContentForPowerPoint(slideData.content);
          
          // Add a clean layout with a sidebar for visual interest
          if (index % 3 === 0) { // Every third slide gets a different layout for variety
            // Add a sidebar for visual interest
            slide.addShape(pptx.ShapeType.rect, { 
              x: 0, 
              y: 0.78, 
              w: 1.5, 
              h: 4.62, 
              fill: { color: theme.secondary, transparency: 80 } 
            });
            
            // Add main content with indentation
            if (mainPoints.length > 0) {
              const formattedPoints = mainPoints.map(p => ({
                text: p.trim(),
                options: { 
                  bullet: { type: 'bullet' as 'bullet' },
                  breakLine: true 
                }
              })).filter(p => p.text.length > 0);
            
              slide.addText(formattedPoints, {
                x: 2.0, 
                y: 1.2, 
                w: 7.5, 
                h: 4.0,
                fontSize: 18,
                color: theme.text,
                fontFace: 'Arial',
                lineSpacing: 32
              });
            }
          } else {
            // Standard layout
            // Add the main bullet points with better positioning and spacing
            if (mainPoints.length > 0) {
              const formattedPoints = mainPoints.map(p => ({
                text: p.trim(),
                options: { 
                  bullet: { type: 'bullet' as 'bullet' },
                  breakLine: true 
                }
              })).filter(p => p.text.length > 0);
            
              slide.addText(formattedPoints, {
                x: 0.5, 
                y: 1.2, 
                w: 9, 
                h: 3.0,
                fontSize: 18,
                color: theme.text,
                fontFace: 'Arial',
                lineSpacing: 32
              });
            }
          }
          
          // Add sub-points with better indentation and visual styling
          if (subPoints.length > 0) {
            const formattedSubPoints = subPoints.map(p => ({
              text: p.trim(),
              options: { 
                bullet: true,
                breakLine: true,
                indentLevel: 1 
              }
            })).filter(p => p.text.length > 0);
            
            slide.addText(formattedSubPoints, {
              x: 1.0, 
              y: mainPoints.length > 0 ? 3.2 : 1.2,
              w: 8.5, 
              h: 2.0,
              fontSize: 16,
              color: theme.lightText,
              fontFace: 'Arial',
              lineSpacing: 28
            });
          }
        });
      }
      
      // Create a refined closing slide
      const closingSlide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
      
      // Add title bar
      closingSlide.addShape(pptx.ShapeType.rect, { 
        x: 0, 
        y: 0.08, 
        w: '100%', 
        h: 0.7, 
        fill: { color: theme.primary } 
      });
      
      closingSlide.addText("Thank You", {
        x: 0.5, 
        y: 0.23, 
        w: 9, 
        h: 0.4,
        fontSize: 28,
        color: 'FFFFFF',
        fontFace: 'Arial',
        bold: true,
        align: 'left'
      });
      
      // Fix the roundRect to use standard rect with proper properties
      closingSlide.addShape(pptx.ShapeType.rect, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 3,
        fill: { color: theme.primary, transparency: 90 },
        line: { color: theme.accent, width: 1 }
      });
      
      // Add thank you content
      const thankYouText = [
        { text: "We appreciate your time and consideration.", options: { breakLine: true, bold: true } },
        { text: `For more information about our solutions for ${data.clientName},`, options: { breakLine: true } },
        { text: "please don't hesitate to contact us.", options: { breakLine: true } }
      ];
      
      closingSlide.addText(thankYouText, {
        x: 1.0, 
        y: 1.7, 
        w: 8, 
        h: 2,
        fontSize: 20,
        color: theme.text,
        fontFace: 'Arial',
        align: 'center',
        lineSpacing: 32
      });
      
      // Add contact information
      closingSlide.addText("Contact Information", {
        x: 1.0,
        y: 3.5,
        w: 8,
        h: 0.3,
        fontSize: 16,
        color: theme.secondary,
        fontFace: 'Arial',
        bold: true,
        align: 'center'
      });
      
      closingSlide.addText("sales@example.com | +1 (555) 123-4567", {
        x: 1.0,
        y: 3.9,
        w: 8,
        h: 0.3,
        fontSize: 14,
        color: theme.lightText,
        fontFace: 'Arial',
        align: 'center'
      });
      
      // Save the presentation and trigger download
      await pptx.writeFile({ fileName: `${exportData.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pptx` });
      
      console.log('PowerPoint export completed successfully');
      return true;
    } catch (error) {
      console.error('Error generating PowerPoint:', error);
      throw new Error('Failed to generate PowerPoint presentation');
    }
  };
  
  // Enhanced helper function to process markdown content for PowerPoint
  const processContentForPowerPoint = (markdownContent: string): { mainPoints: string[], subPoints: string[] } => {
    if (!markdownContent) return { mainPoints: ["No content available"], subPoints: [] };
    
    // Remove source attributions if present
    let cleanContent = markdownContent;
    if (cleanContent.includes('---')) {
      const parts = cleanContent.split('---');
      cleanContent = parts[0].trim();
    }
    
    // Strip markdown formatting
    cleanContent = cleanContent
      .replace(/^# (.*$)/gm, '') // Remove h1 as we use the slide title
      .replace(/^## (.*$)/gm, '') // Remove h2 as we use the slide title
      .replace(/^### (.*$)/gm, '') // Remove h3 headings
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
      .replace(/_(.*?)_/g, '$1') // Remove italic markers (alt)
      .replace(/`(.*?)`/g, '$1'); // Remove code markers
    
    // Extract bullet points
    const mainPoints: string[] = [];
    const subPoints: string[] = [];
    
    // Split by lines and process
    const lines = cleanContent.split('\n');
    
    let inList = false;
    let currentMainPoint = '';
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Check if it's a top-level bullet point
      if (trimmedLine.match(/^[-*] /)) {
        // If we were building a main point, push it first
        if (currentMainPoint) {
          mainPoints.push(currentMainPoint);
          currentMainPoint = '';
        }
        
        // Add this as a main point
        const content = trimmedLine.substring(2).trim();
        if (content) mainPoints.push(content);
        inList = true;
      } 
      // Check if it's a numbered list item
      else if (trimmedLine.match(/^\d+\. /)) {
        // If we were building a main point, push it first
        if (currentMainPoint) {
          mainPoints.push(currentMainPoint);
          currentMainPoint = '';
        }
        
        // Add this as a main point
        const content = trimmedLine.replace(/^\d+\. /, '').trim();
        if (content) mainPoints.push(content);
        inList = true;
      }
      // Check if it's a sub-bullet point (indented)
      else if (trimmedLine.match(/^\s+[-*] /)) {
        const content = trimmedLine.replace(/^\s+[-*] /, '').trim();
        if (content) subPoints.push(content);
      }
      // Normal text - if it's not empty and not just punctuation
      else if (trimmedLine && trimmedLine.length > 1 && !trimmedLine.match(/^[.,:;!?]+$/)) {
        // If we're not in a list, build up the main point
        if (!inList) {
          if (currentMainPoint) currentMainPoint += ' ';
          currentMainPoint += trimmedLine;
        }
        // If we're in a list but hit normal text, consider it a main point
        else {
          if (trimmedLine) mainPoints.push(trimmedLine);
        }
      }
    });
    
    // Add the last main point if there is one
    if (currentMainPoint) {
      mainPoints.push(currentMainPoint);
    }
    
    // Make sure we have at least one main point
    if (mainPoints.length === 0) {
      // Split the content into sentences and use those as main points
      const sentences = cleanContent.split(/[.!?]+/).filter(s => s.trim().length > 0);
      if (sentences.length > 0) {
        mainPoints.push(...sentences.map(s => s.trim()));
      } else {
        mainPoints.push("Content available in presentation");
      }
    }
    
    return { mainPoints, subPoints };
  };
  
  const saveToLibrary = () => {
    try {
      // Get existing presentations from local storage
      const existingPresentationsJson = localStorage.getItem('presentations');
      const existingPresentations = existingPresentationsJson ? JSON.parse(existingPresentationsJson) : [];
      
      // Add the new presentation
      const presentationToSave = {
        id: data.presentationId || `pres-${Date.now()}`,
        title: exportData.title,
        description: exportData.description,
        client: data.clientName,
        industry: data.industry,
        date: new Date().toISOString(),
        slides: data.slides?.length || 0,
        views: 0,
        downloads: 1,
      };
      
      // Add to the array of presentations
      existingPresentations.push(presentationToSave);
      
      // Save back to local storage
      localStorage.setItem('presentations', JSON.stringify(existingPresentations));
    } catch (error) {
      console.error("Error saving to library:", error);
      // Continue even if this fails
    }
  };
  
  const createPresentationHtml = (): string => {
    // Create a simple HTML representation of the presentation
    const slideHtml = slides.map((slide: any, index: number) => {
      return `
        <div class="slide">
          <h2>${slide.title || `Slide ${index + 1}`}</h2>
          <div class="content">
            ${(slide.content || "No content available").replace(/\n/g, '<br>')}
          </div>
          <div class="slide-number">${index + 1} / ${slides.length}</div>
        </div>
      `;
    }).join('');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${exportData.title}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .presentation {
            width: 100%;
            max-width: 900px;
            margin: 0 auto;
          }
          .slide {
            border: 1px solid #ccc;
            margin: 20px 0;
            padding: 30px;
            border-radius: 5px;
            background: #fff;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            position: relative;
            page-break-after: always;
          }
          h2 {
            color: #4338ca;
            margin-top: 0;
          }
          .content {
            line-height: 1.6;
          }
          .slide-number {
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-size: 12px;
            color: #999;
          }
          @media print {
            .slide {
              box-shadow: none;
              border: none;
              page-break-after: always;
            }
          }
        </style>
      </head>
      <body>
        <div class="presentation">
          <h1>${exportData.title}</h1>
          <p>${exportData.description}</p>
          <p>Generated for ${data.clientName} on ${new Date().toLocaleDateString()}</p>
          ${slideHtml}
        </div>
      </body>
      </html>
    `;
  };
  
  const handleDownloadPreview = () => {
    const htmlContent = createPresentationHtml();
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportData.title}_preview.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast.success("Preview downloaded");
  };
  
  const handleGenerateLink = () => {
    // In a real app, this would generate a shareable link to a hosted version
    // For now, we'll just show a toast message
    toast.success("Link copied to clipboard!");
    navigator.clipboard.writeText("https://example.com/presentations/share/123456");
  };
  
  const handleEmailToSelf = () => {
    const emailSubject = `Sales Presentation: ${exportData.title}`;
    const emailBody = `Here's the sales presentation for ${data.clientName || 'your company'}.\n\n${exportData.description}\n\nGenerated on ${new Date().toLocaleDateString()}`;
    
    window.open(`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`);
    toast.success("Email created");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Export Presentation</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Presentation Title</Label>
            <Input
              id="title"
              value={exportData.title}
              onChange={(e) => setExportData({ ...exportData, title: e.target.value })}
              placeholder="Enter presentation title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={exportData.description}
              onChange={(e) => setExportData({ ...exportData, description: e.target.value })}
              placeholder="Add a description for this presentation"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={exportData.format}
              onValueChange={(value) => setExportData({ ...exportData, format: value })}
            >
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="html">Web Presentation (.html)</SelectItem>
                <SelectItem value="pptx">PowerPoint (.pptx)</SelectItem>
                <SelectItem value="pdf" disabled>PDF Document (.pdf)</SelectItem>
                <SelectItem value="jpg" disabled>Image Slides (.jpg)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">HTML and PowerPoint export formats are supported</p>
          </div>

          {/* Add theme selector when PowerPoint is selected */}
          {exportData.format === 'pptx' && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="theme">Presentation Theme</Label>
              <Select
                value={exportData.theme}
                onValueChange={(value) => setExportData({ ...exportData, theme: value })}
              >
                <SelectTrigger id="theme">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="corporate">Corporate Blue</SelectItem>
                  <SelectItem value="modern">Modern Gray</SelectItem>
                  <SelectItem value="vibrant">Vibrant Purple</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Choose a professional theme for your PowerPoint presentation</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="saveToLibrary"
                checked={exportData.saveToLibrary}
                onCheckedChange={(checked) => 
                  setExportData({ ...exportData, saveToLibrary: checked as boolean })
                }
              />
              <label
                htmlFor="saveToLibrary"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Save to presentation library
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="shareViaEmail"
                checked={exportData.shareViaEmail}
                onCheckedChange={(checked) => 
                  setExportData({ ...exportData, shareViaEmail: checked as boolean })
                }
              />
              <label
                htmlFor="shareViaEmail"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Share via email
              </label>
            </div>

            {exportData.shareViaEmail && (
              <div className="pl-6 space-y-2">
                <Label htmlFor="emailRecipients">Email Recipients</Label>
                <Input
                  id="emailRecipients"
                  value={exportData.emailRecipients}
                  onChange={(e) => setExportData({ ...exportData, emailRecipients: e.target.value })}
                  placeholder="Enter email addresses (comma separated)"
                />
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium mb-4">Presentation Summary</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client:</span>
                <span className="font-medium">{data.clientName || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Industry:</span>
                <span className="font-medium">{data.industry || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meeting Type:</span>
                <span className="font-medium">{data.meetingType || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Slides:</span>
                <span className="font-medium">{data.slides?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Template:</span>
                <span className="font-medium">{data.template || 'Default'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span className="font-medium">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="font-medium mb-4">Export Options</h3>
            
            <div className="space-y-4">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleDownloadPreview}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Preview
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleGenerateLink}
              >
                <Link2 className="mr-2 h-4 w-4" />
                Generate Shareable Link
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={handleEmailToSelf}
              >
                <Mail className="mr-2 h-4 w-4" />
                Email to Myself
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={onBackAction}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button 
          type="button"
          onClick={handleExport}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Presentation
            </>
          )}
        </Button>
      </div>
    </div>
  );
}