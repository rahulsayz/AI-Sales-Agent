"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { listDocuments, deleteDocument } from "@/lib/api";
import { 
  FileText, 
  Trash2, 
  Upload, 
  RefreshCw,
  FileX,
  Clock,
  FileSpreadsheet,
  FileImage,
  FileCode
} from "lucide-react";
import { DriveIntegration } from "@/components/drive-integration";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { DocumentUpload } from "./document-upload";

const FILE_ICONS: { [key: string]: React.ReactNode } = {
  pdf: <FileText className="h-4 w-4 text-red-500" />,
  docx: <FileText className="h-4 w-4 text-blue-500" />,
  doc: <FileText className="h-4 w-4 text-blue-500" />,
  xlsx: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  xls: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  csv: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
  ppt: <FileText className="h-4 w-4 text-orange-500" />, 
  pptx: <FileText className="h-4 w-4 text-orange-500" />,
  txt: <FileText className="h-4 w-4 text-gray-500" />,
  md: <FileText className="h-4 w-4 text-gray-500" />,
  json: <FileCode className="h-4 w-4 text-purple-500" />,
  jpg: <FileImage className="h-4 w-4 text-indigo-500" />,
  jpeg: <FileImage className="h-4 w-4 text-indigo-500" />,
  png: <FileImage className="h-4 w-4 text-indigo-500" />,
  default: <FileText className="h-4 w-4 text-gray-400" />
};

export function DocumentManagement() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Function to fetch documents
  const fetchDocuments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to fetch documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle document selection
  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => {
      if (prev.includes(documentId)) {
        return prev.filter(id => id !== documentId);
      } else {
        return [...prev, documentId];
      }
    });
  };

  // Function to handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    try {
      await deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId || doc.doc_id !== documentId));
      toast.success("Document deleted successfully");
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Failed to delete document");
    }
  };

  // Function to get file extension icon
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || 'default';
    return FILE_ICONS[extension] || FILE_ICONS.default;
  };

  // Function to format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null;
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Get file extension for styling
  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    fetchDocuments();
  };

  // Get document upload date as relative time
  const getRelativeTime = (dateString?: string): string => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-semibold">Documents</h2>
        <div className="flex space-x-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 px-2"
            onClick={fetchDocuments}
          >
            <RefreshCw className="h-3 w-3" />
          </Button>
          <Button
            variant="default"
            size="sm"
            className="h-7 px-2"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-1 text-xs">
          <AlertTitle className="text-xs">Error</AlertTitle>
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="space-y-2 px-1">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      ) : documents.length > 0 ? (
        <div className="overflow-hidden">
          <div className="border-b border-border pb-1 mb-1">
            <div className="grid grid-cols-[auto_1fr_auto] gap-1 text-xs text-muted-foreground px-1">
              <div className="w-5"></div>
              <div>Name</div>
              <div className="w-6"></div>
            </div>
          </div>
          <div className="space-y-0.5 overflow-y-auto">
            {documents.map((doc) => {
              const ext = getFileExtension(doc.name);
              const uploadTime = getRelativeTime(doc.created_at);
              return (
                <div 
                  key={doc.id || doc.doc_id}
                  className="grid grid-cols-[auto_1fr_auto] gap-1 items-center py-1 px-1 hover:bg-muted/30 rounded group"
                >
                  <div className="flex justify-center w-5">
                    {getFileIcon(doc.name)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="truncate text-xs font-medium" title={doc.name}>
                      {doc.name}
                    </div>
                    {uploadTime && (
                      <div className="text-[10px] text-muted-foreground">
                        {uploadTime}
                      </div>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteDocument(doc.id || doc.doc_id)}
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border rounded-md p-3 text-center bg-muted/30">
          <FileX className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
          <h3 className="text-xs font-medium mb-1">No Documents</h3>
          <p className="text-[10px] text-muted-foreground mb-2">
            Upload documents to get started.
          </p>
          <Button
            variant="default"
            size="sm"
            className="h-7 text-xs"
            onClick={() => setShowUploadDialog(true)}
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        </div>
      )}

      <DocumentUpload 
        open={showUploadDialog} 
        onOpenChange={setShowUploadDialog}
        onUploadComplete={handleUploadComplete}
      />
    </div>
  );
} 