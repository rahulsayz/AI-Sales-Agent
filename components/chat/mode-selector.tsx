"use client";

import React from "react";
import { ChatMode } from "@/lib/types";
import { useStore } from "@/lib/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Brain, Search, FileText, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeSelectorProps {
  onModeChange?: (mode: ChatMode) => void;
}

export function ModeSelector({ onModeChange }: ModeSelectorProps) {
  const { activeChat, chats, updateChatMode } = useStore();
  const currentChat = chats.find(chat => chat.id === activeChat);
  
  const handleModeChange = (value: string) => {
    const mode = value as ChatMode;
    
    if (activeChat) {
      updateChatMode(activeChat, mode);
    }
    
    if (onModeChange) {
      onModeChange(mode);
    }
  };
  
  const modes: { value: ChatMode; label: string; icon: React.ReactNode; color: string }[] = [
    { 
      value: "rag", 
      label: "RAG Search", 
      icon: <Brain className="mr-2 h-4 w-4" />,
      color: "text-indigo-500" 
    },
    { 
      value: "chat", 
      label: "Basic Chat", 
      icon: <MessageSquare className="mr-2 h-4 w-4" />,
      color: "text-blue-500"
    },
    { 
      value: "summarize", 
      label: "Summarization", 
      icon: <FileText className="mr-2 h-4 w-4" />,
      color: "text-emerald-500"
    },
    { 
      value: "search", 
      label: "Search Mode", 
      icon: <Search className="mr-2 h-4 w-4" />,
      color: "text-amber-500"
    },
  ];
  
  // Get current mode data
  const currentMode = modes.find(m => m.value === (currentChat?.mode || "chat"));
  
  return (
    <div className="flex items-center">
      <Select
        value={currentChat?.mode || "chat"}
        onValueChange={handleModeChange}
        name="chat-mode"
      >
        <SelectTrigger 
          className="h-8 px-2 border-none shadow-none bg-transparent hover:bg-accent/50 transition-all duration-200"
          data-state={currentChat?.mode ? "selected" : "idle"}
          id="chat-mode-selector"
        >
          <SelectValue placeholder="Select mode">
            {currentMode && (
              <div className="flex items-center">
                <span className={cn("mr-1.5 transition-colors duration-200", currentMode.color)}>
                  {React.cloneElement(currentMode.icon as React.ReactElement, { className: "h-3.5 w-3.5" })}
                </span>
                <span className="text-sm font-medium">{currentMode.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          position="popper" 
          className="w-[180px] border shadow-md animate-in fade-in-80 zoom-in-95"
        >
          {modes.map((mode) => (
            <SelectItem 
              key={mode.value} 
              value={mode.value} 
              className="cursor-pointer transition-colors duration-150 hover:bg-accent rounded-sm focus:bg-accent/80"
            >
              <div className="flex items-center">
                <span className={cn("mr-2 transition-colors duration-200", mode.color)}>
                  {mode.icon}
                </span>
                <span>{mode.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}