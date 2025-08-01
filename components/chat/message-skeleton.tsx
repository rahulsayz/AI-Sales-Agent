"use client";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";

interface MessageSkeletonProps {
  role?: 'user' | 'assistant';
  linesCount?: number; // How many lines of text to show
  longLines?: boolean; // Whether to use long or short lines
  className?: string;
}

export function MessageSkeleton({
  role = 'assistant',
  linesCount = 3,
  longLines = true,
  className,
}: MessageSkeletonProps) {
  const isUser = role === 'user';
  
  // Create different widths for the lines
  const getLineWidth = (index: number, total: number) => {
    // Last line is always shorter
    if (index === total - 1) return `${60 + Math.random() * 20}%`;
    // For longer messages, make some lines full width
    if (longLines && index % 2 === 0) return '100%';
    // Otherwise, random widths between 75% and 95%
    return `${75 + Math.random() * 20}%`;
  };
  
  return (
    <div className={cn(
      "flex w-full px-6 py-3",
      isUser ? "justify-end" : "justify-start",
      className
    )}>
      <div className={cn(
        "flex max-w-[85%] gap-3",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "flex-shrink-0 mt-1",
          isUser ? "ml-3" : "mr-3"
        )}>
          <Avatar className={cn(
            "h-8 w-8 flex items-center justify-center",
            isUser 
              ? "bg-gradient-custom text-white" 
              : "bg-gradient-to-br from-blue-500 to-cyan-600 text-white"
          )}>
            <div className="flex items-center justify-center w-full h-full">
              {isUser ? <User size={16} /> : <Bot size={16} />}
            </div>
          </Avatar>
        </div>
        
        <div className={cn(
          "flex flex-col space-y-1",
          isUser ? "items-end" : "items-start"
        )}>
          <div className={cn(
            "px-4 py-3 rounded-2xl",
            isUser 
              ? "bg-gradient-custom" 
              : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm"
          )}>
            <div className="flex flex-col gap-2">
              {Array(linesCount).fill(0).map((_, i) => (
                <Skeleton 
                  key={i}
                  width={getLineWidth(i, linesCount)} 
                  height={16}
                  animation="wave"
                  className={isUser ? "bg-white/20" : ""}
                />
              ))}
            </div>
          </div>
          
          <div className="text-xs text-muted-foreground px-2">
            <Skeleton width={40} height={12} animation="wave" />
          </div>
        </div>
      </div>
    </div>
  );
} 