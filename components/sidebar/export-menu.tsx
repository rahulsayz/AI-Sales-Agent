"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { exportChat } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ExportMenu() {
  const [isExporting, setIsExporting] = useState(false);
  const { activeChat, chats } = useStore();
  
  const handleExport = async (format: 'pdf' | 'txt' | 'json') => {
    if (!activeChat) return;
    
    try {
      setIsExporting(true);
      
      const blob = await exportChat(activeChat, format);
      const url = URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      const currentChat = chats.find(chat => chat.id === activeChat);
      const filename = `${currentChat?.title || 'chat'}.${format}`;
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Chat exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export chat');
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={!activeChat || isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          PDF Document
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('txt')}>
          Text File
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('json')}>
          JSON Data
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}