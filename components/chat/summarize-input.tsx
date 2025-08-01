"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatMode } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface SummarizeInputProps {
  mode?: ChatMode;
}

export function SummarizeInput({ mode }: SummarizeInputProps) {
  const [text, setText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [useContext, setUseContext] = useState(false);
  const [customInstructions, setCustomInstructions] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading, currentChat } = useChat();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim() || isLoading) return;
    
    try {
      // Pass the text and any selected documents to the summarization API
      await sendMessage(text, mode || "summarize");
      // Don't clear the text after submission to allow for reference
      toast.success("Text submitted for summarization");
    } catch (error) {
      console.error("Error submitting text for summarization:", error);
      toast.error("Failed to summarize text. Please try again.");
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a TXT, PDF, or DOCX file.");
      return;
    }
    
    // For demo purposes, we'll just read text files
    // In a real app, you'd use a service to extract text from PDFs and DOCXs
    if (file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
        setIsExpanded(true);
      };
      reader.readAsText(file);
    } else {
      // Mock file content for non-text files
      const mockContent = `This is simulated content from the file "${file.name}".\n\nIn a real implementation, we would extract the actual text content from this ${file.type === 'application/pdf' ? 'PDF' : 'DOCX'} file.\n\nFor demonstration purposes, we're showing this placeholder text that would be replaced with the actual document content in a production environment.\n\nThe document would typically contain several paragraphs of text that would be processed and summarized by our AI system.\n\nSales teams often need to quickly digest large documents such as market research reports, competitive analyses, and customer feedback summaries. This feature allows sales professionals to upload these documents and get concise summaries of the key points, enabling them to focus on high-value activities like customer engagement rather than reading lengthy documents.`;
      
      setText(mockContent);
      setIsExpanded(true);
      toast.success(`Uploaded ${file.name}`);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClearText = () => {
    setText("");
    setIsExpanded(false);
  };
  
  return (
    <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" />
              <span className="font-medium">Text to Summarize</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".txt,.pdf,.docx"
                id="file-upload"
                name="file-upload"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
              {text && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearText}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'h-64' : 'h-32'}`}>
            <ScrollArea className="h-full">
              <Textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste or type the text you want to summarize..."
                className="min-h-full border-0 resize-none focus-visible:ring-0 rounded-none"
                disabled={isLoading}
              />
            </ScrollArea>
          </div>
          
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs mb-2"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced Options
            </Button>
            
            {showAdvanced && (
              <div className="space-y-3 mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="use-context"
                    checked={useContext}
                    onCheckedChange={setUseContext}
                    disabled={!currentChat?.documents?.length}
                  />
                  <Label htmlFor="use-context" className="text-sm">
                    Use selected documents as context
                    {!currentChat?.documents?.length && (
                      <span className="text-xs text-muted-foreground ml-2">
                        (No documents selected)
                      </span>
                    )}
                  </Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="custom-instructions" className="text-sm">
                    Custom Instructions (Optional)
                  </Label>
                  <Textarea
                    id="custom-instructions"
                    placeholder="Add specific instructions for summarization..."
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    className="h-20 text-sm"
                  />
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs"
              >
                {isExpanded ? "Collapse" : "Expand"} Editor
              </Button>
              
              <Button 
                type="submit" 
                disabled={!text.trim() || isLoading}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Summarize Text
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}