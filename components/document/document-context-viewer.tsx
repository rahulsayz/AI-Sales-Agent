"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";

interface ContextChunk {
  object: string;
  score: number;
  document: {
    object: string;
    doc_id: string;
    doc_metadata: {
      file_name?: string;
      doc_id: string;
      window: string;
      original_text: string;
    };
  };
  text: string;
  previous_texts: string[];
  next_texts: string[];
}

interface DocumentContextViewerProps {
  chunks?: ContextChunk[];
  isLoading?: boolean;
}

export function DocumentContextViewer({ chunks = [], isLoading = false }: DocumentContextViewerProps) {
  const [activeSection, setActiveSection] = useState(0);
  
  // If no chunks are provided or still loading, show a loading state
  if (isLoading) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
          <div className="grid grid-cols-2 gap-4 w-full">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }
  
  if (chunks.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden p-6 text-center">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No Document Context Available</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No relevant document chunks were found for this query.
        </p>
      </div>
    );
  }
  
  // Get background color based on score
  const getScoreBackgroundColor = (score: number) => {
    if (score >= 0.715) return 'bg-primary-custom text-white';
    if (score >= 0.710) return 'bg-secondary-custom text-white';
    return 'bg-tertiary-custom text-white';
  };
  
  // Format the heading for each section
  const formatHeading = (chunk: ContextChunk) => {
    // Try to extract a meaningful heading from the text or surrounding context
    const text = chunk.text.trim();
    const nextText = chunk.next_texts[0]?.trim() || '';
    
    // If the text is a number followed by a period (like "5."), combine with next text
    if (/^\d+\.\s*$/.test(text) && nextText) {
      const nextWords = nextText.split(' ').slice(0, 3).join(' ');
      return `${text} ${nextWords}${nextWords.length < nextText.length ? '...' : ''}`;
    }
    
    // If text is very short, try to add some context
    if (text.length < 20 && nextText) {
      return `${text} ${nextText.split(' ').slice(0, 3).join(' ')}...`;
    }
    
    // If text is too long, truncate it
    if (text.length > 40) {
      return `${text.substring(0, 40)}...`;
    }
    
    return text;
  };

  const activeChunk = chunks[activeSection];
  const fileName = activeChunk?.document.doc_metadata.file_name;
  const fileExtension = fileName?.split('.').pop()?.toUpperCase();

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Navigation sidebar */}
        <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold">Document Sections</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Click to view details</p>
          </div>
          <ScrollArea className="h-[300px] md:h-[400px]">
            {chunks.map((chunk, index) => (
              <button
                key={`${chunk.document.doc_id}-${index}`}
                className={cn(
                  "w-full text-left p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center space-x-2",
                  activeSection === index ? "bg-gray-100 dark:bg-gray-800" : ""
                )}
                onClick={() => setActiveSection(index)}
              >
                <div className={cn("w-1 h-8 rounded", getScoreBackgroundColor(chunk.score))}></div>
                <div className="flex-1">
                  <div className="font-medium truncate">{formatHeading(chunk)}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Relevance: {(chunk.score * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {chunk.document.doc_metadata.file_name || `Document ${chunk.document.doc_id.substring(0, 8)}`}
                  </div>
                </div>
              </button>
            ))}
          </ScrollArea>
        </div>
        
        {/* Content area */}
        <div className="flex-1 p-6 max-h-[500px] overflow-y-auto">
          {activeChunk && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">{formatHeading(activeChunk)}</h2>
                  <span className={cn("px-2 py-1 rounded text-sm", getScoreBackgroundColor(activeChunk.score))}>
                    {(activeChunk.score * 100).toFixed(1)}%
                  </span>
                </div>
                
                {fileName && fileExtension && (
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {fileExtension}
                  </Button>
                )}
              </div>
              
              <div className="space-y-6">
                {activeChunk.previous_texts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-semibold">Context Before</h3>
                    <p className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {activeChunk.previous_texts.join('')}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-semibold">Matching Content</h3>
                  <p className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-800 font-medium whitespace-pre-wrap">
                    {activeChunk.text}
                  </p>
                </div>
                
                {activeChunk.next_texts.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm uppercase text-gray-500 dark:text-gray-400 font-semibold">Context After</h3>
                    <p className="p-3 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                      {activeChunk.next_texts.join('')}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      <span className="font-medium">Source:</span> {activeChunk.document.doc_metadata.file_name || 'Unknown document'}
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400 mr-1">Document ID:</span>
                      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                        {activeChunk.document.doc_id.substring(0, 8)}...
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}