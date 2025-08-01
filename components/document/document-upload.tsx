"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  File, 
  X, 
  Check, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { uploadDocument } from "@/lib/api";
import { toast } from "sonner";

// List of supported file extensions for PrivateGPT
const SUPPORTED_FILE_TYPES = [
  'application/pdf', 
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
  'text/csv',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-powerpoint',
  'application/rtf',
  'application/vnd.oasis.opendocument.text'
];

interface FileWithStatus {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface DocumentUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete?: () => void;
}

export function DocumentUpload({ open, onOpenChange, onUploadComplete }: DocumentUploadProps) {
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0
    }));
    
    setFiles(prev => [...prev, ...newFiles]);
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/rtf': ['.rtf'],
      'application/vnd.oasis.opendocument.text': ['.odt']
    },
    maxSize: 50 * 1024 * 1024, // 50MB max file size
  });
  
  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };
  
  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    
    // Process each file sequentially
    for (let i = 0; i < files.length; i++) {
      // Skip files that are already processed
      if (files[i].status !== 'pending') continue;
      
      // Update the current file status to uploading
      setFiles(prev => {
        const newFiles = [...prev];
        newFiles[i] = { ...newFiles[i], status: 'uploading', progress: 0 };
        return newFiles;
      });
      
      try {
        // Simulate progress updates
        const progressInterval = setInterval(() => {
          setFiles(prev => {
            const newFiles = [...prev];
            // Increase progress by random amount, max out at 90% (final 10% is for server processing)
            const currentProgress = newFiles[i].progress;
            const newProgress = Math.min(90, currentProgress + Math.random() * 10);
            newFiles[i] = { ...newFiles[i], progress: newProgress };
            return newFiles;
          });
        }, 300);
        
        // Upload file to PrivateGPT
        const response = await uploadDocument(files[i].file);
        
        // Clear interval and mark as success
        clearInterval(progressInterval);
        
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { ...newFiles[i], status: 'success', progress: 100 };
          return newFiles;
        });
        
        toast.success(`Uploaded ${files[i].file.name} successfully`);
      } catch (error) {
        console.error(`Error uploading file ${files[i].file.name}:`, error);
        
        setFiles(prev => {
          const newFiles = [...prev];
          newFiles[i] = { 
            ...newFiles[i], 
            status: 'error', 
            progress: 0,
            error: error instanceof Error ? error.message : 'Upload failed'
          };
          return newFiles;
        });
        
        toast.error(`Failed to upload ${files[i].file.name}`);
      }
    }
    
    setIsUploading(false);
    
    // Call the onUploadComplete callback if all files are processed
    if (files.every(file => file.status !== 'pending')) {
      onUploadComplete?.();
    }
  };
  
  const handleClose = () => {
    if (!isUploading) {
      onOpenChange(false);
      // Reset files state after dialog is closed
      setTimeout(() => setFiles([]), 300);
    }
  };
  
  // Calculate overall progress
  const overallProgress = files.length 
    ? Math.round(files.reduce((sum, file) => sum + file.progress, 0) / files.length) 
    : 0;
  
  // Count successful uploads
  const successCount = files.filter(f => f.status === 'success').length;
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div 
            {...getRootProps()} 
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="w-10 h-10 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-sm font-medium mb-1">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Supports PDF, Word, Excel, PowerPoint, TXT, MD, CSV (Max 50MB)
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="mx-auto"
              disabled={isUploading}
            >
              Browse Files
            </Button>
          </div>
          
          {files.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium flex justify-between">
                <span>Files to upload ({files.length})</span>
                {isUploading && (
                  <span className="text-muted-foreground">{overallProgress}% Complete</span>
                )}
              </div>
              
              {isUploading && (
                <Progress value={overallProgress} className="h-2" />
              )}
              
              <div className="max-h-48 overflow-y-auto space-y-2">
                {files.map((fileObj, index) => (
                  <div 
                    key={index} 
                    className={`
                      flex items-center justify-between p-2 rounded-md text-sm 
                      ${fileObj.status === 'error' 
                        ? 'bg-destructive/10 text-destructive border border-destructive/20' 
                        : 'bg-muted'}
                    `}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <File className="h-4 w-4 shrink-0" />
                      <span className="truncate max-w-[150px]">
                        {fileObj.file.name}
                      </span>
                      {fileObj.status === 'uploading' && (
                        <div className="text-xs text-muted-foreground">
                          {Math.round(fileObj.progress)}%
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      {fileObj.status === 'success' && <Check className="h-4 w-4 text-green-600" />}
                      {fileObj.status === 'error' && <AlertCircle className="h-4 w-4" />}
                      {fileObj.status === 'uploading' && <Loader2 className="h-4 w-4 animate-spin" />}
                      {fileObj.status !== 'uploading' && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          disabled={isUploading}
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Success summary */}
              {successCount > 0 && !isUploading && (
                <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-900">
                  <Check className="h-4 w-4 inline-block mr-1" />
                  {successCount === files.length 
                    ? `All ${successCount} files uploaded successfully` 
                    : `${successCount} of ${files.length} files uploaded successfully`}
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
          >
            {files.some(f => f.status === 'success') ? 'Done' : 'Cancel'}
          </Button>
          
          <Button 
            disabled={files.length === 0 || isUploading || files.every(f => f.status !== 'pending')}
            onClick={uploadFiles}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 