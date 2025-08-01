"use client";

import React from 'react';
import { Copy, Heart, Bookmark } from 'lucide-react';
import { useStore } from "@/lib/store";
import { Message } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface MessageActionsProps {
  message: Message;
  chatId: string;
}

export function MessageActions({ message, chatId }: MessageActionsProps) {
  const { toggleMessageReaction } = useStore();
  const { toast } = useToast();

  // Get reaction states with fallbacks
  const isLiked = message.reactions?.liked || false;
  const isSaved = message.reactions?.saved || false;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Message content has been copied to your clipboard.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
        toast({
          title: "Failed to copy",
          description: "Could not copy message content to clipboard.",
          variant: "destructive",
        });
      });
  };

  const handleToggleLike = () => {
    toggleMessageReaction(chatId, message.id, 'liked');
  };

  const handleToggleSave = () => {
    toggleMessageReaction(chatId, message.id, 'saved');
  };

  return (
    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleToggleLike}
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-full transition-colors",
                "hover:bg-muted",
                isLiked ? "text-red-500" : "text-muted-foreground"
              )}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              <Heart size={14} className={cn(
                "transition-transform duration-200", 
                isLiked ? "fill-current scale-110" : "fill-none"
              )} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {isLiked ? "Unlike" : "Like"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleToggleSave}
              className={cn(
                "h-7 w-7 flex items-center justify-center rounded-full transition-colors",
                "hover:bg-muted",
                isSaved ? "text-yellow-500" : "text-muted-foreground"
              )}
              aria-label={isSaved ? "Unsave" : "Save"}
            >
              <Bookmark size={14} className={cn(
                "transition-transform duration-200",
                isSaved ? "fill-current scale-110" : "fill-none"
              )} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {isSaved ? "Unsave" : "Save"}
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button 
              onClick={handleCopy}
              className="h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Copy"
            >
              <Copy size={14} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Copy to clipboard
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
} 