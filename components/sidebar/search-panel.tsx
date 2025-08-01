"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ChatMode } from "@/lib/types";
import { searchMessages } from "@/lib/api";
import { Loader2, Search } from "lucide-react";
import { format } from "date-fns";
import { useStore } from "@/lib/store";

export function SearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<ChatMode | "all">("all");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { setActiveChat } = useStore();
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      
      const filters = mode !== "all" ? { mode: mode as ChatMode } : undefined;
      const searchResults = await searchMessages(searchQuery, filters);
      
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleResultClick = (chatId: string) => {
    setActiveChat(chatId);
  };
  
  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-query">Search Messages</Label>
          <div className="flex gap-2 relative">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-query"
                placeholder="Enter search terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-muted/50 border-muted focus-visible:bg-background transition-colors duration-200"
              />
            </div>
            <Button type="submit" disabled={isSearching || !searchQuery.trim()}>
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="mode-filter">Filter by Mode</Label>
          <Select value={mode} onValueChange={(value) => setMode(value as ChatMode | "all")}>
            <SelectTrigger id="mode-filter">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="rag">RAG Search</SelectItem>
              <SelectItem value="chat">Basic Chat</SelectItem>
              <SelectItem value="summarize">Summarization</SelectItem>
              <SelectItem value="search">Search Mode</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </form>
      
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Results</h3>
        
        {results.length > 0 ? (
          <div className="space-y-2">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-2 rounded-md bg-muted hover:bg-muted/80 cursor-pointer"
                onClick={() => handleResultClick(result.chatId)}
              >
                <div className="text-sm font-medium truncate">{result.content}</div>
                <div className="text-xs text-muted-foreground">
                  {format(new Date(result.timestamp), "MMM d, h:mm a")}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground text-center py-4">
            {isSearching ? "Searching..." : "No results found"}
          </div>
        )}
      </div>
    </div>
  );
}