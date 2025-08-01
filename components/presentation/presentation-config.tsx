"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ArrowRight, Layout, Palette } from 'lucide-react';

interface PresentationConfigProps {
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
    sections?: Record<string, string>;
  };
}

export function PresentationConfig({ onNext, onBack, data }: PresentationConfigProps) {
  const [configData, setConfigData] = useState({
    template: 'modern',
    sections: ['executive_summary', 'problem_statement', 'solution_overview', 'benefits', 'case_studies', 'pricing', 'next_steps'],
    slideCount: 15,
    style: 'corporate',
    colorScheme: 'brand',
  });

  const templates = [
    { id: 'modern', name: 'Modern & Clean' },
    { id: 'executive', name: 'Executive Briefing' },
    { id: 'technical', name: 'Technical Deep Dive' },
    { id: 'storytelling', name: 'Storytelling Narrative' },
    { id: 'data_driven', name: 'Data-Driven Analysis' },
  ];

  const sections = [
    { id: 'executive_summary', name: 'Executive Summary' },
    { id: 'problem_statement', name: 'Problem Statement' },
    { id: 'solution_overview', name: 'Solution Overview' },
    { id: 'benefits', name: 'Benefits & Value Proposition' },
    { id: 'features', name: 'Key Features & Capabilities' },
    { id: 'case_studies', name: 'Case Studies & Success Stories' },
    { id: 'differentiation', name: 'Competitive Differentiation' },
    { id: 'implementation', name: 'Implementation Approach' },
    { id: 'timeline', name: 'Project Timeline' },
    { id: 'pricing', name: 'Pricing & Investment' },
    { id: 'team', name: 'Team Introduction' },
    { id: 'next_steps', name: 'Next Steps' },
  ];

  const styles = [
    { id: 'corporate', name: 'Corporate Professional' },
    { id: 'creative', name: 'Creative & Bold' },
    { id: 'minimalist', name: 'Minimalist' },
    { id: 'technical', name: 'Technical & Detailed' },
    { id: 'narrative', name: 'Narrative Focus' },
  ];

  const colorSchemes = [
    { id: 'brand', name: 'Brand Colors' },
    { id: 'blue', name: 'Blue Professional' },
    { id: 'green', name: 'Green Growth' },
    { id: 'purple', name: 'Purple Innovation' },
    { id: 'red', name: 'Red Impact' },
    { id: 'neutral', name: 'Neutral & Elegant' },
  ];

  const handleSectionChange = (sectionId: string) => {
    setConfigData(prev => {
      const newSections = prev.sections.includes(sectionId)
        ? prev.sections.filter(s => s !== sectionId)
        : [...prev.sections, sectionId];
      return { ...prev, sections: newSections };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({ ...data, ...configData });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Configure Your Presentation</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Presentation Template</Label>
              <Select
                value={configData.template}
                onValueChange={(value) => setConfigData({ ...configData, template: value })}
              >
                <SelectTrigger id="template" className="w-full">
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="style">Presentation Style</Label>
              <Select
                value={configData.style}
                onValueChange={(value) => setConfigData({ ...configData, style: value })}
              >
                <SelectTrigger id="style" className="w-full">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {styles.map((style) => (
                    <SelectItem key={style.id} value={style.id}>
                      {style.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="colorScheme">Color Scheme</Label>
              <Select
                value={configData.colorScheme}
                onValueChange={(value) => setConfigData({ ...configData, colorScheme: value })}
              >
                <SelectTrigger id="colorScheme" className="w-full">
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  {colorSchemes.map((scheme) => (
                    <SelectItem key={scheme.id} value={scheme.id}>
                      {scheme.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Slide Count: {configData.slideCount}</Label>
              <Slider
                value={[configData.slideCount]}
                min={5}
                max={30}
                step={1}
                onValueChange={(value) => setConfigData({ ...configData, slideCount: value[0] })}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5 slides</span>
                <span>30 slides</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label>Presentation Sections</Label>
            <div className="bg-gray-50 dark:bg-gray-900 rounded-md p-4 h-[300px] overflow-y-auto">
              <div className="space-y-2">
                {sections.map((section) => (
                  <div key={section.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`section-${section.id}`}
                      checked={configData.sections.includes(section.id)}
                      onCheckedChange={() => handleSectionChange(section.id)}
                    />
                    <label
                      htmlFor={`section-${section.id}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {section.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mt-6">
          <div className="flex items-center mb-2">
            <Layout className="h-5 w-5 text-indigo-500 mr-2" />
            <h3 className="font-medium">Preview</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-xs text-gray-500">Title Slide</span>
            </div>
            <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-xs text-gray-500">Overview</span>
            </div>
            <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-md flex items-center justify-center">
              <span className="text-xs text-gray-500">Problem</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Preview based on {configData.template} template with {configData.style} style
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
          >
            Generate Presentation
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}