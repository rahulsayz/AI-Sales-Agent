"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentContextViewer } from '@/components/document/document-context-viewer';
import { Search } from 'lucide-react';

// Sample data based on the provided API response
const sampleChunks = [
  {
    "object": "context.chunk",
    "score": 0.7153670574178944,
    "document": {
      "object": "ingest.document",
      "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
      "doc_metadata": {
        "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1 12-30-24 -SF 24-07917-12.30.24MAv1.1.docx",
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
        "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1 12-30-24 -SF 24-07917-12.30.24MAv1.1.docx",
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
        "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1 12-30-24 -SF 24-07917-12.30.24MAv1.1.docx",
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
  },
  {
    "object": "context.chunk",
    "score": 0.7108131351191957,
    "document": {
      "object": "ingest.document",
      "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
      "doc_metadata": {
        "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1 12-30-24 -SF 24-07917-12.30.24MAv1.1.docx",
        "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
        "window": "SOW Termination. \n\n First American may terminate this SOW for its convenience upon thirty (30) days' prior written notice to Vendor.  This SOW  may be terminated for cause by either Party in accordance with the Master Agreement.\n\n 4.  Services. \n\n This SOW sets forth the Services to be provided by Vendor relating to the following projects and/or tasks:  \n\n\n\nProject Name: Cloud Migration and Data Modernization\n\n\n\nBrief Description:  First American Financial (\"FAF\") Corporation is focused on modernizing its business processes and data platform to foster innovation and support business growth.  This project aims to utilize advanced data warehousing, databases, and cloud services to build a streamlined, integrated, and cost-efficient data platform.\n\n",
        "original_text": "4. "
      }
    },
    "text": "4. ",
    "previous_texts": [
      "This SOW  may be terminated for cause by either Party in accordance with the Master Agreement.\n\n"
    ],
    "next_texts": [
      "Services. \n\n"
    ]
  },
  {
    "object": "context.chunk",
    "score": 0.7052968175355376,
    "document": {
      "object": "ingest.document",
      "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
      "doc_metadata": {
        "file_name": "12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1 12-30-24 -SF 24-07917-12.30.24MAv1.1.docx",
        "doc_id": "4cc6e1ee-3156-4784-9a8a-bb2ecb98c850",
        "window": "Out of scope:\n\nSynthetic data generation for Dimension model testing \n\nPerformance Testing of new Data model\n\nDevelopment of Semantic layer\n\nImplementation of Reverse ETL, CDC \n\nData sync between old model and new model\n\nConversion of SQL Stored Procedures would be taken care by FAF.\n\n Data Migration\n\nCDC setup and configuration (as required)\n\nMSSQL to CloudSQL migration execution\n\nData validation and testing\n\nMigration cutover planning\n\nAlloyDB Implementation\n\nAlloyDB cluster setup and configuration\n\nNew Data Domain models implementation \n\nPerformance optimization and tuning\n\nData Pipeline Development or Refactor\n\nDevelop 1800-2000 Data Flows for the new data model (or refactor converted pipelines in initiative 5.  Final approach to be mutually evaluated and agreed during design phase)\n\n\n\nOut of Scope\n\nData Pipeline Observability beyond current auditing / Logging implemented and base capabilities supported by Onix DIF\n\nImplementation of Data Governance \n\nImplementation of Data Lineage beyond out of box capabilities supported by Dataplex\n\nImplementation of Data Masking, Tokenization and Data Classification (except for aspects already implemented on current SQL Server Datawarehouse\n\nImplementation of Data Retention and archival\n\nOptimization & Deployment\n\nPerformance tuning and optimization (for 8-10% queries only)\n\nDocumentation and training delivery\n\nSupport FAF team with Production deployment \n\nAssumptions\n\nFoundation Phase\n\nFAF would provide access to the functional SME and Business owners for the new Data Model creation \n\n\n\nData Migration\n\nSource system access is available\n\nNetwork connectivity is established\n\nDowntime window is agreed upon\n\nSource data quality is acceptable\n\n\n\nAlloyDB Implementation\n\nPerformance benchmarks for the current solution and pipelines exist; as that would be used to compare the performance of the new data model and pipeline.  The objective would be to deliver better or equal performance.\n\n\n\n Optimization & Deployment\n\nPerformance benchmarks are defined\n\nSecurity requirements are met\n\nTraining audience is identified\n\nProduction environment is ready\n\n\n\n\n\nInitiative 7: App Modernization (New Data Model on AlloyDB)\n\nReplatform applications currently hosted on GCP Compute Engine (GCE) to Google Kubernetes Engine (GKE).  Refactor application codebases to update database connection strings, queries, and stored procedures to use AlloyDB along with implementation of infrastructure and application observability. \n\n\n\n Work Area\n\nHigh Level Activities\n\nReplatforming Application on VM to GKE\n\nAssessment of Current Environment\n\nEvaluate existing applications to assess containerization feasibility.\n\n",
        "original_text": "The objective would be to deliver better or equal performance.\n\n\n\n"
      }
    },
    "text": "The objective would be to deliver better or equal performance.\n\n\n\n",
    "previous_texts": [
      "Final approach to be mutually evaluated and agreed during design phase)\n\n\n\nOut of Scope\n\nData Pipeline Observability beyond current auditing / Logging implemented and base capabilities supported by Onix DIF\n\nImplementation of Data Governance \n\nImplementation of Data Lineage beyond out of box capabilities supported by Dataplex\n\nImplementation of Data Masking, Tokenization and Data Classification (except for aspects already implemented on current SQL Server Datawarehouse\n\nImplementation of Data Retention and archival\n\nOptimization & Deployment\n\nPerformance tuning and optimization (for 8-10% queries only)\n\nDocumentation and training delivery\n\nSupport FAF team with Production deployment \n\nAssumptions\n\nFoundation Phase\n\nFAF would provide access to the functional SME and Business owners for the new Data Model creation \n\n\n\nData Migration\n\nSource system access is available\n\nNetwork connectivity is established\n\nDowntime window is agreed upon\n\nSource data quality is acceptable\n\n\n\nAlloyDB Implementation\n\nPerformance benchmarks for the current solution and pipelines exist; as that would be used to compare the performance of the new data model and pipeline. "
    ],
    "next_texts": [
      "Optimization & Deployment\n\nPerformance benchmarks are defined\n\nSecurity requirements are met\n\nTraining audience is identified\n\nProduction environment is ready\n\n\n\n\n\nInitiative 7: App Modernization (New Data Model on AlloyDB)\n\nReplatform applications currently hosted on GCP Compute Engine (GCE) to Google Kubernetes Engine (GKE). "
    ]
  }
];

export default function DocumentViewerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Document Context Viewer</h1>
      
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      {showResults && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Search Results</h2>
          <DocumentContextViewer chunks={sampleChunks} />
        </div>
      )}
      
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">How to Use</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <ol className="list-decimal list-inside space-y-3">
            <li>Enter your search query in the search box above</li>
            <li>Click "Search" to retrieve relevant document sections</li>
            <li>Browse through the sections in the left sidebar</li>
            <li>Click on a section to view its details</li>
            <li>See the context before and after the matching text</li>
          </ol>
          
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h3 className="font-medium mb-2">About Document Context</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The Document Context Viewer displays relevant sections from your knowledge base that match your query.
              Each section shows the matching text along with surrounding context to help you understand the information in context.
              Sections are ranked by relevance score, with higher scores indicating better matches to your query.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}