"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { listDocuments } from "@/lib/api";
import { FileText, ChevronDown, Loader2, FileIcon, Search } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface Document {
  id: string;
  name: string;
  metadata?: {
    created_at: string;
    type: string;
    size: number;
    author?: string;
    department?: string;
    category?: string;
  };
}

export function RagDocumentSelector() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { activeChat, chats, updateChatDocuments } = useStore();
  
  const currentChat = chats.find(chat => chat.id === activeChat);

  // Initialize selected docs from current chat
  useEffect(() => {
    if (currentChat?.documents?.length) {
      setSelectedDocs(currentChat.documents);
    } else {
      setSelectedDocs([]);
    }
  }, [currentChat?.id, currentChat?.documents]);

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      setError("Failed to load documents. Please try again.");
      // Set empty array to prevent showing loading indefinitely
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDocumentToggle = (docId: string) => {
    setSelectedDocs(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  const handleApply = () => {
    if (activeChat) {
      updateChatDocuments(activeChat, selectedDocs);
    }
    setIsOpen(false);
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2 transition-all duration-200 hover:bg-accent/50"
        >
          <FileText className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
          <span className="text-sm">{selectedDocs.length > 0 ? `${selectedDocs.length} Documents` : "Select Documents"}</span>
          <ChevronDown className={cn(
            "h-3 w-3 opacity-50 transition-transform duration-200 ml-1", 
            isOpen ? "transform rotate-180" : ""
          )} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[500px] p-0 shadow-lg animate-in fade-in-80 zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2" 
        align="start"
      >
        <div className="p-3 border-b bg-muted/40 backdrop-blur-sm">
          <h4 className="font-medium">Knowledge Base Documents</h4>
          <p className="text-xs text-muted-foreground mt-1">
            Select documents to use for RAG search
          </p>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              className="pl-9 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary/60" />
          </div>
        ) : error ? (
          <div className="p-6 text-center text-sm text-destructive">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3 w-full transition-colors duration-200"
              onClick={fetchDocuments}
            >
              Retry
            </Button>
          </div>
        ) : filteredDocuments.length > 0 ? (
          <ScrollArea className="h-[350px]">
            <Table>
              <TableHeader className="bg-muted/30 sticky top-0">
                <TableRow>
                  <TableHead className="w-[30px]"></TableHead>
                  <TableHead className="min-w-[230px]">Document Name</TableHead>
                  <TableHead className="w-[90px]">Date</TableHead>
                  <TableHead className="w-[70px]">Size</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow 
                    key={doc.id} 
                    className="cursor-pointer transition-colors duration-150 hover:bg-accent/40"
                    onClick={() => handleDocumentToggle(doc.id)}
                  >
                    <TableCell className="p-2 text-center">
                      <Checkbox 
                        id={`doc-${doc.id}`}
                        checked={selectedDocs.includes(doc.id)}
                        onCheckedChange={() => handleDocumentToggle(doc.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground transition-colors duration-200"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm truncate max-w-[200px]" title={doc.name}>
                          {doc.name || `Document ${doc.id.substring(0, 8)}`}
                        </span>
                      </div>
                      {doc.metadata?.category && (
                        <Badge variant="outline" className="text-xs py-0 h-5 mt-1">
                          {doc.metadata.category}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2">
                      {doc.metadata?.created_at ? formatDate(doc.metadata.created_at) : '—'}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground py-2">
                      {doc.metadata?.size ? formatFileSize(doc.metadata.size) : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No documents found in knowledge base
          </div>
        )}
        
        <div className="flex items-center justify-between p-3 border-t bg-muted/30 backdrop-blur-sm">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSelectedDocs([])}
            className="transition-colors duration-200 hover:bg-background/80"
          >
            Clear
          </Button>
          <Button 
            size="sm" 
            onClick={handleApply}
            className="bg-gradient-to-r from-[#f76361] to-[#884f83] hover:from-[#e55350] hover:to-[#7a4675] text-white transition-all duration-200 hover:shadow-md"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}