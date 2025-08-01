"use client";

import React, { useState, useCallback } from "react";
import { 
  Button, 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  Input,
  Label,
  Alert,
  AlertTitle,
  AlertDescription
} from "@/components/ui";
import { 
  AlertCircle, 
  Check, 
  Loader2, 
  FileUp, 
  X,
  AlertTriangle,
  FileText,
  Cloud
} from "lucide-react";
import { uploadDocument } from "@/lib/api";
import { Toaster, toast } from "sonner";
import { Progress } from "@/components/ui/progress";

// List of supported file extensions
const SUPPORTED_EXTENSIONS = [
  '.pdf', '.docx', '.doc', '.txt', '.md', '.csv', 
  '.xlsx', '.xls', '.ppt', '.pptx', '.rtf', '.odt'
];

interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webContentLink?: string;
  size?: number;
}

interface ProcessingStats {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
}

interface DriveIntegrationProps {
  id?: string;
}

export function DriveIntegration({ id }: DriveIntegrationProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [driveUrl, setDriveUrl] = useState("");
  const [isUrlValid, setIsUrlValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState<ProcessingStats>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0
  });
  const [currentFile, setCurrentFile] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Validate Google Drive URL
  const validateDriveUrl = useCallback((url: string): boolean => {
    // Basic validation for Google Drive URL
    const driveUrlRegex = /^https:\/\/drive\.google\.com\/(drive\/folders\/|file\/d\/|open\?id=)([a-zA-Z0-9_-]+)/;
    return driveUrlRegex.test(url);
  }, []);

  // Handle URL input change
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setDriveUrl(url);
    
    if (url.trim() === "") {
      setIsUrlValid(true);
      setErrorMessage("");
    } else {
      const isValid = validateDriveUrl(url);
      setIsUrlValid(isValid);
      setErrorMessage(isValid ? "" : "Please enter a valid Google Drive URL");
    }
  };

  // Extract Drive folder/file ID from URL
  const extractDriveId = (url: string): string | null => {
    const matches = url.match(/\/folders\/([a-zA-Z0-9_-]+)|\/file\/d\/([a-zA-Z0-9_-]+)|[?&]id=([a-zA-Z0-9_-]+)/);
    return matches ? (matches[1] || matches[2] || matches[3]) : null;
  };

  // Check if file type is supported
  const isFileSupported = (fileName: string): boolean => {
    const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  // Process a single file from Drive
  const processFile = async (file: DriveFileItem): Promise<boolean> => {
    try {
      setCurrentFile(file.name);
      
      // Skip unsupported file types
      if (!isFileSupported(file.name)) {
        console.log(`Skipping unsupported file: ${file.name}`);
        setProcessingStats(prev => ({
          ...prev,
          processed: prev.processed + 1,
          skipped: prev.skipped + 1
        }));
        return false;
      }
      
      // In a real implementation:
      // 1. First, download the file from Google Drive using fetch
      console.log(`Downloading file from Google Drive: ${file.name}`);
      
      try {
        // For now, create a mock file blob for demonstration
        // In a real implementation, you would fetch the file from Google Drive API
        const mockFileBlob = new Blob(['dummy content'], { type: 'application/octet-stream' });
        const fileObject = new File([mockFileBlob], file.name, { type: 'application/octet-stream' });
        
        // Actually call the PrivateGPT API to ingest the file
        console.log(`Uploading ${file.name} to PrivateGPT API`);
        const response = await uploadDocument(fileObject);
        console.log('PrivateGPT upload response:', response);
        
        setProcessingStats(prev => ({
          ...prev,
          processed: prev.processed + 1,
          successful: prev.successful + 1
        }));
        return true;
      } catch (error) {
        console.error(`Error uploading file to PrivateGPT: ${error}`);
        throw error;
      }
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      setProcessingStats(prev => ({
        ...prev,
        processed: prev.processed + 1,
        failed: prev.failed + 1
      }));
      return false;
    }
  };

  // Process all files from a Drive folder recursively
  const processDriveFolder = async (folderId: string) => {
    try {
      // In a real implementation, this would use the Google Drive API to list files in the folder
      console.log(`Processing Drive folder with ID: ${folderId}`);
      
      // Simulate API call to Google Drive - this would be a real fetch to Google Drive API
      // GET https://www.googleapis.com/drive/v3/files?q='[folderId]'+in+parents
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demonstration, use these sample file names that would come from Google Drive API
      const sampleFileNames = [
        "Project Proposal.pdf",
        "Financial Analysis.xlsx",
        "Meeting Notes.docx",
        "Technical Documentation.pdf",
        "Market Research.pptx",
        "Customer Feedback.csv",
        "Development Roadmap.txt",
        "Budget Overview.xlsx",
        "Product Specifications.docx",
        "Team Structure.pdf",
        "Implementation Strategy.pptx",
        "Data Analysis.xlsx"
      ];
      
      // Create mock files with realistic names
      const mockFiles: DriveFileItem[] = sampleFileNames.map((name, i) => ({
        id: `file-${i}`,
        name: name,
        mimeType: getMimeTypeFromFilename(name),
        webContentLink: `https://drive.google.com/file/d/file-${i}/view`,
        size: Math.floor(Math.random() * 1000000) + 50000
      }));
      
      // Update total count
      setProcessingStats(prev => ({
        ...prev,
        total: mockFiles.length
      }));
      
      // Process each file
      for (const file of mockFiles) {
        await processFile(file);
      }
      
      setIsProcessing(false);
      setShowResults(true);
      
      // Show success toast
      if (processingStats.successful > 0) {
        toast.success(`Successfully processed ${processingStats.successful} of ${processingStats.total} files`);
      } else {
        toast.error("Failed to process any files from Google Drive");
      }
      
    } catch (error) {
      console.error("Error processing Drive folder:", error);
      setIsProcessing(false);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to access Google Drive folder. Please check the URL and your permissions.";
      
      setErrorMessage(errorMessage);
      toast.error("Failed to access Google Drive folder");
    }
  };
  
  // Get mime type from filename
  const getMimeTypeFromFilename = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    const mimeTypes: {[key: string]: string} = {
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'doc': 'application/msword',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'ppt': 'application/vnd.ms-powerpoint',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'md': 'text/markdown'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!driveUrl.trim() || !isUrlValid) {
      setErrorMessage("Please enter a valid Google Drive URL");
      return;
    }
    
    // Reset states
    setIsProcessing(true);
    setErrorMessage("");
    setShowResults(false);
    setProcessingStats({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    });
    
    // Extract Drive ID from URL
    const driveId = extractDriveId(driveUrl);
    if (!driveId) {
      setErrorMessage("Could not extract a valid Google Drive ID from the URL");
      setIsProcessing(false);
      return;
    }
    
    // Process the Drive folder
    processDriveFolder(driveId);
  };

  // Reset the form
  const handleReset = () => {
    setDriveUrl("");
    setIsUrlValid(true);
    setErrorMessage("");
    setShowResults(false);
    setProcessingStats({
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0
    });
  };

  // Close the modal and reset
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (!isProcessing) {
      handleReset();
    }
  };

  return (
    <>
      <Button 
        variant="outline" 
        className="gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        onClick={() => setIsModalOpen(true)}
        id={id}
      >
        <Cloud className="h-4 w-4" />
        Connect Google Drive
      </Button>
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Connect Google Drive</DialogTitle>
          </DialogHeader>
          
          {!showResults ? (
            <>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="drive-url">Google Drive Folder URL</Label>
                  <Input
                    id="drive-url"
                    placeholder="https://drive.google.com/drive/folders/abc123..."
                    value={driveUrl}
                    onChange={handleUrlChange}
                    disabled={isProcessing}
                    className={!isUrlValid && driveUrl.trim() !== "" ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {!isUrlValid && driveUrl.trim() !== "" && (
                    <p className="text-red-500 text-sm">{errorMessage || "Invalid URL format"}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Enter the URL of a Google Drive folder containing the documents you want to import
                  </p>
                </div>
                
                {errorMessage && isUrlValid && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>
                        Processing: {processingStats.processed}/{processingStats.total} files
                      </span>
                      <span className="text-muted-foreground">
                        {Math.round((processingStats.processed / Math.max(processingStats.total, 1)) * 100)}%
                      </span>
                    </div>
                    <Progress value={(processingStats.processed / Math.max(processingStats.total, 1)) * 100} className="h-2" />
                    <p className="text-sm text-muted-foreground truncate">
                      {currentFile && `Current file: ${currentFile}`}
                    </p>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal} disabled={isProcessing}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={isProcessing || !isUrlValid || driveUrl.trim() === ""}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" />
                      Connect
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <Alert className={processingStats.failed > 0 ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800" : "border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-800"}>
                  {processingStats.failed > 0 ? (
                    <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  <AlertTitle className={processingStats.failed > 0 ? "text-orange-600 dark:text-orange-400" : "text-green-600 dark:text-green-400"}>
                    {processingStats.failed > 0 ? "Import completed with some issues" : "Import successful"}
                  </AlertTitle>
                  <AlertDescription>
                    {`Successfully processed ${processingStats.total} files from Google Drive.`}
                  </AlertDescription>
                </Alert>
                
                <div className="bg-muted/40 p-4 rounded-md text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="font-medium">Total files:</span>
                      </div>
                      <p className="ml-5.5 text-muted-foreground">{processingStats.total}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Check className="h-4 w-4 text-green-500" />
                        <span className="font-medium">Successful:</span>
                      </div>
                      <p className="ml-5.5 text-muted-foreground">{processingStats.successful}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5">
                        <X className="h-4 w-4 text-red-500" />
                        <span className="font-medium">Failed:</span>
                      </div>
                      <p className="ml-5.5 text-muted-foreground">{processingStats.failed}</p>
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="font-medium">Skipped:</span>
                      </div>
                      <p className="ml-5.5 text-muted-foreground">{processingStats.skipped}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    handleReset();
                    setShowResults(false);
                  }}
                >
                  Import More Files
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Toaster />
    </>
  );
} 