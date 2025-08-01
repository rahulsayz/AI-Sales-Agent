"use client";

import { useRef, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { MessageItem } from "./message-item";
import { MessageSkeleton } from "./message-skeleton";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";
import { ModeSelector } from "./mode-selector";
import { ChatMode } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { PlusCircle, Sparkles, MessageSquareText, Cloud } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { SystemPromptInput } from "./system-prompt-input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DriveIntegration } from "@/components/drive-integration";
import { RagDocumentSelector } from "./rag-document-selector";
import { PresentationButton } from "@/components/presentation/presentation-button";

export function ChatWindow() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chats, activeChat, createChat } = useStore();
  const { currentChat, isLoading } = useChat();
  
  const handleNewChat = (mode: ChatMode = "chat") => {
    createChat(mode);
  };
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentChat?.messages]);
  
  // Choose how many skeleton loaders to show based on mode
  const getSkeletonCount = () => {
    if (!currentChat) return 1;
    
    switch (currentChat.mode) {
      case 'summarize':
        return 2; // Summaries tend to be shorter
      case 'rag':
        return 4; // RAG responses can be longer with sources
      default:
        return 3;
    }
  };
  
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center justify-between py-2 px-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div>
          {/* Empty div to maintain flex justification */}
        </div>
        <div className="flex items-center divide-x divide-gray-200 dark:divide-gray-700">
          {currentChat && currentChat.mode !== 'search' && (
            <div className="px-2">
              <SystemPromptInput mode={currentChat.mode} chatId={currentChat.id} />
            </div>
          )}
          <div className="px-2">
            <ModeSelector />
          </div>
          <div className="px-2">
            <RagDocumentSelector />
          </div>
          <div className="px-2">
            <PresentationButton />
          </div>
          <div className="px-2">
            {/* Integration dropdown menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-2 transition-all duration-200 hover:bg-accent/50"
                >
                  <Cloud className="h-3.5 w-3.5 text-green-500 mr-1.5" />
                  <span className="text-sm">Integration</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={(e) => {
                  e.preventDefault();
                  const driveIntegration = document.getElementById("drive-integration");
                  if (driveIntegration) {
                    driveIntegration.click();
                  }
                }}>
                  <Cloud className="mr-2 h-4 w-4 text-blue-600" />
                  Connect Google Drive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Hidden button that will be clicked programmatically */}
          <div className="hidden">
            <DriveIntegration id="drive-integration" />
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {currentChat ? (
          <>
            {currentChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Card className="w-full max-w-md p-6 shadow-md border">
                  <CardContent className="pt-6 px-4 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-primary/90 flex items-center justify-center mb-6 shadow-md">
                      <Sparkles className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-3">Start a new conversation</h3>
                    <p className="text-muted-foreground font-light">
                      {currentChat.mode === "summarize" 
                        ? "Send a message with the text you want to summarize" 
                        : "Send a message to begin chatting with Onix AI Sales Agent"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="py-2">
                {currentChat.messages.map((message) => (
                  <MessageItem key={message.id} message={message} />
                ))}
                
                {/* Show skeleton loader when a response is loading */}
                {isLoading && (
                  <>
                    {/* Show a different number of skeleton loaders based on the chat mode */}
                    <MessageSkeleton 
                      role="assistant" 
                      linesCount={getSkeletonCount()}
                      longLines={currentChat.mode === 'rag' || currentChat.mode === 'summarize'}
                    />
                  </>
                )}
                
                <TypingIndicator />
                <div ref={messagesEndRef} />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <Card className="w-full max-w-md p-6 shadow-lg border">
              <CardContent className="pt-6 px-4 flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-6 shadow-md">
                  <Sparkles className="h-10 w-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-medium mb-3">Welcome to Onix AI Sales Agent</h3>
                <p className="text-muted-foreground mb-6 font-light">
                  Select a chat from the sidebar or start a new conversation
                </p>
                <Button
                  size="lg"
                  onClick={() => handleNewChat("chat")}
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/95 hover:to-secondary/95 text-primary-foreground shadow-md transition-all duration-300 hover:shadow-lg"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  New Chat
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {currentChat && (
        <>
          <Separator className="my-0" />
          <div className="p-4 bg-muted/30 border-t border-border/50 backdrop-blur-sm">
            <ChatInput mode={currentChat.mode} />
          </div>
        </>
      )}
    </div>
  );
}