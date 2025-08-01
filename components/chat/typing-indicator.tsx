"use client";

import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export function TypingIndicator() {
  const { isTyping } = useStore();
  
  if (!isTyping) return null;
  
  return (
    <div className="flex w-full px-6 py-3 justify-start">
      <div className="flex max-w-[85%] gap-3 flex-row">
        <div className="flex-shrink-0 mt-1 mr-3">
          <Avatar className="h-8 w-8 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
            <div className="flex items-center justify-center w-full h-full">
              <Bot size={16} />
            </div>
          </Avatar>
        </div>
        
        <div className="flex flex-col space-y-1 items-start">
          <div className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground px-2">
            Typing...
          </div>
        </div>
      </div>
    </div>
  );
}