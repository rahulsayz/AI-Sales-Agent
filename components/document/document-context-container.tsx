"use client";

import { useState, useEffect } from 'react';
import { DocumentContextViewer } from './document-context-viewer';
import { fetchDocumentChunks } from '@/lib/api';

interface DocumentContextContainerProps {
  query?: string;
  apiEndpoint?: string;
}

export function DocumentContextContainer({ 
  query = '', 
  apiEndpoint = '/v1/chunks' 
}: DocumentContextContainerProps) {
  const [chunks, setChunks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query) return;

    const fetchDocumentContext = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would call the actual API
        const response = await fetchDocumentChunks(query);
        setChunks(response.data || []);
      } catch (err) {
        console.error('Error fetching document context:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocumentContext();
  }, [query, apiEndpoint]);

  if (error) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-red-500 dark:text-red-400 mb-2">Error loading document context</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">{error}</div>
      </div>
    );
  }

  return <DocumentContextViewer chunks={chunks} isLoading={isLoading} />;
}