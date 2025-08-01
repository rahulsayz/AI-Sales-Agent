"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { 
  MessageSquare, 
  Brain, 
  FileText, 
  Search,
  Trash2,
  MoreVertical,
  Edit,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChatMode } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

export function ChatList() {
  const { chats, activeChat, setActiveChat, deleteChat, updateChatTitle } = useStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const filteredChats = chats.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Helper function to get formatted date string
  const getFormattedDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d');
    }
  };
  
  const getModeIcon = (mode: ChatMode) => {
    switch (mode) {
      case "rag":
        return <Brain className="h-4 w-4" />;
      case "summarize":
        return <FileText className="h-4 w-4" />;
      case "search":
        return <Search className="h-4 w-4" />;
      case "chat":
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };
  
  // Color mapping for mode badges
  const getModeColor = (mode: ChatMode): string => {
    switch (mode) {
      case "rag": 
        return "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20";
      case "summarize":
        return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20";
      case "search":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20";
      case "chat":
      default:
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    }
  };
  
  const handleEditChat = (chatId: string, currentTitle: string) => {
    setEditingChatId(chatId);
    setEditTitle(currentTitle);
  };
  
  const handleSaveTitle = (chatId: string) => {
    if (editTitle.trim()) {
      updateChatTitle(chatId, editTitle);
    }
    setEditingChatId(null);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      handleSaveTitle(chatId);
    } else if (e.key === "Escape") {
      setEditingChatId(null);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 sticky top-0 z-10 bg-card/90 backdrop-blur-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 bg-muted/50 border-muted focus-visible:bg-background transition-colors duration-200"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto px-3 pb-16">
        <div className="space-y-px">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChat;
              const chatDate = new Date(chat.updatedAt);
              
              return (
                <div
                  key={chat.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-md cursor-pointer group",
                    "transition-all duration-200 border border-transparent",
                    isActive 
                      ? "bg-primary/10 hover:bg-primary/15 shadow-sm" 
                      : "hover:bg-accent hover:border-accent/40"
                  )}
                  onClick={() => setActiveChat(chat.id)}
                >
                  <div className="flex items-center overflow-hidden space-x-3 flex-1 min-w-0 w-full">
                    <div className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
                      isActive ? "bg-primary text-primary-foreground" : getModeColor(chat.mode)
                    )}>
                      {getModeIcon(chat.mode)}
                    </div>
                    
                    {editingChatId === chat.id ? (
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => handleSaveTitle(chat.id)}
                          onKeyDown={(e) => handleKeyDown(e, chat.id)}
                          autoFocus
                          className="h-8 text-sm min-w-0 flex-1"
                        />
                        <TooltipProvider delayDuration={300}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7"
                                onClick={() => handleSaveTitle(chat.id)}
                              >
                                <CheckIcon className="h-4 w-4 text-green-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Save</TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7"
                                onClick={() => setEditingChatId(null)}
                              >
                                <XIcon className="h-4 w-4 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">Cancel</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ) : (
                      <div className="overflow-hidden flex-1 min-w-0 max-w-full">
                        <div className="flex items-center justify-between w-full mb-0.5">
                          <div className="truncate text-sm font-medium text-foreground/90 mr-1.5 max-w-[140px]">
                            {chat.title}
                          </div>
                          <div className="text-[11px] text-muted-foreground whitespace-nowrap flex-shrink-0 opacity-80">
                            {getFormattedDate(chatDate)}
                          </div>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground/80 truncate space-x-1.5">
                          <span className="flex-shrink-0">{chat.messages.length} messages</span>
                          <span className="text-[9px] flex-shrink-0">•</span>
                          <span className="text-[11px] flex-shrink-0">{format(chatDate, 'h:mm a')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {!editingChatId && (
                    <div className={cn(
                      "transition-opacity flex-shrink-0 ml-1",
                      isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-background/80">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEditChat(chat.id, chat.title)} className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteChat(chat.id);
                            }}
                            className="flex items-center gap-2 text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="px-4 py-6 text-center">
              <div className="rounded-md bg-muted p-4">
                <p className="text-sm text-muted-foreground mb-1">No chats found</p>
                <p className="text-xs text-muted-foreground">Try a different search term or create a new chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}