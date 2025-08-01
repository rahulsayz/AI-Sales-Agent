"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, FileText, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { listDocuments, uploadDocument, deleteDocument } from '@/lib/api';

interface DocumentManagementProps {
  onBack: () => void;
}

export function DocumentManagement({ onBack }: DocumentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [documentCategory, setDocumentCategory] = useState('product');
  
  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const docs = await listDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load documents. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Filter documents
  const filteredDocuments = documents
    .filter(doc => 
      (categoryFilter === 'all' || (doc.metadata && doc.metadata.category === categoryFilter)) &&
      doc.name && doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
  // Get unique categories for filter
  const getCategoryFromDoc = (doc: any) => doc.metadata?.category || 'Uncategorized';
  const uniqueCategories = Array.from(new Set(documents.map(getCategoryFromDoc)));
  const categories = ['all', ...uniqueCategories];
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 10MB.");
      return;
    }
    
    // Check file type
    const allowedTypes = ['text/plain', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file type. Please upload a TXT, PDF, or DOCX file.");
      return;
    }
    
    // Upload file
    setUploadingFile(true);
    try {
      const result = await uploadDocument(file);
      
      // Refresh document list
      fetchDocuments();
      
      toast.success(`Uploaded ${file.name}`);
    } catch (error) {
      console.error("Failed to upload document:", error);
      toast.error("Failed to upload document. Please try again.");
    } finally {
      setUploadingFile(false);
    }
  };
  
  const handleDeleteDocument = async (docId: string) => {
    try {
      await deleteDocument(docId);
      
      // Update UI
      setDocuments(documents.filter(doc => doc.id !== docId));
      
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Failed to delete document:", error);
      toast.error("Failed to delete document. Please try again.");
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">Manage Sales Materials</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium mb-4">Upload Document</h3>
          
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                name="file-upload"
                className="hidden"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <Upload className="h-8 w-8 mb-2 text-gray-400" />
                <p className="text-sm font-medium mb-1">Drag and drop or click to upload</p>
                <p className="text-xs text-muted-foreground">
                  Supports PDF, DOCX, TXT (Max 10MB)
                </p>
              </label>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Document Category</Label>
              <Select 
                value={documentCategory} 
                onValueChange={setDocumentCategory}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">Product Info</SelectItem>
                  <SelectItem value="case">Case Studies</SelectItem>
                  <SelectItem value="pricing">Pricing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="market">Market Research</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              disabled={uploadingFile}
            >
              {uploadingFile ? (
                <>Uploading...</>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">Document Library</h3>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-[200px]"
                  id="document-search"
                  name="document-search"
                  aria-label="Search documents"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="border rounded-md">
            <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 dark:bg-gray-900 font-medium text-sm">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Size</div>
              <div className="col-span-2">Actions</div>
            </div>
            
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading documents...
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No documents found
              </div>
            ) : (
              <div className="divide-y">
                {filteredDocuments.map(doc => (
                  <div key={doc.id} className="grid grid-cols-12 gap-4 p-3 items-center text-sm">
                    <div className="col-span-6 flex items-center">
                      <div className="mr-2 text-indigo-500">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate" title={doc.name}>{doc.name}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs">
                        {getCategoryFromDoc(doc)}
                      </span>
                    </div>
                    <div className="col-span-2">{formatFileSize(doc.metadata?.size || 0)}</div>
                    <div className="col-span-2 flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteDocument(doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button 
          variant="outline" 
          onClick={fetchDocuments}
        >
          Refresh Documents
        </Button>
      </div>
    </div>
  );
}