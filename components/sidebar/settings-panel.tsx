"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function SettingsPanel() {
  const { userPreferences, updateUserPreferences, clearChats } = useStore();
  const [systemPrompts, setSystemPrompts] = useState({
    rag: userPreferences.defaultSystemPrompts?.rag || 'Answer based ONLY on the context provided from the documents.',
    chat: userPreferences.defaultSystemPrompts?.chat || 'You are a helpful assistant.',
    summarize: userPreferences.defaultSystemPrompts?.summarize || 'Create a concise summary with key points.'
  });
  
  const handleSystemPromptChange = (mode: string, value: string) => {
    setSystemPrompts(prev => ({
      ...prev,
      [mode]: value
    }));
  };
  
  const handleSaveSystemPrompts = () => {
    updateUserPreferences({
      defaultSystemPrompts: systemPrompts
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Appearance</h3>
        <p className="text-sm text-muted-foreground">
          Customize how the application looks and feels
        </p>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <div className="flex items-center gap-2">
              <ModeToggle />
              <span className="text-sm text-muted-foreground">
                {userPreferences.theme === "light" 
                  ? "Light Mode" 
                  : userPreferences.theme === "dark" 
                    ? "Dark Mode" 
                    : "System Default"}
              </span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select 
              value={userPreferences.fontSize} 
              onValueChange={(value) => 
                updateUserPreferences({ fontSize: value as "small" | "medium" | "large" })
              }
            >
              <SelectTrigger id="font-size">
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Chat Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Customize your chat experience
        </p>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bubble-style">Message Bubble Style</Label>
            <Select 
              value={userPreferences.bubbleStyle} 
              onValueChange={(value) => 
                updateUserPreferences({ bubbleStyle: value as "modern" | "classic" | "minimal" })
              }
            >
              <SelectTrigger id="bubble-style">
                <SelectValue placeholder="Select bubble style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="modern">Modern</SelectItem>
                <SelectItem value="classic">Classic</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code-theme">Code Block Theme</Label>
            <Select 
              value={userPreferences.codeTheme} 
              onValueChange={(value) => 
                updateUserPreferences({ codeTheme: value as "github" | "dracula" | "solarized" })
              }
            >
              <SelectTrigger id="code-theme">
                <SelectValue placeholder="Select code theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="github">GitHub</SelectItem>
                <SelectItem value="dracula">Dracula</SelectItem>
                <SelectItem value="solarized">Solarized</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="system-prompts">
              <AccordionTrigger>Default System Prompts</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rag-prompt">RAG Search Mode</Label>
                    <Textarea 
                      id="rag-prompt"
                      value={systemPrompts.rag}
                      onChange={(e) => handleSystemPromptChange('rag', e.target.value)}
                      placeholder="System prompt for RAG mode"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="chat-prompt">Basic Chat Mode</Label>
                    <Textarea 
                      id="chat-prompt"
                      value={systemPrompts.chat}
                      onChange={(e) => handleSystemPromptChange('chat', e.target.value)}
                      placeholder="System prompt for chat mode"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="summarize-prompt">Summarization Mode</Label>
                    <Textarea 
                      id="summarize-prompt"
                      value={systemPrompts.summarize}
                      onChange={(e) => handleSystemPromptChange('summarize', e.target.value)}
                      placeholder="System prompt for summarization mode"
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <Button onClick={handleSaveSystemPrompts}>
                    Save Default Prompts
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
      
      <Separator />
      
      <div>
        <h3 className="text-lg font-medium">Data Management</h3>
        <p className="text-sm text-muted-foreground">
          Manage your chat history and data
        </p>
        
        <div className="py-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All Chats
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your chat history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearChats}>
                  Yes, clear all chats
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}