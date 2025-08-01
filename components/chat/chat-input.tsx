"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, FileText, Search } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { ChatMode } from "@/lib/types";
import { RagDocumentViewer } from "./rag-document-viewer";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  mode?: ChatMode;
}

export function ChatInput({ mode }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { sendMessage, isLoading, currentChat } = useChat();
  
  // Auto-focus the input when the component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    await sendMessage(input, mode);
    setInput("");
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Determine placeholder text based on mode
  const getPlaceholderText = () => {
    switch (mode) {
      case "summarize":
        return "Paste the text you want to summarize...";
      case "rag":
        return "Ask a question about your knowledge base...";
      case "search":
        return "Search for information...";
      default:
        return "Type your message...";
    }
  };
  
  // Determine button text based on mode and loading state
  const getButtonContent = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />;
    }
    
    if (mode === "summarize") {
      return <FileText className="h-4 w-4" />;
    }
    
    if (mode === "search") {
      return <Search className="h-4 w-4" />;
    }
    
    return <Send className="h-4 w-4" />;
  };
  
  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto w-full">
        <div className="relative rounded-lg border shadow-sm flex items-center bg-card/90 p-1 transition-all hover:shadow-md focus-within:border-primary/30 focus-within:shadow-md">
          <div className="flex items-center gap-1 pl-1">
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-accent/60 text-muted-foreground/80 hover:text-accent-foreground transition-all"
              title="Upload document"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-accent/60 text-muted-foreground/80 hover:text-accent-foreground transition-all"
              title="Insert code snippet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="m8 18 6-12"></path>
                <path d="m2 8 4 4-4 4"></path>
                <path d="m22 8-4 4 4 4"></path>
              </svg>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full hover:bg-accent/60 text-muted-foreground/80 hover:text-accent-foreground transition-all"
              title="Use template"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect width="8" height="8" x="3" y="3" rx="2"></rect>
                <path d="M7 11v4a2 2 0 0 0 2 2h4"></path>
                <rect width="8" height="8" x="13" y="13" rx="2"></rect>
              </svg>
            </Button>
          </div>
          
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholderText()}
            className={cn(
              "min-h-[60px] pr-14 py-3 resize-none overflow-hidden flex-1",
              "border-0 shadow-none focus-visible:ring-0 bg-transparent",
              "placeholder:text-muted-foreground/60 placeholder:font-light"
            )}
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-3 top-1/2 transform -translate-y-1/2",
              "rounded-full w-9 h-9 shadow-sm transition-all",
              !input.trim() || isLoading 
                ? "opacity-70"
                : "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground hover:shadow-md hover:from-primary/95 hover:to-primary/85"
            )}
          >
            {getButtonContent()}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-center text-muted-foreground font-light">
          <span>Press Shift + Enter for a new line</span>
        </div>
      </form>
      
      {/* Removed: Don't show document viewer for RAG mode */}
      {/* {mode === "rag" && (
        <RagDocumentViewer 
          query={input} 
          isOpen={showDocumentViewer} 
          onClose={() => setShowDocumentViewer(false)} 
        />
      )} */}
    </>
  );
}