"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChatMode, SystemPromptMode } from "@/lib/types";
import { Settings, RefreshCw, CheckIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface SystemPromptInputProps {
  mode: ChatMode;
  chatId: string;
}

// Type guard to check if a mode supports system prompts
function isSystemPromptMode(mode: ChatMode): mode is SystemPromptMode {
  return mode !== 'search';
}

export function SystemPromptInput({ mode, chatId }: SystemPromptInputProps) {
  const [open, setOpen] = useState(false);
  const { chats, userPreferences, updateChatSystemPrompt, updateUserPreferences } = useStore();
  const currentChat = chats.find(chat => chat.id === chatId);
  const [systemPrompt, setSystemPrompt] = useState(currentChat?.systemPrompt || "");
  
  // Default system prompts based on mode
  const defaultSystemPrompts = {
    rag: 'Answer based ONLY on the context provided from the documents.',
    chat: 'You are a helpful assistant.',
    summarize: 'Create a concise summary with key points.',
  } as const;
  
  // Get the current default system prompt for this mode from user preferences
  const currentDefaultPrompt = isSystemPromptMode(mode) 
    ? (userPreferences.defaultSystemPrompts[mode] || defaultSystemPrompts[mode])
    : '';
  
  // Update local state when chat changes
  useEffect(() => {
    if (currentChat) {
      setSystemPrompt(currentChat.systemPrompt || currentDefaultPrompt);
    }
  }, [currentChat, currentDefaultPrompt]);
  
  // Don't show for search mode
  if (mode === 'search') {
    return null;
  }
  
  const handleSystemPromptChange = (value: string) => {
    setSystemPrompt(value);
  };
  
  const handleSaveSystemPrompt = () => {
    if (chatId) {
      updateChatSystemPrompt(chatId, systemPrompt);
      setOpen(false);
    }
  };
  
  const handleResetToDefault = () => {
    setSystemPrompt(currentDefaultPrompt);
    if (chatId) {
      updateChatSystemPrompt(chatId, currentDefaultPrompt);
    }
  };
  
  const handleSaveAsDefault = () => {
    // Update user preferences with the new default system prompt for this mode
    if (isSystemPromptMode(mode)) {
      const updatedPrompts = {
        ...userPreferences.defaultSystemPrompts,
        [mode]: systemPrompt
      };
      updateUserPreferences({
        defaultSystemPrompts: updatedPrompts
      });
    }
  };
  
  // Get placeholder text based on mode
  const getPlaceholderText = () => {
    switch (mode) {
      case 'rag':
        return "Customize how the AI uses document context...";
      case 'summarize':
        return "Customize how the AI creates summaries...";
      case 'chat':
      default:
        return "Customize the AI's behavior...";
    }
  };
  
  // Get help text based on mode
  const getHelpText = () => {
    switch (mode) {
      case 'rag':
        return "The system prompt guides how the AI uses information from your documents.";
      case 'summarize':
        return "The system prompt guides how the AI creates summaries.";
      case 'chat':
      default:
        return "The system prompt sets the AI's behavior and personality.";
    }
  };
  
  // Determine if we're using a custom prompt
  const isCustomPrompt = systemPrompt && systemPrompt !== currentDefaultPrompt;
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`h-9 flex items-center gap-1 px-3 transition-all duration-200 ${isCustomPrompt ? 'border-indigo-400 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400' : ''}`}
        >
          <Settings className="h-4 w-4 mr-1" />
          System Prompt
          {isCustomPrompt && <span className="w-2 h-2 rounded-full bg-indigo-500 ml-1"></span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-4 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
        align="center"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm">System Prompt</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <span className="sr-only">Info</span>
                    <span className="h-4 w-4 rounded-full border border-current flex items-center justify-center text-muted-foreground">?</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="max-w-xs text-xs">{getHelpText()}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="system-prompt" className="text-xs text-muted-foreground">
              Customize how the AI responds in {mode} mode
            </Label>
            <Textarea
              id="system-prompt"
              placeholder={getPlaceholderText()}
              value={systemPrompt}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              className="min-h-[120px] text-sm resize-none focus-visible:ring-indigo-500"
            />
          </div>
          
          <div className="flex justify-between pt-2">
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResetToDefault}
                className="text-xs h-8"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Reset
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveAsDefault}
                className="text-xs h-8"
              >
                Save as Default
              </Button>
            </div>
            
            <Button 
              size="sm" 
              onClick={handleSaveSystemPrompt}
              className="text-xs h-8 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CheckIcon className="mr-1 h-3 w-3" />
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}