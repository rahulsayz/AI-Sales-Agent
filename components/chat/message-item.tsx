"use client";

import { useState } from "react";
import { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Bot, User, ExternalLink, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { DocumentContextViewer } from "@/components/document/document-context-viewer";
import { MessageActions } from "./message-actions";
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Simple code block component
function SimpleCodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative rounded-md overflow-hidden bg-muted">
      <div className="flex items-center justify-between px-4 py-1 text-xs text-muted-foreground bg-muted/80">
        <span>{language}</span>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const { userPreferences, activeChat } = useStore();
  const [showTimestamp, setShowTimestamp] = useState(false);
  
  const isUser = message.role === "user";
  
  // Enhanced content rendering with markdown support
  const renderContent = () => {
    const content = message.content;
    
    // Check if the message is from the user - if so, just render it directly
    if (isUser) {
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
    
    // For finding sources section in RAG mode
    const hasSources = content.includes('**Sources:**');
    let mainContent = content;
    let sourcesContent = '';
    
    // Split content into main content and sources if available
    if (hasSources) {
      const parts = content.split('---');
      if (parts.length > 1) {
        mainContent = parts[0].trim();
        sourcesContent = parts.slice(1).join('---').trim();
      }
    }
    
    // For assistant messages, use ReactMarkdown for better formatting
    return (
      <>
        <ReactMarkdown
          components={{
            pre: ({ children }) => (
              <div className="my-3 overflow-auto rounded-md bg-muted p-2">
                <pre>{children}</pre>
              </div>
            ),
            code: ({ children, className }) => {
              // Detect if this is an inline code block
              const isInline = !className;
              return isInline ? 
                <code className="px-1 py-0.5 rounded-sm bg-muted text-sm">{children}</code> :
                <code className="block p-4 overflow-x-auto text-sm">{children}</code>;
            },
            // Add custom styling for lists
            ul: ({ children }) => (
              <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
            ),
            // Improve formatting for headings
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold mb-3 mt-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-bold mb-2 mt-4">{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-bold mb-2 mt-3">{children}</h3>
            ),
            // Improve paragraph spacing
            p: ({ children }) => (
              <p className="mb-3 last:mb-0">{children}</p>
            ),
            // Properly handle line breaks
            br: () => (
              <br className="mb-2" />
            ),
            // Apply proper spacing for block quotes
            blockquote: ({ children }) => (
              <blockquote className="pl-4 border-l-4 border-muted-foreground/20 my-3">{children}</blockquote>
            ),
            // Handle horizontal rules
            hr: () => (
              <hr className="my-4 border-t border-border" />
            )
          }}
        >
          {mainContent}
        </ReactMarkdown>
        
        {/* Render sources separately with custom styling if available */}
        {hasSources && (
          <>
            <Separator className="my-2.5" />
            <div className="sources-section rounded-md bg-muted/50 p-2.5 border border-muted">
              <div className="text-sm font-medium mb-1.5 flex items-center gap-1.5 text-primary/90">
                <FileText className="h-3.5 w-3.5" />
                <span>Sources</span>
              </div>
              <div className="text-sm text-muted-foreground">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-xs">{children}</p>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-4 space-y-1.5">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-xs leading-snug">{children}</li>  
                    ),
                    strong: ({ children }) => (
                      <a className="font-medium text-primary underline text-xs hover:text-primary/80 transition-colors cursor-pointer" href="#" onClick={(e) => e.preventDefault()}>{children}</a>
                    )
                  }}
                >
                  {sourcesContent}
                </ReactMarkdown>
              </div>
            </div>
          </>
        )}
      </>
    );
  };
  
  const fontSizes = {
    small: "text-sm",
    medium: "text-base",
    large: "text-lg",
  };

  return (
    <div 
      className={cn(
        "flex w-full py-5 px-4 group transition-colors",
        isUser ? "justify-end" : "justify-start",
        isUser ? "bg-transparent" : "bg-muted/30"
      )}
      onMouseEnter={() => setShowTimestamp(true)}
      onMouseLeave={() => setShowTimestamp(false)}
    >
      <div className={cn(
        "flex max-w-[90%] md:max-w-[75%] gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <Avatar className={cn(
          "h-10 w-10 flex-shrink-0 mt-1 shadow-sm border",
          isUser ? "ml-3" : "mr-3"
        )}>
          <AvatarFallback className={cn(
            isUser 
              ? "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground" 
              : "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
          )}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
          </AvatarFallback>
        </Avatar>
        
        <div className={cn(
          "flex flex-col",
          isUser ? "items-end" : "items-start"
        )}>
          <Card className={cn(
            "border shadow-sm",
            isUser 
              ? "rounded-2xl rounded-tr-md border-primary/20 bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-md" 
              : "rounded-2xl rounded-tl-md border-border/60 bg-card/90 shadow-md"
          )}>
            <CardContent className={cn(
              "px-5 py-3.5",
              fontSizes[userPreferences.fontSize]
            )}>
              {renderContent()}
              
              {/* Message edited indicator */}
              {message.isEdited && (
                <div className="text-xs opacity-60 mt-1 font-light">
                  (edited)
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Timestamp and actions row */}
          <div className="flex items-center gap-2 px-1 h-6 mt-1.5">
            {/* Only show timestamp on hover */}
            <div className={cn(
              "text-xs text-muted-foreground transition-opacity font-light",
              showTimestamp ? "opacity-100" : "opacity-0"
            )}>
              {format(new Date(message.timestamp), "h:mm a")}
            </div>
            
            {/* Show reactions for this chat */}
            {activeChat && <MessageActions message={message} chatId={activeChat} />}
          </div>
        </div>
      </div>
    </div>
  );
}