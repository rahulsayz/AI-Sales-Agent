"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { DocumentContextViewer } from '@/components/document/document-context-viewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Search, X } from 'lucide-react';

interface RagDocumentViewerProps {
  query: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RagDocumentViewer({ query, isOpen, onClose }: RagDocumentViewerProps) {
  const [chunks, setChunks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!query || !isOpen) return;
    
    const fetchDocumentContext = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would call the actual API
        // For demo purposes, we'll simulate a response with a timeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data based on the provided API response
        const sampleChunks = [
          {
            "object": "context.chunk",
            "score": 0.7153670574178944,
            "document": {
              "object": "ingest.document",
              "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
              "doc_metadata": {
                "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1.docx",
                "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
                "window": "Vendor shall submit invoice(s) via First American's procure-to-pay application as  directed in the applicable Purchase Order.  If a Purchase Order is not issued, Vendor must submit invoices  to midwestap.sw@firstam.com.  \n\n Fixed Fee: Vendor may invoice First American following acceptance by First American of each separately  priced deliverable.  \n\n\n\n 7.  Authorized Representatives and Key Personnel. \n\n The Parties hereby designate the following individuals as their authorized representatives (\"Authorized  Representative\") during the term of the SOW.  A Party may change its Authorized Representative by written  notice to the other Party (for which email shall suffice). \n\n\n\n\n\n",
                "original_text": "7. "
              }
            },
            "text": "7. ",
            "previous_texts": [
              "Fixed Fee: Vendor may invoice First American following acceptance by First American of each separately  priced deliverable.  \n\n\n\n"
            ],
            "next_texts": [
              "Authorized Representatives and Key Personnel. \n\n"
            ]
          },
          {
            "object": "context.chunk",
            "score": 0.7150730725171842,
            "document": {
              "object": "ingest.document",
              "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
              "doc_metadata": {
                "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1.docx",
                "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
                "window": "Change Control Process. \n\n If at any time either Party desires to modify this SOW as to any of the Services, including deliverables,  First American will provide a written request to Vendor describing such modifications using First  American's standard Change Order form attached hereto as Attachment B (each such request is a \"Change  Order\").  Once executed by the Parties, the Change Order will be deemed to amend and become part of the  SOW.  \n\n 6.  Pricing, Payment, and Invoicing. \n\n The pricing details for the Services are as described in and according to the schedule set forth in Attachment A-1.  First American will not pay any invoice(s) that do not reference the appropriate First American  Purchase Order number. ",
                "original_text": "6. "
              }
            },
            "text": "6. ",
            "previous_texts": [
              "Once executed by the Parties, the Change Order will be deemed to amend and become part of the  SOW.  \n\n"
            ],
            "next_texts": [
              "Pricing, Payment, and Invoicing. \n\n"
            ]
          },
          {
            "object": "context.chunk",
            "score": 0.7110864295706874,
            "document": {
              "object": "ingest.document",
              "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
              "doc_metadata": {
                "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1.docx",
                "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
                "window": "This SOW sets forth the Services to be provided by Vendor relating to the following projects and/or tasks:  \n\n\n\nProject Name: Cloud Migration and Data Modernization\n\n\n\nBrief Description:  First American Financial (\"FAF\") Corporation is focused on modernizing its business processes and data platform to foster innovation and support business growth.  This project aims to utilize advanced data warehousing, databases, and cloud services to build a streamlined, integrated, and cost-efficient data platform.\n\n The deliverables as described in and according to the schedule set forth in: \n\nAttachment A-1 (Deliverables and Pricing); and  \n\nAttachment A-2 (Scope of Work) \n\nThe Attachments are hereby incorporated into this SOW.\n\n 5.  Change Control Process. \n\n If at any time either Party desires to modify this SOW as to any of the Services, including deliverables,  First American will provide a written request to Vendor describing such modifications using First  American's standard Change Order form attached hereto as Attachment B (each such request is a \"Change  Order\").  Once executed by the Parties, the Change Order will be deemed to amend and become part of the  SOW.  \n\n",
                "original_text": "5. "
              }
            },
            "text": "5. ",
            "previous_texts": [
              "The deliverables as described in and according to the schedule set forth in: \n\nAttachment A-1 (Deliverables and Pricing); and  \n\nAttachment A-2 (Scope of Work) \n\nThe Attachments are hereby incorporated into this SOW.\n\n"
            ],
            "next_texts": [
              "Change Control Process. \n\n"
            ]
          }
        ];
        
        setChunks(sampleChunks);
      } catch (error) {
        console.error('Error fetching document context:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDocumentContext();
  }, [query, isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-indigo-500 mr-2" />
            <h2 className="text-xl font-bold">Document Context</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center">
            <Search className="h-4 w-4 text-gray-400 mr-2" />
            <div className="font-medium">Query: </div>
            <div className="ml-2 text-gray-600 dark:text-gray-300">{query}</div>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <Tabs defaultValue="context">
            <TabsList className="mb-4">
              <TabsTrigger value="context">Document Context</TabsTrigger>
              <TabsTrigger value="sources">Source Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="context" className="mt-0">
              <DocumentContextViewer chunks={chunks} isLoading={isLoading} />
            </TabsContent>
            
            <TabsContent value="sources" className="mt-0">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-medium mb-4">Source Documents</h3>
                
                <div className="space-y-3">
                  {Array.from(new Set(chunks.map(chunk => chunk.document.doc_id))).map((docId, index) => {
                    const doc = chunks.find(chunk => chunk.document.doc_id === docId)?.document;
                    return (
                      <div key={docId} className="flex items-start p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
                        <FileText className="h-5 w-5 text-indigo-500 mr-3 mt-1" />
                        <div>
                          <h4 className="font-medium">
                            {doc?.doc_metadata.file_name || `Document ${index + 1}`}
                          </h4>
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">
                              {docId.substring(0, 8)}...
                            </code>
                          </div>
                          <div className="text-sm mt-2">
                            {chunks.filter(chunk => chunk.document.doc_id === docId).length} relevant sections
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}