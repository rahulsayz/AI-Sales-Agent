"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatList } from "./chat-list";
import { SearchPanel } from "./search-panel";
import { SettingsPanel } from "./settings-panel";
import { ExportMenu } from "./export-menu";
import { Button } from "@/components/ui/button";
import { PlusCircle, MessageSquare, Search, Settings, Sparkles, LogOut, User, FileText } from "lucide-react";
import { useStore } from "@/lib/store";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ColorPaletteCustomizer } from "@/components/ui/color-palette-customizer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DocumentManagement } from "@/components/document/document-management";

export function Sidebar() {
  const [activeTab, setActiveTab] = useState("chats");
  const { createChat, user, signOut } = useStore();
  
  const handleNewChat = () => {
    createChat("chat");
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    
    return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <div className="h-full flex flex-col border-r bg-card relative">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-custom flex items-center justify-center mr-2 shadow-sm">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gradient-custom">Onix AI Sales Agent</h2>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 p-0 focus-visible:ring-offset-0">
                <Avatar className="h-9 w-9 border border-border shadow-sm">
                  {user?.avatar_url ? (
                    <AvatarImage src={user.avatar_url} alt={user.name || "User"} />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name || "User"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab("settings")} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Button 
          className="w-full justify-start shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleNewChat}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Chat
        </Button>
      </div>
      
      <Separator />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-3">
          <TabsList className="w-full grid grid-cols-4 h-10 bg-muted">
            <TabsTrigger 
              value="chats" 
              className={cn(
                "flex items-center gap-1 data-[state=active]:shadow-sm",
                "transition-all duration-200"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chats</span>
            </TabsTrigger>
            <TabsTrigger 
              value="search" 
              className={cn(
                "flex items-center gap-1 data-[state=active]:shadow-sm",
                "transition-all duration-200"
              )}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </TabsTrigger>
            <TabsTrigger 
              value="documents" 
              className={cn(
                "flex items-center gap-1 data-[state=active]:shadow-sm",
                "transition-all duration-200"
              )}
            >
              <span>Docs</span>
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className={cn(
                "flex items-center gap-1 data-[state=active]:shadow-sm",
                "transition-all duration-200"
              )}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="chats" className="mt-0 h-full pb-0 data-[state=active]:pb-0 overflow-hidden">
            <ChatList />
          </TabsContent>
          
          <TabsContent value="search" className="mt-0 px-4 py-3 data-[state=active]:pb-16 overflow-auto max-h-[calc(100vh-180px)]">
            <SearchPanel />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0 px-4 py-3 data-[state=active]:pb-16 max-h-[calc(100vh-180px)] overflow-auto">
            <DocumentManagement />
          </TabsContent>
          
          <TabsContent value="settings" className="mt-0 px-4 py-3 data-[state=active]:pb-16 overflow-auto max-h-[calc(100vh-180px)]">
            <SettingsPanel />
          </TabsContent>
        </div>
      </Tabs>
      
      <div className="p-3 border-t bg-card/80 backdrop-blur-sm flex items-center justify-between sticky bottom-0 left-0 right-0 z-10 shadow-sm">
        <ExportMenu />
        <ColorPaletteCustomizer />
      </div>
    </div>
  );
}