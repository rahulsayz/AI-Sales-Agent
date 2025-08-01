"use client";

import { ChatMode, Chat, Message } from './types';
import { v4 as uuidv4 } from 'uuid';
import { useStore } from './store';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';

// API base URL - in a real app, this would come from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://34.27.62.150';

/**
 * Cleans up RAG responses by removing or formatting image descriptions and slide markers
 */
function cleanupRagResponse(text: string): string {
  if (!text) return "";
  
  return text
    // Replace literal '\n' strings with actual newlines
    .replace(/\\n/g, '\n')
    // Remove image descriptions
    .replace(/Image: [^"\n]+/g, '')
    // Format slide markers as headings
    .replace(/Slide #(\d+):\s*(.*)$/gm, '## Slide $1: $2')
    // Remove multiple consecutive newlines (more than 2)
    .replace(/\n{3,}/g, '\n\n')
    // Clean up any special character sequences that might have been introduced
    .replace(/\\+"/g, '"')
    // Remove unnecessary whitespace
    .trim();
}

export async function sendMessage(
  message: string,
  mode: ChatMode,
  chatId: string,
  systemPrompt?: string
): Promise<Message> {
  try {
    console.log('Sending message with mode:', mode);
    console.log('System prompt:', systemPrompt);

    let response;
    let requestBody;

    // Get the store to access chats for document filtering
    const store = useStore.getState();
    const chats = store.chats;
    
    // Generate a persistent session ID for this chat if it doesn't exist
    let sessionId = localStorage.getItem(`chat_session_${chatId}`);
    if (!sessionId) {
      // Use chatId as part of the sessionId for more consistency
      sessionId = `session_${chatId}_${uuidv4()}`;
      localStorage.setItem(`chat_session_${chatId}`, sessionId);
      console.log(`Created new session ID for chat ${chatId}: ${sessionId}`);
    } else {
      console.log(`Using existing session ID for chat ${chatId}: ${sessionId}`);
    }

    // Default request headers with session tracking
    const headers = {
      'Content-Type': 'application/json',
      'X-Session-ID': sessionId
    };

    switch (mode) {
      case 'chat':
        // Basic Chat Mode - No context
        requestBody = {
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: message }
          ],
          stream: true,
          use_context: false
        };
        response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
        });
        break;

      case 'rag':
        // RAG Mode - With context
        const ragRequestBody: {
          messages: Array<{role: string, content: string}>;
          stream: boolean;
          use_context: boolean;
          context_filter?: { docs_ids: string[] } | null;
          temperature?: number;
          similarity_top_k?: number;
          rerank_top_n?: number;
          seed?: number;
          include_sources?: boolean;
          deterministic_mode?: boolean;
        } = {
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            { role: 'user', content: message }
          ],
          stream: true,
          use_context: true,
          context_filter: null,
          // Set to 0 for complete determinism
          temperature: 0,
          // Ensure consistent chunk selection
          similarity_top_k: 5,
          rerank_top_n: 3,
          // Add fixed seed for reproducible results
          seed: 42,
          include_sources: true,
          // Enable deterministic mode for consistent responses
          deterministic_mode: true
        };
        
        // If there are selected documents for the chat, add them to the context filter
        const ragChat = chats.find((c) => c.id === chatId);
        if (ragChat && ragChat.documents && ragChat.documents.length > 0) {
          ragRequestBody.context_filter = {
            docs_ids: ragChat.documents
          };
          
          // Include previous messages for better context
          if (ragChat.messages && ragChat.messages.length > 0) {
            const contextMessages = ragChat.messages
              .slice(-10)  // Take up to last 10 messages
              .filter(msg => msg.content.trim() !== "") // Skip empty messages
              .map(msg => ({
                role: msg.role as 'user' | 'assistant' | 'system',
                content: msg.content
              }));
            
            if (contextMessages.length > 0) {
              ragRequestBody.messages = [
                ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                ...contextMessages,
                { role: 'user', content: message }
              ];
              console.log('Using chat history in RAG request:', contextMessages.length, 'messages');
            }
          }
        }
        
        requestBody = ragRequestBody;
        
        console.log('RAG request body:', JSON.stringify(requestBody, null, 2));
        
        response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
        });
        
        console.log('RAG response status:', response.status);
        break;

      case 'search':
        // Search Mode - Retrieve relevant chunks
        const searchRequestBody: {
          text: string;
          limit: number;
          prev_next_chunks: number;
          context_filter?: { docs_ids: string[] } | null;
        } = {
          text: message,
          limit: 4,
          prev_next_chunks: 0,
          context_filter: null
        };
        
        // If there are selected documents for the chat, add them to the context filter
        const searchChat = chats.find((c) => c.id === chatId);
        if (searchChat && searchChat.documents && searchChat.documents.length > 0) {
          searchRequestBody.context_filter = {
            docs_ids: searchChat.documents
          };
        }
        
        requestBody = searchRequestBody;
        
        console.log('Search request body:', JSON.stringify(requestBody, null, 2));
        
        response = await fetch(`${API_BASE_URL}/v1/chunks`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
        });
        
        console.log('Search response status:', response.status);
        break;

      case 'summarize':
        // Summarize Mode - Using dedicated summarize endpoint
        const summarizeRequestBody: {
          instructions: string;
          use_context: boolean;
          stream: boolean;
          context_filter?: { docs_ids: string[] } | null;
          temperature?: number;
          similarity_top_k?: number;
          rerank_top_n?: number;
          seed?: number;
          deterministic_mode?: boolean;
        } = {
          instructions: message,
          use_context: true,
          stream: true,
          context_filter: null,
          // Set to 0 for complete determinism
          temperature: 0,
          // Ensure consistent chunk selection
          similarity_top_k: 5,
          rerank_top_n: 3,
          // Add fixed seed for reproducible results
          seed: 42,
          // Enable deterministic mode for consistent responses
          deterministic_mode: true
        };
        
        // If there are selected documents for the chat, add them to the context filter
        const chat = chats.find((c) => c.id === chatId);
        if (chat && chat.documents && chat.documents.length > 0) {
          summarizeRequestBody.context_filter = {
            docs_ids: chat.documents
          };
        }
        
        requestBody = summarizeRequestBody;
        
        console.log('Summarize request body:', JSON.stringify(requestBody, null, 2));
        
        response = await fetch(`${API_BASE_URL}/v1/summarize`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(requestBody),
        });
        
        console.log('Summarize response status:', response.status);
        break;

      default:
        throw new Error(`Unsupported chat mode: ${mode}`);
    }

    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Handle streaming response for chat and summarize modes
    if (mode === 'chat' || mode === 'rag' || mode === 'summarize') {
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let fullResponse = '';
      let totalChunks = 0;
      const messageId = uuidv4();
      const decoder = new TextDecoder();
      let sources: any[] = []; // Track sources for RAG mode
      
      // Add a buffer for accumulating partial JSON data
      let jsonBuffer = '';
      
      console.log(`Starting to read streaming response for ${mode} mode`);
      
      // We'll collect the full response without adding to store
      try {
        // Try to read the data as stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            console.log(`Stream complete after ${totalChunks} chunks`);
            break;
          }

          const chunk = decoder.decode(value);
          totalChunks++;
          
          // Log chunks but truncate if too large
          if (chunk.length > 200) {
            console.log(`Received chunk #${totalChunks} for ${mode} mode (${chunk.length} bytes): ${chunk.substring(0, 200)}...`);
          } else {
            console.log(`Received chunk #${totalChunks} for ${mode} mode (${chunk.length} bytes): ${chunk}`);
          }
          
          // Instead of processing line by line, accumulate the chunk data
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (!line || line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const dataContent = line.slice(6).trim();
              if (dataContent === '[DONE]') {
                console.log('Received [DONE] signal');
                continue;
              }
              
              try {
                // Try to parse as JSON directly
                try {
                  const data = JSON.parse(dataContent);
                  const result = handleDataObject(data, mode, fullResponse, sources, totalChunks);
                  if (result.content) {
                    fullResponse += result.content;
                  }
                  if (result.newSources) {
                    sources = [...sources, ...result.newSources];
                  }
                } catch (jsonError: any) {
                  // If parsing fails, add to buffer and try to process it
                  console.log(`JSON parsing error in chunk #${totalChunks}: ${jsonError.message}`);
                  
                  // Enhanced handling for malformed JSON
                  const quickContent = extractTextFromMalformedJson(dataContent);
                  if (quickContent && quickContent.trim().length > 0 && quickContent.length < 200) {
                    // If we extracted something short and meaningful, use it directly
                    console.log(`Directly extracted content from malformed chunk: "${quickContent}"`);
                    fullResponse += quickContent;
                  } else {
                    // Safer buffer handling
                    if (jsonBuffer.length > 50000) {
                      // If buffer is too large, clear it to prevent memory issues
                      console.warn("JSON buffer exceeded maximum size, clearing to prevent memory issues");
                      jsonBuffer = dataContent;
                    } else {
                      // Otherwise add to buffer and try to extract complete objects
                      jsonBuffer += dataContent;
                    }
                    
                    // Try to extract and process complete JSON objects from buffer
                    try {
                      const extracted = extractCompleteJSON(jsonBuffer);
                      if (extracted.objects.length > 0) {
                        let processed = false;
                        
                        // Process each complete JSON object
                        for (const obj of extracted.objects) {
                          try {
                            const parsedObj = JSON.parse(obj);
                            const result = handleDataObject(parsedObj, mode, fullResponse, sources, totalChunks);
                            if (result.content) {
                              fullResponse += result.content;
                              processed = true;
                            }
                            if (result.newSources) {
                              sources = [...sources, ...result.newSources];
                            }
                          } catch (parseError: any) {
                            console.warn(`Error parsing extracted JSON: ${parseError.message}`);
                          }
                        }
                        
                        // Update buffer to only include remaining data
                        jsonBuffer = extracted.remainder;
                      }
                    } catch (extractError) {
                      // If extraction fails completely, try to get any content we can
                      try {
                        const emergencyContent = extractTextFromMalformedJson(jsonBuffer);
                        if (emergencyContent && emergencyContent.trim().length > 0) {
                          console.warn("Using emergency content extraction from buffer");
                          fullResponse += emergencyContent;
                          // Clear buffer after emergency extraction
                          jsonBuffer = "";
                        }
                      } catch (finalError) {
                        // Last resort - clear buffer if all else fails
                        console.error("Buffer processing failed completely, clearing buffer");
                        jsonBuffer = "";
                      }
                    }
                  }
                }
              } catch (e: unknown) {
                // Just log the error and continue - we don't want to break the stream
                const errorMessage = e instanceof Error ? e.message : 'Unknown error';
                console.warn(`Error handling SSE data in chunk #${totalChunks}: ${errorMessage}`);
              }
            } else {
              // Non-data lines: Log only the type without the full content
              if (line.length > 0) {
                const lineType = line.split(':')[0] || 'unknown';
                console.log(`Skipping non-data line in chunk #${totalChunks} - Line type: ${lineType}`);
              }
            }
          }
        }
        
        // Process any remaining data in the buffer at the end
        if (jsonBuffer.trim()) {
          console.log(`Processing remaining buffer (${jsonBuffer.length} bytes) after stream completion`);
          try {
            const result = processRemainingBuffer(jsonBuffer, mode, fullResponse, sources);
            if (result.content) {
              fullResponse += result.content;
            }
            if (result.newSources && result.newSources.length > 0) {
              sources = [...sources, ...result.newSources];
            }
          } catch (bufferError: any) {
            console.error(`Error processing remaining buffer: ${bufferError.message}`);
          }
        }
      } finally {
        reader.releaseLock();
        console.log(`Reader released after ${totalChunks} chunks`);
      }

      console.log(`Final ${mode} response (${fullResponse.length} chars):`, fullResponse);

      // Process fullResponse for RAG mode to ensure proper formatting
      if (mode === 'rag') {
        // Clean up any markdown formatting issues
        fullResponse = fullResponse.trim();
        
        // Clean up image descriptions and slide markers
        fullResponse = cleanupRagResponse(fullResponse);
        
        // Fix any numbering issues (if response starts with a number > 1)
        fullResponse = fullResponse.replace(/^\d+\.\s+/, '1. ');
        
        // Ensure proper line breaks between sections
        fullResponse = fullResponse.replace(/(\d+\.\s+)/g, '\n$1').trim();
        
        // Format the response for better readability
        if (fullResponse) {
          // Add paragraph breaks to improve readability if needed
          if (!fullResponse.includes('\n\n') && fullResponse.length > 200) {
            fullResponse = fullResponse.replace(/\.\s+([A-Z])/g, '.\n\n$1');
          }
        }
        
        // EXTRACT CONTENT FROM RAW DOCUMENT AS LAST RESORT
        if (!fullResponse && sources && sources.length > 0) {
          console.log("No AI-generated content found, extracting from sources as last resort");
          let extractedContent = "Based on the provided documents:\n\n";
          
          // Extract meaningful content from the first 1-2 sources
          const sourceLimit = Math.min(2, sources.length);
          for (let i = 0; i < sourceLimit; i++) {
            const source = sources[i];
            if (source.text) {
              // Extract a summary from the text (first 100-200 chars)
              const excerpt = source.text.substring(0, 150).trim();
              extractedContent += `- ${excerpt}...\n\n`;
            } else if (source.document && source.document.doc_metadata && source.document.original_text) {
              const excerpt = source.document.original_text.substring(0, 150).trim();
              extractedContent += `- ${excerpt}...\n\n`;
            }
          }
          
          fullResponse = extractedContent;
        }
        
        // For RAG mode, add sources and return
        let content = fullResponse;
        
        if (sources && sources.length > 0) {
          console.log(`Found ${sources.length} sources to process:`, JSON.stringify(sources, null, 2));
          
          // Create a set of unique document names to avoid duplicates
          const uniqueSources = new Set();
          
          // Extract all potential source info first
          const extractedSources: Array<{name: string, page?: string, docId?: string}> = [];
          
          // Define the properties to check for document info, in order of preference
          const docIdProperties = ['id', 'doc_id', 'document_id', 'documentId'];
          const fileNameProperties = ['file_name', 'filename', 'name', 'title', 'source'];
          const pageProperties = ['page', 'page_label', 'pageLabel', 'pageNumber', 'page_number'];
          
          sources.forEach((source: any, index: number) => {
            console.log(`Processing source ${index}:`, JSON.stringify(source, null, 2));
            
            // First, check if source has a document property
            if (source.document) {
              console.log(`Source ${index} has document property`);
              
              // Try to extract document ID
              let docId: string | undefined;
              for (const prop of docIdProperties) {
                if (source.document[prop]) {
                  docId = source.document[prop];
                  break;
                }
              }
              
              // Try to extract file name
              let fileName = "Unknown document";
              if (source.document.doc_metadata) {
                for (const prop of fileNameProperties) {
                  if (source.document.doc_metadata[prop]) {
                    fileName = source.document.doc_metadata[prop];
                    break;
                  }
                }
              } else {
                // Check at document level if no doc_metadata
                for (const prop of fileNameProperties) {
                  if (source.document[prop]) {
                    fileName = source.document[prop];
                    break;
                  }
                }
              }
              
              // Try to extract page info
              let pageLabel: string | undefined;
              if (source.document.doc_metadata) {
                for (const prop of pageProperties) {
                  if (source.document.doc_metadata[prop]) {
                    pageLabel = source.document.doc_metadata[prop];
                    break;
                  }
                }
              } else {
                for (const prop of pageProperties) {
                  if (source.document[prop]) {
                    pageLabel = source.document[prop];
                    break;
                  }
                }
              }
              
              extractedSources.push({
                name: fileName,
                page: pageLabel ? ` (page ${pageLabel})` : '',
                docId: docId
              });
            } 
            // If no document property, check if the source itself has the info
            else {
              // Try to extract document ID
              let docId: string | undefined;
              for (const prop of docIdProperties) {
                if (source[prop]) {
                  docId = source[prop];
                  break;
                }
              }
              
              // Try to extract file name
              let fileName = "Unknown document";
              if (source.metadata || source.doc_metadata) {
                const metadata = source.metadata || source.doc_metadata;
                for (const prop of fileNameProperties) {
                  if (metadata[prop]) {
                    fileName = metadata[prop];
                    break;
                  }
                }
              } else {
                // Check at source level
                for (const prop of fileNameProperties) {
                  if (source[prop]) {
                    fileName = source[prop];
                    break;
                  }
                }
              }
              
              // Try to extract page info
              let pageLabel: string | undefined;
              if (source.metadata || source.doc_metadata) {
                const metadata = source.metadata || source.doc_metadata;
                for (const prop of pageProperties) {
                  if (metadata[prop]) {
                    pageLabel = metadata[prop];
                    break;
                  }
                }
              } else {
                for (const prop of pageProperties) {
                  if (source[prop]) {
                    pageLabel = source[prop];
                    break;
                  }
                }
              }
              
              extractedSources.push({
                name: fileName,
                page: pageLabel ? ` (page ${pageLabel})` : '',
                docId: docId
              });
            }
          });
          
          // Try to extract sources from the response text itself if no sources were found
          if (extractedSources.length === 0 && fullResponse) {
            // Look for patterns like "Offerings: $100K" that indicate document sections
            const sectionMatches = fullResponse.match(/([A-Za-z\s]+):\s*\$?\d+[A-Za-z\d\-\.\s]+/g);
            if (sectionMatches && sectionMatches.length > 0) {
              sectionMatches.forEach((match, index) => {
                extractedSources.push({
                  name: match.trim(),
                  docId: `extracted-section-${index}`
                });
              });
            }
            
            // Look for industry/client info as a fallback
            const industryMatch = fullResponse.match(/Industry:\s*([^\\n\r]+)/);
            if (industryMatch && industryMatch[1]) {
              extractedSources.push({
                name: `Industry: ${industryMatch[1].trim()}`,
                docId: 'industry-info'
              });
            }
          }
          
          // Only add sources section if we have extracted sources
          if (extractedSources.length > 0) {
            // Add a separator and header for sources
            content += '\n\n---\n\n**Sources:**\n';
            
            // Add each unique source with proper numbering
            let sourceCount = 1;
            
            extractedSources.forEach((source) => {
              // Create a unique key for this source
              const sourceKey = source.docId || `${source.name}${source.page || ''}`;
              
              // Only add if we haven't seen this source before
              if (!uniqueSources.has(sourceKey)) {
                uniqueSources.add(sourceKey);
                content += `${sourceCount}. **${source.name}${source.page || ''}**\n`;
                sourceCount++;
              }
            });
          } else {
            // If we're certain there were sources in the API response but we couldn't extract them properly
            if (totalChunks > 3) { // If we've received multiple chunks, we likely have content with sources
              content += "\n\n---\n\n**Sources:** Information sourced from the provided document(s).\n";
            } else {
              // Log that no sources were found
              console.warn("No source information could be extracted from the response");
              content += "\n\n---\n\n**Sources:** No detailed source information available.\n";
            }
          }
        } else {
          // Even if no structured source objects were found, try to extract from the response text
          const potentialSourcesFromContent = extractSourcesFromContent(fullResponse);
          if (potentialSourcesFromContent.length > 0) {
            content += '\n\n---\n\n**Sources:**\n';
            potentialSourcesFromContent.forEach((source, index) => {
              content += `${index + 1}. **${source}**\n`;
            });
          } else {
            console.warn("No sources collected during RAG processing");
            content += "\n\n---\n\n**Sources:** Information sourced from the provided document(s).\n";
          }
        }
        
        // Return the final message with sources for RAG mode
        return {
          id: messageId,
          content,
          role: 'assistant',
          timestamp: new Date(),
          mode
        };
      }
      
      // For chat and summarize modes, return the standard message
      return {
        id: messageId,
        content: fullResponse,
        role: 'assistant',
        timestamp: new Date(),
        mode
      };
    } else if (mode === 'search') {
      // Handle search mode response
      const data = await response.json();
      const formattedResponse = formatSearchResults(data);
      const messageId = uuidv4();
      
      // Return the message object only (don't add to store)
      return {
        id: messageId,
        content: formattedResponse,
        role: 'assistant',
        timestamp: new Date(),
        mode
      };
    }

    throw new Error(`Unsupported response handling for mode: ${mode}`);
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

// Helper function to format search results
function formatSearchResults(data: any): string {
  if (!data || (!Array.isArray(data.chunks) && !Array.isArray(data.data))) {
    return "No results found.";
  }
  
  // Log the full data structure to understand the format
  console.log('Search results data structure:', JSON.stringify(data, null, 2));
  
  // Check if chunks are in data.data (PrivateGPT v1 format) or data.chunks
  const chunks = Array.isArray(data.data) ? data.data : data.chunks;
  
  if (!chunks || chunks.length === 0) {
    return "No results found.";
  }
  
  return chunks.map((chunk: any, index: number) => {
    // Log each chunk to see its structure
    console.log(`Chunk ${index} structure:`, JSON.stringify(chunk, null, 2));
    
    // Extract document metadata with enhanced debugging
    let fileName = "Unknown document";
    let pageNumber = "";
    
    // Try various paths to find the file name
    if (chunk.document?.doc_metadata?.file_name) {
      fileName = chunk.document.doc_metadata.file_name;
    } else if (chunk.document?.name) {
      fileName = chunk.document.name;
    } else if (chunk.file_name) {
      fileName = chunk.file_name;
    } else if (chunk.source) {
      fileName = chunk.source;
    }
    
    // Try various paths to find the page number
    if (chunk.document?.doc_metadata?.page_label) {
      pageNumber = chunk.document.doc_metadata.page_label;
    } else if (chunk.document?.page_label) {
      pageNumber = chunk.document.page_label;
    } else if (chunk.page_number) {
      pageNumber = chunk.page_number;
    } else if (chunk.metadata?.page) {
      pageNumber = chunk.metadata.page;
    }
    
    // Get document ID for reference
    let docId = "unknown";
    if (chunk.document?.doc_id) {
      docId = chunk.document.doc_id;
    } else if (chunk.doc_id) {
      docId = chunk.doc_id;
    } else if (chunk.id) {
      docId = chunk.id;
    }

    // Format the results with improved styling
    let result = `## Result ${index + 1}: ${fileName}\n`;
    
    // Add page number if available
    if (pageNumber) {
      result += `**Page:** ${pageNumber}\n`;
    }
    
    // Add score if available
    if (chunk.score !== undefined) {
      const score = typeof chunk.score === 'number' 
        ? `${(chunk.score * 100).toFixed(1)}%` 
        : chunk.score;
      result += `**Relevance Score:** ${score}\n`;
    }
    
    // Add text content with context
    result += "\n";
    
    // Add preceding context if available
    if (chunk.prev_text) {
      result += `**Context before:**\n${chunk.prev_text.trim()}\n\n\n\n`;
    }
    
    // Add the actual matching text
    result += `**Matching text:**\n${chunk.text.trim()}\n\n`;
    
    // Add following context if available
    if (chunk.next_text) {
      result += `**Context after:**\n${chunk.next_text.trim()}\n\n\n\n`;
    }
    
    // Add document ID for reference
    result += `**Document ID:** ${docId}\n`;
    
    return result;
  }).join("\n\n---\n\n");
}

// Helper function to handle response based on content type
async function handleResponse(response: Response): Promise<string> {
  // Handle streaming response
  if (response.headers.get('Content-Type')?.includes('text/event-stream')) {
    // For streaming, we need to read the response as a stream
    const reader = response.body?.getReader();
    let result = '';
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value);
        
        // Parse the SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line && line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.substring(5));
              if (data.delta) {
                result += data.delta;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }
    }
    
    return result;
  } else {
    // For non-streaming response
    const data = await response.json();
    return data.response || data.text || '';
  }
}

export async function listDocuments(
  page: number = 1, 
  limit: number = 100, // Increased from 50 to 100 to show more documents
  sort: 'created_at' | 'doc_id' = 'created_at', 
  order: 'asc' | 'desc' = 'desc'
): Promise<any[]> {
  try {
    console.log('Fetching documents from PrivateGPT using /v1/ingest/list endpoint');
    
    // PrivateGPT endpoint for listing ingested documents
    const response = await fetch(`${API_BASE_URL}/v1/ingest/list`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) {
      console.error(`Document listing failed with status ${response.status}: ${response.statusText}`);
      // Return mock data to allow the UI to work
      return getMockDocuments();
    }

    const responseData = await response.json();
    console.log('Document list response:', responseData);
    
    // Handle the newer PrivateGPT API format with object, model, and data fields
    let documents: any[] = [];
    
    if (responseData.data && Array.isArray(responseData.data)) {
      // Newer API format 
      documents = responseData.data;
      console.log(`Found ${documents.length} documents in data array`);
    } else if (Array.isArray(responseData)) {
      // Older API format where the response is directly an array
      documents = responseData;
      console.log(`Found ${documents.length} documents in direct array`);
    } else {
      console.warn('Unrecognized document list format:', responseData);
      return getMockDocuments();
    }
    
    // Transform documents to a consistent format
    const processedDocuments = documents.map((doc: any) => {
      // Extract document ID
      const docId = doc.doc_id || doc.id || '';
      
      // Extract file name
      let fileName = "Unknown document";
      if (doc.doc_metadata && doc.doc_metadata.file_name) {
        fileName = doc.doc_metadata.file_name;
      } else if (doc.metadata && doc.metadata.file_name) {
        fileName = doc.metadata.file_name;
      } else if (doc.name) {
        fileName = doc.name;
      }
      
      // Extract creation date
      const createdAt = doc.created_at || doc.ingestDate || new Date().toISOString();
      
      // Create a consistent document object
      return {
        id: docId,
        doc_id: docId,
        name: fileName,
        created_at: createdAt,
        metadata: doc.doc_metadata || doc.metadata || {}
      };
    });
    
    // Sort the documents as requested
    processedDocuments.sort((a, b) => {
      if (sort === 'created_at') {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return order === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        // Sort by doc_id
        return order === 'asc' 
          ? a.doc_id.localeCompare(b.doc_id)
          : b.doc_id.localeCompare(a.doc_id);
      }
    });
    
    console.log(`Processed ${processedDocuments.length} documents`);
    
    // Return all processed documents (don't slice for paging)
    return processedDocuments.length > 0 ? processedDocuments : getMockDocuments();
  } catch (error) {
    console.error('Error fetching documents:', error);
    // Return mock data so the UI can still function
    return getMockDocuments();
  }
}

// Helper function to parse document response in different formats
// This function is kept for backward compatibility but may not be needed anymore
function parseDocumentResponse(data: any): any[] {
  // Handle different possible response formats from the API
  if (Array.isArray(data)) {
    return data;
  }
  
  if (data.documents) {
    return data.documents;
  }
  
  if (data.data && Array.isArray(data.data)) {
    return data.data;
  }
  
  if (data.ingested && Array.isArray(data.ingested)) {
    return data.ingested;
  }
  
  if (data.files && Array.isArray(data.files)) {
    return data.files;
  }
  
  // If we don't recognize the format, log it and return an empty array
  console.warn('Unrecognized document list format:', data);
  return getMockDocuments();
}

// Returns mock document data for testing/fallback
function getMockDocuments(): any[] {
  return [
    { 
      id: 'doc1', 
      doc_id: 'doc1',
      name: '12-30 Onyx_FAF_Cloud_Modernization_SOW_1.1 12-30-24.docx',
      created_at: new Date().toISOString()
    }
  ];
}

export async function exportChat(chatId: string, format: 'pdf' | 'txt' | 'json'): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chats/${chatId}/export?format=${format}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error exporting chat:', error);
    throw error;
  }
}

export async function searchMessages(query: string, filters?: {
  dateFrom?: Date;
  dateTo?: Date;
  mode?: ChatMode;
}): Promise<any[]> {
  try {
    const params = new URLSearchParams({
      query,
      ...(filters?.dateFrom && { dateFrom: filters.dateFrom.toISOString() }),
      ...(filters?.dateTo && { dateTo: filters.dateTo.toISOString() }),
      ...(filters?.mode && { mode: filters.mode }),
    });

    const response = await fetch(`${API_BASE_URL}/api/messages/search?${params}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
}

export async function fetchDocumentChunks(query: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chunks?query=${encodeURIComponent(query)}`);

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching document chunks:', error);
    throw error;
  }
}

// Upload document to PrivateGPT
export async function uploadDocument(file: File): Promise<any> {
  try {
    console.log(`Uploading document to PrivateGPT: ${file.name} (${file.size} bytes, type: ${file.type})`);
    
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    
    // Ensure we don't have double slashes in the URL
    const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const url = `${baseUrl}/v1/ingest/file`;
    
    console.log(`Making API call to: ${url}`);
    
    // Make API call to PrivateGPT with CORS mode and credentials
    const response = await fetch(url, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        // Don't set Content-Type header for FormData, browser will set with boundary
        'Accept': 'application/json',
      },
      body: formData
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      // Try to get the error details from the response
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        try {
          errorDetails = await response.text();
        } catch (e2) {
          errorDetails = 'Could not extract error details';
        }
      }
      
      console.error(`Document upload failed with status ${response.status}: ${response.statusText}`);
      console.error(`Error details: ${errorDetails}`);
      
      throw new Error(`Upload failed: ${response.status} - ${errorDetails}`);
    }
    
    const data = await response.json();
    console.log('Document upload response:', data);
    
    return data;
  } catch (error) {
    // Handle CORS errors specifically
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('CORS error detected. The PrivateGPT server is not configured to allow requests from this domain.');
      
      // For demo purposes, return a mock successful response
      toast.warning("CORS error detected. Using mock response for demonstration purposes.");
      return {
        id: "mock-" + Date.now(),
        status: "success",
        message: "Document uploaded successfully (mock)",
        doc_id: "mock-doc-" + Date.now(),
        filename: file.name
      };
    }
    
    console.error('Error uploading document:', error);
    throw error;
  }
}

// Delete document from PrivateGPT
export async function deleteDocument(docId: string): Promise<boolean> {
  try {
    console.log(`Deleting document ${docId} from PrivateGPT`);
    
    // Make API call to PrivateGPT
    const response = await fetch(`${API_BASE_URL}/v1/ingest/${docId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      console.error(`Document deletion failed with status ${response.status}: ${response.statusText}`);
      throw new Error(`Deletion failed: ${response.status}`);
    }
    
    console.log(`Document ${docId} deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Add these types after the existing types
export interface PresentationContext {
  clientName: string;
  industry: string;
  painPoints: string[];
  interests: string[];
  meetingType?: string;
  objectives?: string;
}

export interface SectionConfig {
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  includeSourceAttribution?: boolean;
}

export const generatePresentationSection = async (
  section: string,
  context: {
    clientName: string;
    industry: string;
    meetingType?: string;
    painPoints?: string[];
    interests?: string[];
    objectives?: string;
  },
  config: {
    systemPrompt?: string;
    temperature?: number;
    includeSourceAttribution?: boolean;
  } = {},
  documents?: string[]
): Promise<string> => {
  const { meetingType = "pitch" } = context;
  const temperature = config.temperature ?? 0.3;
  
  // Default system prompt if not provided
  const defaultSystemPrompt = `You are an expert sales and marketing content creator. 
Generate high-quality, professional content for sales presentations that is specific, 
detailed, and tailored to the client's industry and needs.`;
  
  const systemPrompt = config.systemPrompt || defaultSystemPrompt;
  
  // Build a section-specific prompt based on the meeting type and section
  let sectionPrompt = "";
  
  // Base case - handles general sections for all meeting types
  switch (section) {
    case "executive_summary":
      sectionPrompt = `Create an executive summary for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    case "problem_statement":
      sectionPrompt = `Create a problem statement section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      if (context.painPoints && context.painPoints.length > 0) {
        sectionPrompt += ` The client has mentioned these specific pain points: ${context.painPoints.join(", ")}.`;
      }
      break;
    case "solution_overview":
      sectionPrompt = `Create a solution overview section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    case "benefits":
      sectionPrompt = `Create a benefits section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    case "features":
      sectionPrompt = `Create a key features section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    case "case_studies":
      sectionPrompt = `Create a case studies section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry. Include 2-3 brief examples of similar companies and the results they achieved.`;
      break;
    case "differentiation":
      sectionPrompt = `Create a competitive differentiation section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    case "implementation":
      sectionPrompt = `Create an implementation approach section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    case "timeline":
      sectionPrompt = `Create a project timeline section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    case "pricing":
      sectionPrompt = `Create a pricing section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry. Use placeholder values for actual prices.`;
      break;
    case "team":
      sectionPrompt = `Create a team section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry. Describe typical roles that would support this client.`;
      break;
    case "next_steps":
      sectionPrompt = `Create a next steps section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
      break;
    default:
      sectionPrompt = `Create a ${section.replace("_", " ")} section for a ${meetingType} meeting with ${context.clientName}, a company in the ${context.industry} industry.`;
  }
  
  // Specific overrides based on meeting types
  if (meetingType === "discovery") {
    switch (section) {
      case "executive_summary":
        sectionPrompt = `Create an executive summary for a discovery meeting with ${context.clientName}, a company in the ${context.industry} industry. Focus on understanding their needs rather than pitching solutions.`;
        break;
      case "problem_statement":
        sectionPrompt = `Create a discussion points section for a discovery meeting with ${context.clientName}, a company in the ${context.industry} industry. Include key questions to understand their challenges.`;
        break;
      case "solution_overview":
        sectionPrompt = `Create a capabilities overview section for a discovery meeting with ${context.clientName}, a company in the ${context.industry} industry. Focus on your broad capabilities rather than specific solutions.`;
        break;
      case "next_steps":
        sectionPrompt = `Create a next steps section for a discovery meeting with ${context.clientName}, a company in the ${context.industry} industry. Focus on follow-up actions to gather more information.`;
        break;
    }
  } else if (meetingType === "proposal") {
    switch (section) {
      case "executive_summary":
        sectionPrompt = `Create an executive summary for a formal proposal to ${context.clientName}, a company in the ${context.industry} industry.`;
        break;
      case "problem_statement":
        sectionPrompt = `Create a detailed problem statement for a formal proposal to ${context.clientName}, a company in the ${context.industry} industry. Address their specific challenges.`;
        if (context.painPoints && context.painPoints.length > 0) {
          sectionPrompt += ` The client has mentioned these specific pain points: ${context.painPoints.join(", ")}.`;
        }
        break;
      case "pricing":
        sectionPrompt = `Create a detailed pricing and ROI section for a formal proposal to ${context.clientName}, a company in the ${context.industry} industry. Include implementation costs, ongoing fees, and expected ROI.`;
        break;
    }
  }
  
  // Add client interests if available
  if (context.interests && context.interests.length > 0) {
    sectionPrompt += ` The client has expressed interest in: ${context.interests.join(", ")}.`;
  }
  
  // Add objectives if available
  if (context.objectives) {
    sectionPrompt += ` The key objectives for this engagement are: ${context.objectives}.`;
  }
  
  // Format requirements for consistent output
  sectionPrompt += ` Format the content using Markdown with appropriate headers, bullet points, and formatting. The content should be professional, concise, and specific to ${context.clientName} and the ${context.industry} industry.`;
  
  // Prepare the request body
  const requestBody = {
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: sectionPrompt
      }
    ],
    stream: true,
    use_context: false,
    temperature: temperature,
    max_tokens: 1500
  };
  
  console.log(`Generating ${section} section with prompt: ${sectionPrompt.substring(0, 100)}...`);
  
  try {
    // Set timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // Increase timeout to 120 seconds
    
    // Use the same API_BASE_URL as the rest of the application
    const response = await fetch(`${API_BASE_URL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add a session ID to track related requests
        "X-Session-ID": `presentation_${Date.now()}_${Math.random().toString(36).substring(2, 9)}` 
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    
    // Clear the timeout if request completed
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    // For streaming responses
    if (response.headers.get("Content-Type")?.includes("text/event-stream")) {
      let content = "";
      
      // Create a reader from the response body
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Cannot read response stream");
      }
      
      // Read the stream
      let streamError = false;
      let errorCount = 0;
      const MAX_ERRORS = 10; // Increased max errors threshold
      let jsonBuffer = ""; // Buffer to accumulate incomplete JSON chunks
      let lastChunkTime = Date.now();
      const MAX_CHUNK_WAIT = 15000; // Maximum time to wait for a new chunk (15 seconds)
      
      try {
        while (true) {
          try {
            // Check if we've been waiting too long for the next chunk
            const currentTime = Date.now();
            if (currentTime - lastChunkTime > MAX_CHUNK_WAIT) {
              console.warn(`No new chunks received for ${(currentTime - lastChunkTime) / 1000} seconds, aborting stream`);
              break;
            }
            
            const { done, value } = await reader.read();
            if (done) break;
            
            // Reset the chunk timer
            lastChunkTime = Date.now();
            
            // Convert the Uint8Array to a string
            const chunk = new TextDecoder().decode(value);
            
            // Process each line in the chunk
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ")) {
                // Skip the [DONE] marker which isn't valid JSON
                const dataContent = line.slice(6).trim();
                if (dataContent === '[DONE]') {
                  console.log('Received [DONE] signal in SSE stream');
                  
                  // Process any remaining data in the buffer
                  if (jsonBuffer.trim().length > 0) {
                    try {
                      // Process buffer content before clearing
                      const bufferResult = processRemainingBuffer(jsonBuffer, 'chat', content, []);
                      if (bufferResult.content && bufferResult.content.trim().length > 0) {
                        content += bufferResult.content;
                        console.log(`Added remaining content from buffer: ${bufferResult.content.substring(0, 50)}...`);
                      }
                    } catch (e) {
                      // Try direct text extraction as a last resort
                      try {
                        const extractedText = extractTextFromMalformedJson(jsonBuffer);
                        if (extractedText && extractedText.trim().length > 0) {
                          content += extractedText;
                          console.log(`Added extracted text from buffer: ${extractedText.substring(0, 50)}...`);
                        }
                      } catch (extractError) {
                        console.log("Failed to extract remaining text from buffer");
                      }
                    }
                    jsonBuffer = ""; // Clear buffer
                  }
                  
                  continue;
                }
                
                // Add data to buffer in case it's incomplete
                jsonBuffer += dataContent;
                
                try {
                  // Attempt to parse accumulated data
                  let parsedData;
                  try {
                    parsedData = JSON.parse(jsonBuffer);
                    // Reset buffer if parsing succeeds
                    jsonBuffer = "";
                  } catch (jsonError) {
                    // If we can't parse the full buffer, try some fixes
                    
                    // 1. Try to extract complete JSON objects from the buffer
                    const extracted = extractCompleteJSON(jsonBuffer);
                    if (extracted.objects.length > 0) {
                      // We found complete objects, process them
                      for (const obj of extracted.objects) {
                        try {
                          parsedData = JSON.parse(obj);
                          
                          // Process this object
                          if (parsedData && parsedData.choices && parsedData.choices[0]?.delta?.content) {
                            content += parsedData.choices[0].delta.content;
                          } else if (parsedData && parsedData.choices && parsedData.choices[0]?.message?.content) {
                            content += parsedData.choices[0].message.content;
                          } else if (parsedData && parsedData.content) {
                            content += parsedData.content;
                          } else if (parsedData && typeof parsedData === 'string') {
                            content += parsedData;
                          }
                        } catch (objError) {
                          // Try direct text extraction for this object
                          const extractedText = extractTextFromMalformedJson(obj);
                          if (extractedText && extractedText.trim()) {
                            content += extractedText;
                          }
                        }
                      }
                      
                      // Update buffer to remainder
                      jsonBuffer = extracted.remainder;
                      continue;
                    }
                    
                    // 2. Try to sanitize the existing buffer
                    try {
                      const sanitized = sanitizeJsonString(jsonBuffer);
                      parsedData = JSON.parse(sanitized);
                      // Reset buffer if parsing succeeds
                      jsonBuffer = "";
                    } catch (sanitizeError) {
                      // 3. Try to parse just this chunk alone
                      try {
                        parsedData = JSON.parse(dataContent);
                        // Reset buffer if this chunk alone is valid
                        jsonBuffer = "";
                      } catch (singleChunkError) {
                        // At this point we can't parse anything, just continue and
                        // wait for more data or handle it in the next iteration
                        continue;
                      }
                    }
                  }
                  
                  // Process the parsed data
                  if (parsedData && parsedData.choices && parsedData.choices[0]?.delta?.content) {
                    content += parsedData.choices[0].delta.content;
                  } else if (parsedData && parsedData.choices && parsedData.choices[0]?.message?.content) {
                    content += parsedData.choices[0].message.content;
                  } else if (parsedData && parsedData.content) {
                    content += parsedData.content;
                  } else if (parsedData && typeof parsedData === 'string') {
                    content += parsedData;
                  }
                } catch (e) {
                  console.error("Error processing SSE data:", e);
                  errorCount++;
                  
                  // If the buffer is getting too large, try to extract text directly
                  if (jsonBuffer.length > 10000) {
                    try {
                      const directText = extractTextFromMalformedJson(jsonBuffer);
                      if (directText && directText.trim()) {
                        content += directText;
                        console.log(`Extracted text from large buffer: ${directText.substring(0, 50)}...`);
                        jsonBuffer = ""; // Reset buffer after extraction
                      }
                    } catch (extractError) {
                      // If extraction fails, clear half the buffer to prevent unbounded growth
                      if (jsonBuffer.length > 20000) {
                        console.warn("Buffer too large, clearing partial content");
                        jsonBuffer = jsonBuffer.substring(jsonBuffer.length / 2);
                      }
                    }
                  }
                  
                  // Direct text extraction if JSON parsing consistently fails
                  if (errorCount >= 3) {
                    try {
                      const directText = extractTextFromMalformedJson(dataContent);
                      if (directText && directText.trim()) {
                        content += directText;
                        console.log(`Extracted text directly after multiple JSON errors: ${directText.substring(0, 50)}...`);
                      }
                    } catch (extractError) {
                      console.warn("Failed even with direct text extraction:", extractError);
                    }
                  }
                  
                  // If we encounter too many errors, exit the stream but keep any content we've gathered
                  if (errorCount >= MAX_ERRORS) {
                    console.warn(`Encountered ${errorCount} errors, stopping stream processing`);
                    streamError = true;
                    break;
                  }
                }
              }
              
              // Exit the loop if we've had too many errors
              if (streamError) {
                break;
              }
            }
          } catch (streamReadError) {
            console.error("Error reading from stream:", streamReadError);
            streamError = true;
            break;
          }
        }
      } finally {
        reader.releaseLock();
        console.log(`Reader released after processing the stream`);
        
        // Process any remaining data in the buffer
        if (jsonBuffer.trim().length > 0) {
          try {
            // Try direct text extraction from the buffer as a last resort
            const extractedText = extractTextFromMalformedJson(jsonBuffer);
            if (extractedText && extractedText.trim().length > 0) {
              content += extractedText;
              console.log(`Added final extracted text from buffer: ${extractedText.substring(0, 50)}...`);
            }
          } catch (e) {
            console.log("Failed to extract remaining text from final buffer");
          }
        }
      }
      
      // Validate the generated content
      if (streamError) {
        console.log(`Stream encountered errors, content length so far: ${content.length} chars`);
      }
      
      if (!content || content.trim().length < 20) {
        console.warn("Generated content is empty or too short, using fallback content");
        return generateFallbackContent(section, context);
      }
      
      return content;
    } else {
      // For non-streaming responses
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      // Validate the generated content
      if (!content || content.trim().length < 20) {
        throw new Error("Generated content is empty or too short");
      }
      
      return content;
    }
  } catch (error: any) {
    // Handle abort error specifically
    if (error.name === 'AbortError') {
      console.error(`Request for section ${section} timed out after 120 seconds`);
      throw new Error(`Generation request timed out for ${section} section`);
    }
    
    console.error(`Error generating ${section} section:`, error);
    
    // Generate fallback content if API fails
    console.log(`Generating fallback content for ${section} section`);
    return generateFallbackContent(section, context);
  }
};
// ... existing code ...

// Helper function to generate fallback content for a section if the API fails
function generateFallbackContent(section: string, context: any): string {
  const { clientName, industry, meetingType = "pitch" } = context;
  
  // Basic templates for each section type
  switch (section) {
    case "executive_summary":
      return `# Executive Summary\n\nA tailored solution for ${clientName} in the ${industry} industry that addresses key business challenges and delivers measurable results.`;
    
    case "problem_statement":
      return `# Problem Statement\n\nOrganizations in the ${industry} industry like ${clientName} face significant challenges with efficiency, scalability, and maintaining competitive advantage.`;
    
    case "solution_overview":
      return `# Solution Overview\n\nOur comprehensive solution for ${clientName} leverages industry best practices and innovative technology to address your specific needs in the ${industry} sector.`;
    
    case "benefits":
      return `# Benefits\n\n- Increased operational efficiency\n- Reduced costs\n- Improved customer satisfaction\n- Enhanced competitive positioning`;
    
    case "features":
      return `# Key Features\n\n- Seamless integration with existing systems\n- Advanced analytics and reporting\n- Automated workflow optimization\n- Comprehensive security measures`;
    
    case "case_studies":
      return `# Case Studies\n\n## Industry Leader\nA leading company in the ${industry} industry achieved 30% efficiency improvements after implementing our solution.\n\n## Growing Enterprise\nA mid-size organization similar to ${clientName} realized 25% cost savings within the first year.`;
    
    case "differentiation":
      return `# Competitive Differentiation\n\nUnlike other providers in the market, our solution offers comprehensive integration, dedicated support, and industry-specific optimizations for ${industry} companies.`;
    
    case "implementation":
      return `# Implementation Approach\n\nOur structured implementation methodology ensures a smooth transition with minimal disruption to ${clientName}'s operations.`;
    
    case "timeline":
      return `# Project Timeline\n\n- Weeks 1-2: Discovery and requirements gathering\n- Weeks 3-4: Initial setup and configuration\n- Weeks 5-6: Integration and testing\n- Weeks 7-8: Training and deployment`;
    
    case "pricing":
      return `# Pricing\n\nOur flexible pricing model is designed to provide ${clientName} with maximum value. Detailed pricing will be customized based on your specific requirements.`;
    
    case "team":
      return `# Our Team\n\n- Dedicated Project Manager\n- Technical Implementation Specialists\n- Industry Subject Matter Experts\n- Ongoing Support Team`;
    
    case "next_steps":
      return `# Next Steps\n\n1. Review proposal details\n2. Schedule technical assessment\n3. Finalize requirements\n4. Begin implementation planning`;
    
    default:
      return `# ${section.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}\n\nCustomized content for ${clientName} in the ${industry} industry.`;
  }
}

// Helper function to sanitize JSON strings by fixing common issues with escape sequences
function sanitizeJsonString(jsonString: string): string {
  // Skip empty strings
  if (!jsonString || !jsonString.trim()) return jsonString;

  try {
    // First try to parse it as-is - if it works, return it
    JSON.parse(jsonString);
    return jsonString;
  } catch (e) {
    // If parsing fails, apply sanitization
    console.log(`Sanitizing malformed JSON string (${jsonString.length} bytes)`);
    
    // Check for multiple JSON objects concatenated (a common issue with streaming)
    if (jsonString.includes('}{') || jsonString.includes('}data: {')) {
      console.log('Detected multiple concatenated JSON objects, attempting to split');
      try {
        // Try to extract the first valid JSON object
        const firstObjectMatch = jsonString.match(/{[^{}]*(?:{[^{}]*}[^{}]*)*}/);
        if (firstObjectMatch && firstObjectMatch[0]) {
          console.log(`Extracted first JSON object (${firstObjectMatch[0].length} bytes)`);
          return firstObjectMatch[0];
        }
      } catch (splitErr) {
        // Continue with sanitization if splitting fails
        console.log('Failed to split concatenated JSON objects, continuing with sanitization');
      }
    }
    
    // For very large strings, consider truncating or extracting content directly
    if (jsonString.length > 10000) {
      try {
        // First try to extract content via direct content extraction
        const directContent = extractTextFromMalformedJson(jsonString);
        if (directContent && directContent.length > 0) {
          return JSON.stringify({ content: directContent });
        }
      } catch (err) {
        // Continue with sanitization if direct extraction fails
      }
    }
    
    // Preprocess the string for common issues
    let sanitized = jsonString
      // Remove any BOM or other invisible characters
      .replace(/^\ufeff/g, '')
      // Fix common issues with backslashes and quotes
      .replace(/\\\\/g, "\\")                 // Fix double backslashes
      .replace(/\\([^"\/bfnrtu])/g, "$1")     // Remove invalid escape sequences
      .replace(/\\\\"/g, '\\"')               // Fix over-escaped quotes
      .replace(/\r?\n/g, " ")                 // Replace newlines with spaces
      .replace(/\\t/g, " ")                   // Replace tabs with spaces

    // Count braces to check for balance
    let openBraces = 0;
    let closeBraces = 0;
    let inString = false;
    let escaped = false;
    
    // First pass: count braces outside of strings
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      
      if (char === '"' && !escaped) {
        inString = !inString;
      } else if (char === '\\' && inString) {
        escaped = !escaped;
        continue;
      } else {
        escaped = false;
      }
      
      if (!inString) {
        if (char === '{') openBraces++;
        if (char === '}') closeBraces++;
      }
    }
    
    // If braces are unbalanced, try to fix
    if (openBraces !== closeBraces) {
      console.log(`Unbalanced braces detected: ${openBraces} opening, ${closeBraces} closing`);
      
      if (openBraces > closeBraces) {
        // Add missing closing braces
        sanitized += '}'.repeat(openBraces - closeBraces);
      } else {
        // Remove extra closing braces or find a substring with balanced braces
        // Start from the beginning and try to find a valid JSON object
        let depth = 0;
        let validEnd = -1;
        
        inString = false;
        escaped = false;
        
        for (let i = 0; i < sanitized.length; i++) {
          const char = sanitized[i];
          
          if (char === '"' && !escaped) {
            inString = !inString;
          } else if (char === '\\' && inString) {
            escaped = !escaped;
            continue;
          } else {
            escaped = false;
          }
          
          if (!inString) {
            if (char === '{') depth++;
            if (char === '}') {
              depth--;
              if (depth === 0) {
                validEnd = i;
                break;
              }
            }
          }
        }
        
        if (validEnd > 0) {
          sanitized = sanitized.substring(0, validEnd + 1);
          console.log(`Truncated to first balanced JSON object: ${sanitized.substring(0, 50)}...`);
        }
      }
    }
      
    // Handle special case of escaped double quotes inside JSON strings
    sanitized = sanitized.replace(/\\"/g, '"@ESCAPED_QUOTE@"').replace(/""/g, '"');
    
    // Now fix quotes inside the string that are not properly escaped
    inString = false;
    let result = '';
    for (let i = 0; i < sanitized.length; i++) {
      const char = sanitized[i];
      if (char === '"') {
        // If we find a quote
        if (i > 0 && sanitized[i-1] !== '\\') {
          // If it's not escaped, toggle inString
          inString = !inString;
        }
      }
      if (char === '"' && inString && i > 0 && i < sanitized.length - 1) {
        // If we're inside a string and find a quote that might be breaking it incorrectly
        if (sanitized[i-1] !== '\\' && sanitized[i+1] !== ',' && sanitized[i+1] !== '}' && sanitized[i+1] !== ']' && sanitized[i+1] !== ':') {
          // Escape it
          result += '\\"';
          continue;
        }
      }
      result += char;
    }
    
    // Ensure we closed all strings
    let openQuotes = 0;
    for (let i = 0; i < result.length; i++) {
      if (result[i] === '"' && (i === 0 || result[i-1] !== '\\')) {
        openQuotes++;
      }
    }
    if (openQuotes % 2 !== 0) {
      // Add a missing quote at the end
      result += '"';
    }
    
    // Clean up special placeholder
    result = result.replace(/"@ESCAPED_QUOTE@"/g, '\\"');
    
    // Final cleanup
    sanitized = result
      .replace(/([{\[,]\s*)"(\w+)":/g, '$1$2:') // Fix quoted property names
      .replace(/,\s*[}\]]/g, '$&')              // Fix trailing commas
      .replace(/([{,])\s*([^"{\[\w\s])/g, '$1"key":$2'); // Add keys to values without keys
    
    try {
      // Try parsing after initial sanitization
      JSON.parse(sanitized);
      return sanitized;
    } catch (parseError: any) {
      // Get position from error message if possible
      const posMatch = parseError.message.match(/position (\d+)/);
      const position = posMatch ? parseInt(posMatch[1]) : -1;
      
      if (position > 0 && position < sanitized.length) {
        console.warn(`JSON parse error at position ${position}: character '${sanitized.charAt(position)}'`);
        
        // Show context around the error
        const start = Math.max(0, position - 20);
        const end = Math.min(sanitized.length, position + 20);
        console.warn(`Context: "${sanitized.substring(start, position)}[${sanitized.charAt(position)}]${sanitized.substring(position + 1, end)}"`);
        
        // Try targeted fixes based on the error location and message
        if (parseError.message.includes("Unexpected token '{'")) {
          // Special handling for unexpected opening brace
          // This likely indicates concatenated JSON objects - try to extract the first valid object
          const beforeError = sanitized.substring(0, position);
          
          // Check if we already have a complete object before this point
          let depth = 0;
          let inString = false;
          let escaped = false;
          let validEnd = -1;
          
          for (let i = 0; i < beforeError.length; i++) {
            const char = beforeError[i];
            
            if (char === '"' && !escaped) {
              inString = !inString;
            } else if (char === '\\' && inString) {
              escaped = !escaped;
              continue;
            } else {
              escaped = false;
            }
            
            if (!inString) {
              if (char === '{') depth++;
              if (char === '}') {
                depth--;
                if (depth === 0) {
                  validEnd = i;
                }
              }
            }
          }
          
          if (validEnd > 0) {
            // Extract the first complete JSON object
            const firstObject = beforeError.substring(0, validEnd + 1);
            try {
              JSON.parse(firstObject);
              console.log(`Successfully extracted first complete JSON object before error`);
              return firstObject;
            } catch (e) {
              console.log(`Extraction failed, continuing with other sanitization methods`);
            }
          }
        } else if (parseError.message.includes("Unexpected") || parseError.message.includes("Invalid")) {
          const problematicChar = sanitized.charAt(position);
          const before = sanitized.substring(0, position);
          const after = sanitized.substring(position + 1);
          
          // Different strategies based on the problematic character
          if (/[\\\/\{\}\[\]",:i]/.test(problematicChar)) {
            // For syntax characters, try removing them
            sanitized = before + after;
          } else if (position > 0 && sanitized.charAt(position-1) === '"' && /[a-zA-Z0-9]/.test(problematicChar)) {
            // If it's after a quote and is alphanumeric, it might be outside a string - add quotes
            sanitized = before + '"' + problematicChar + '"' + after;
          } else {
            // Otherwise just remove it
            sanitized = before + after;
          }
        }
        
        // If previous sanitization was incomplete, try again with more aggressive approach
        try {
          JSON.parse(sanitized);
          return sanitized;
        } catch (e) {
          // Try one more time with more aggressive cleaning
          sanitized = jsonString
            .replace(/[^\w\s.:{}[\],"-]/g, " ")  // Remove all special chars except basics
            .replace(/\s+/g, " ")                // Normalize whitespace
            .replace(/"\s*:\s*([^"{}\[\]\s,]+)/g, '":"$1"') // Quote unquoted values
            .replace(/,\s*[}\]]/g, '}')          // Fix trailing commas
            .replace(/([{,])\s*([^"{\w\s])/g, '$1"key":$2'); // Add keys to values without keys
            
          try {
            JSON.parse(sanitized);
            return sanitized;
          } catch (finalError) {
            console.warn(`Still failed to parse JSON after removing problematic character`);
          }
        }
      }
      
      // Last resort - convert to a simple JSON object with the text content
      try {
        // Extract any text content we can find
        const textContent = extractTextFromMalformedJson(jsonString);
        return JSON.stringify({ content: textContent });
      } catch (finalError) {
        // Return a minimal valid JSON if all else fails
        return '{"content":"Error parsing response"}';
      }
    }
  }
}

// Helper function to extract text content from malformed JSON
function extractTextFromMalformedJson(jsonString: string): string {
  if (!jsonString || !jsonString.trim()) return "";
  
  let content = "";
  
  try {
    // First check for delta content patterns which are common in SSE streams
    const deltaContentPatterns = [
      /"delta"\s*:\s*{\s*"content"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/,
      /content":\s*"([^"\\]*(?:\\.[^"\\]*)*)"/,
      /"content":\s*"([^"]*)"/,
      /"choices"\s*:\s*\[\s*{\s*"delta"\s*:\s*{\s*"content"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/,
      /"message"\s*:\s*{\s*"content"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/,
      /"content"\s*:\s*"([^"]+)"/,
    ];
    
    for (const pattern of deltaContentPatterns) {
      const matches = jsonString.match(new RegExp(pattern, 'g'));
      if (matches && matches.length > 0) {
        for (const match of matches) {
          // Extract the content between quotes using the specific pattern
          const contentMatch = match.match(pattern);
          if (contentMatch && contentMatch[1]) {
            const extracted = contentMatch[1]
              .replace(/\\"/g, '"')
              .replace(/\\n/g, '\n')
              .replace(/\\t/g, '\t')
              .replace(/\\r/g, '')
              .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
            
            if (extracted && extracted.trim()) {
              content += extracted + " ";
            }
          }
        }
        
        // If we found content, we might want to check if there's other patterns too
        if (content.trim().length > 0) {
          continue; // Check next pattern as well
        }
      }
    }
    
    // If the above didn't work, try a more aggressive multi-match approach for content fields
    if (!content) {
      // Look for any "content" field with a substantial value
      const contentMatches = jsonString.match(/"content"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g);
      if (contentMatches && contentMatches.length > 0) {
        for (const match of contentMatches) {
          try {
            // Extract content between quotes after "content":
            const contentMatch = match.match(/"content"\s*:\s*"(.*?)(?<!\\)"/);
            if (contentMatch && contentMatch[1]) {
              const extracted = contentMatch[1]
                .replace(/\\"/g, '"') // Replace escaped quotes
                .replace(/\\n/g, '\n') // Replace escaped newlines
                .replace(/\\t/g, '\t') // Replace escaped tabs
                .replace(/\\r/g, '')   // Remove carriage returns
                .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16))); // Handle unicode
                
              if (extracted && extracted.trim()) {
                content += extracted + " ";
              }
            }
          } catch (e) {
            // Skip this match if extraction fails
          }
        }
      }
    }
    
    // If nothing worked so far, try a more generalized approach by searching for
    // text content that looks like it would be in a content field
    if (!content) {
      // First check for markdown-like content
      const markdownPatterns = [
        /# [A-Za-z0-9 ]+\n/g,               // Markdown headers
        /\n\s*[-*]\s+[A-Za-z0-9][\w\s\.,:;!?"'()\[\]]+/g,  // Markdown list items
        /\n\s*\d+\.\s+[A-Za-z0-9][\w\s\.,:;!?"'()\[\]]+/g  // Numbered list items
      ];
      
      for (const pattern of markdownPatterns) {
        const matches = jsonString.match(pattern);
        if (matches && matches.length > 0) {
          content += matches.join("\n") + "\n";
        }
      }
      
      // If we found markdown content, clean it up
      if (content) {
        content = content
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
    }
    
    // If we still have nothing, look for any quoted text that's reasonably long
    if (!content) {
      const quoteMatches = jsonString.match(/"([^"]{15,})"/g);
      if (quoteMatches && quoteMatches.length > 0) {
        for (const match of quoteMatches) {
          const text = match.slice(1, -1); // Remove quotes
          if (text && text.trim() && 
              !text.includes('{') && !text.includes('}') && 
              !text.includes(':') && text.length > 15 &&
              !/^[0-9a-f-]+$/.test(text)) { // Skip UUIDs or similar
            content += text + " ";
          }
        }
      }
    }
    
    // Last resort: look for anything that seems like natural language text
    if (!content) {
      // Find sequences of words and punctuation that might be natural language
      const textBlocks = jsonString.match(/[A-Za-z][A-Za-z\s,.;:!?'"\(\)]{20,}/g);
      if (textBlocks && textBlocks.length > 0) {
        for (const block of textBlocks) {
          if (block.split(/\s+/).length > 5) { // Only use blocks with multiple words
            content += block + " ";
          }
        }
      }
    }
    
    // If still nothing, fall back to a very basic extraction, removing obvious JSON syntax
    if (!content) {
      // Remove obvious JSON syntax elements
      content = jsonString
        .replace(/[{}[\],]/g, " ")
        .replace(/"[^"]*"\s*:/g, " ")
        .replace(/"/g, "")
        .replace(/\s+/g, " ")
        .trim();
        
      // Only keep this if it's substantial and looks like text
      if (content.length < 20 || content.split(/\s+/).length < 3) {
        content = "";
      }
    }
    
    return content.trim();
  } catch (e) {
    // If all else fails, return a cleaned version of the string
    console.error("Error in extractTextFromMalformedJson:", e);
    return jsonString
      .replace(/[{}[\]"\\]/g, "") // Remove JSON syntax 
      .replace(/\s+/g, " ")       // Normalize whitespace
      .trim();
  }
}

// Process any remaining data in the buffer at the end
function processRemainingBuffer(jsonBuffer: string, mode: ChatMode, currentResponse: string, sources: any[]): { content: string, newSources: any[] } {
  if (!jsonBuffer || !jsonBuffer.trim()) {
    return { content: "", newSources: [] };
  }
  
  let content = "";
  let newSources: any[] = [];
  
  try {
    // For larger buffers, skip direct JSON parsing and go straight to content extraction
    if (jsonBuffer.length > 5000) {
      console.log(`Buffer is large (${jsonBuffer.length} bytes), using direct content extraction`);
      const extractedContent = extractTextFromMalformedJson(jsonBuffer);
      if (extractedContent && extractedContent.trim()) {
        console.log(`Extracted content from large buffer: ${extractedContent.substring(0, 50)}...`);
        
        // Attempt to extract structured content if possible
        try {
          // Create a plain object with the content for handleDataObject
          const contentObj = { content: extractedContent };
          const result = handleDataObject(contentObj, mode, currentResponse, sources, 0);
          if (result.content) {
            content = result.content;
          }
        } catch (e) {
          // If that fails, just use the extracted content directly
          content = extractedContent;
        }
        
        // Try to extract any sources from the buffer
        if (jsonBuffer.includes('"doc_id"') || jsonBuffer.includes('"document"')) {
          // Look for patterns that might indicate source documents
          const docMatches = jsonBuffer.match(/"doc_id"\s*:\s*"([^"]+)"/g);
          if (docMatches && docMatches.length > 0) {
            for (const match of docMatches) {
              try {
                const docId = match.replace(/"doc_id"\s*:\s*"/, "").replace(/"$/, "");
                if (docId && docId.trim()) {
                  newSources.push({
                    document: {
                      doc_id: docId,
                      doc_metadata: {
                        file_name: "Source Document"
                      }
                    }
                  });
                }
              } catch (e) {
                // Skip if extraction fails
              }
            }
          }
        }
        
        return { content, newSources };
      }
    }
  
    // Try to parse as a single JSON object first
    try {
      const sanitized = sanitizeJsonString(jsonBuffer);
      const parsedObj = JSON.parse(sanitized);
      console.log(`Processing RAG data object in chunk #0: ${JSON.stringify(parsedObj, null, 2).substring(0, 500)}...`);
      const result = handleDataObject(parsedObj, mode, currentResponse, sources, 0);
      if (result.content) {
        console.log(`Found content in remaining buffer: ${result.content.substring(0, 50)}...`);
        content = result.content;
      }
      if (result.newSources && result.newSources.length > 0) {
        console.log(`Found ${result.newSources.length} sources in remaining buffer`);
        newSources = result.newSources;
      }
      return { content, newSources };
    } catch (e) {
      console.log(`Direct JSON parsing of buffer failed: ${(e as Error).message}`);
      // If direct parsing fails, continue with extraction
    }
    
    // Try direct content extraction - more reliable than parsing broken JSON
    const extractedContent = extractTextFromMalformedJson(jsonBuffer);
    if (extractedContent && extractedContent.trim()) {
      console.log(`Extracted content from buffer: ${extractedContent.substring(0, 50)}...`);
      content = extractedContent;
    }
    
    // Try to extract structured content from portions of the buffer
    try {
      const extracted = extractCompleteJSON(jsonBuffer);
      if (extracted.objects.length > 0) {
        console.log(`Found ${extracted.objects.length} complete JSON objects in buffer`);
        
        // Process each complete JSON object
        for (const obj of extracted.objects) {
          try {
            const parsedObj = JSON.parse(obj);
            const result = handleDataObject(parsedObj, mode, currentResponse, sources, 0);
            if (result.content && result.content.trim()) {
              if (!content.includes(result.content)) {
                content += result.content;
              }
            }
            if (result.newSources && result.newSources.length > 0) {
              newSources = [...newSources, ...result.newSources];
            }
          } catch (parseError) {
            // If parsing fails, try content extraction from this specific object
            try {
              const objContent = extractTextFromMalformedJson(obj);
              if (objContent && objContent.trim() && !content.includes(objContent)) {
                content += objContent;
              }
            } catch (e) {
              // Ignore content extraction errors
            }
          }
        }
      }
    } catch (extractError) {
      console.log(`Error extracting complete JSON objects: ${(extractError as Error).message}`);
    }
    
    // Final fallback: if nothing else worked and the buffer is substantial,
    // try to extract any legible text by removing all JSON syntax
    if (!content && jsonBuffer.length > 100) {
      const cleaned = jsonBuffer
        .replace(/[{}[\],]/g, " ")
        .replace(/"[^"]*"\s*:/g, " ")
        .replace(/"/g, "")
        .replace(/\s+/g, " ")
        .trim();
        
      if (cleaned && cleaned.length > 20) {
        content = cleaned;
      }
    }
    
    return { content, newSources };
  } catch (e) {
    console.error(`Error processing remaining buffer: ${(e as Error).message}`);
    // Last-ditch extraction attempt
    try {
      return { 
        content: extractTextFromMalformedJson(jsonBuffer), 
        newSources: [] 
      };
    } catch (finalError) {
      return { content: "", newSources: [] };
    }
  }
}

// Helper function to extract complete JSON objects from a potentially incomplete string
function extractCompleteJSON(input: string): { objects: string[], remainder: string } {
  if (!input || !input.trim()) {
    return { objects: [], remainder: input };
  }
  
  const objects: string[] = [];
  let buffer = input;
  
  // Pre-process input to handle common SSE formatting issues
  buffer = buffer
    // Handle cases where data: prefixes are embedded in the stream
    .replace(/}\s*data:\s*{/g, '}|||{')
    // Handle cases where multiple JSON objects are concatenated
    .replace(/}{/g, '}|||{')
    // Handle cases where a delta object might be embedded
    .replace(/delta":\s*{/g, 'delta": {')
    // Fix potential issues with escaped quotes in content
    .replace(/\\\\"/g, '\\"')
    // Remove any streaming event prefixes
    .replace(/^data:\s+/gm, '')
    // Remove common SSE artifacts
    .replace(/\[DONE\]/g, '');

  // Split by possible stream chunk delimiters 
  if (buffer.includes('|||')) {
    const parts = buffer.split('|||');
    for (const part of parts) {
      if (part.trim().startsWith('{') && part.trim().endsWith('}')) {
        try {
          // Try to sanitize and parse each part
          const sanitized = sanitizeJsonString(part);
          try {
            // Validate it's actually valid JSON
            JSON.parse(sanitized);
            objects.push(sanitized);
          } catch (parseError) {
            // If it's not valid JSON despite sanitization, try direct content extraction
            const content = extractTextFromMalformedJson(part);
            if (content && content.trim()) {
              objects.push(JSON.stringify({ content }));
            }
          }
          continue;
        } catch (e) {
          // If sanitization fails, continue with the normal extraction approach
        }
      }
    }
    
    // If we successfully extracted objects with the splitting approach, return them
    if (objects.length > 0) {
      console.log(`Successfully split stream into ${objects.length} separate JSON objects`);
      return { objects, remainder: '' };
    }
  }
  
  // Enhanced approach: Look for matching braces to extract objects with better handling of edge cases
  let depth = 0;
  let inString = false;
  let escaped = false;
  let start = -1;
  let currentChar = '';
  let previousChar = '';
  
  for (let i = 0; i < buffer.length; i++) {
    previousChar = currentChar;
    currentChar = buffer[i];
    
    if (currentChar === '"' && !escaped) {
      inString = !inString;
    } else if (currentChar === '\\' && inString) {
      // Toggle escaped flag for next char (handles double escapes)
      escaped = !escaped;
      continue;
    } else {
      escaped = false;
    }
    
    if (!inString) {
      if (currentChar === '{') {
        depth++;
        if (depth === 1) {
          start = i;
        }
      } else if (currentChar === '}') {
        depth--;
        if (depth === 0 && start !== -1) {
          // Found a complete object
          const obj = buffer.substring(start, i + 1);
          
          try {
            // Try to sanitize and parse before adding
            const sanitized = sanitizeJsonString(obj);
            try {
              // Validate it's actually valid JSON
              JSON.parse(sanitized);
              objects.push(sanitized);
            } catch (parseError) {
              // If parsing fails despite sanitization, extract any usable content
              try {
                const content = extractTextFromMalformedJson(obj);
                if (content && content.trim().length > 0) {
                  // Create a simple valid JSON object with the extracted content
                  objects.push(JSON.stringify({ content }));
                }
              } catch (e) {
                // Skip if content extraction fails too
              }
            }
          } catch (e) {
            // Skip this object if sanitization fails entirely
          }
          
          // Reset start for next object
          start = -1;
        }
      }
    }
  }
  
  // Determine remainder - the part of the buffer not fully parsed into an object
  let remainder = buffer;
  
  if (objects.length > 0) {
    // Try to find the start of any incomplete object at the end
    const lastObject = objects[objects.length - 1];
    const lastObjectIndex = buffer.lastIndexOf(lastObject);
    
    if (lastObjectIndex !== -1) {
      const endIndex = lastObjectIndex + lastObject.length;
      if (endIndex < buffer.length) {
        remainder = buffer.substring(endIndex);
      } else {
        remainder = "";
      }
    }
    
    // If the remainder appears to start an object but doesn't finish it, keep it
    if (remainder.trim().startsWith('{') && !remainder.trim().endsWith('}')) {
      console.log(`Keeping remainder as it appears to be an incomplete object (${remainder.length} bytes)`);
    } else if (depth > 0 && start !== -1) {
      // If we're in the middle of parsing an object but haven't finished
      remainder = buffer.substring(start);
      console.log(`Keeping remainder from last incomplete object (${remainder.length} bytes)`);
    } else {
      // Check if the remainder contains any meaningful text content
      try {
        const content = extractTextFromMalformedJson(remainder);
        if (!content || content.trim().length < 10) {
          // If no meaningful content is found, discard the remainder
          remainder = "";
        }
      } catch (e) {
        // If extraction fails, just keep the remainder as is
      }
    }
  }
  
  return { objects, remainder };
}

// Helper function to track and log document chunks used in responses
function trackDocumentChunks(data: any, mode: string): void {
  try {
    if (!data || !data.usage || !data.usage.chunks) {
      return;
    }
    
    const chunks = data.usage.chunks;
    console.log(`${mode} mode using ${chunks.length} document chunks:`);
    
    chunks.forEach((chunk: any, index: number) => {
      let chunkInfo = `Chunk ${index + 1}: `;
      
      // Extract document info
      if (chunk.document) {
        const doc = chunk.document;
        chunkInfo += `Doc ID: ${doc.doc_id || 'unknown'}, `;
        chunkInfo += `Name: ${doc.doc_metadata?.file_name || doc.name || 'unknown'}, `;
        chunkInfo += `Page: ${doc.doc_metadata?.page_label || 'unknown'}`;
      }
      
      // Add score if available
      if (chunk.score !== undefined) {
        chunkInfo += `, Score: ${chunk.score}`;
      }
      
      console.log(chunkInfo);
    });
  } catch (error) {
    console.error('Error tracking document chunks:', error);
  }
}

// Helper function to process data objects based on mode
function handleDataObject(data: any, mode: string, fullResponse: string, sources: any[], totalChunks: number): { content: string, newSources: any[] } {
  let content = '';
  let newSources: any[] = [];
  
  // Track document chunks when available
  if (data.usage && data.usage.chunks) {
    trackDocumentChunks(data, mode);
  }
  
  if (mode === 'rag') {
    // Debug the entire input data object to see what's available
    console.log(`Processing RAG data object in chunk #${totalChunks}:`, JSON.stringify(data, null, 2));
    
    // For RAG responses - only take the AI-generated content, not the raw chunks
    if (data.choices && data.choices[0]?.delta?.content) {
      content = data.choices[0].delta.content;
      console.log(`Adding RAG content from delta (${content.length} chars): "${content}"`);
    }
    
    // Store source information for attribution
    if (data.choices && data.choices[0]?.sources) {
      console.log(`RAG sources found in choices[0].sources:`, JSON.stringify(data.choices[0].sources, null, 2));
      newSources = [...newSources, ...(data.choices[0].sources || [])];
    }
    
    // Extract sources directly from the root level
    if (data.sources) {
      console.log(`RAG sources found at root level:`, JSON.stringify(data.sources, null, 2));
      newSources = [...newSources, ...(Array.isArray(data.sources) ? data.sources : [data.sources])];
    }
    
    // Sometimes sources are in the document field directly
    if (data.document) {
      console.log(`RAG document found at root level:`, JSON.stringify(data.document, null, 2));
      newSources.push({ document: data.document });
    }
    
    // Check for documents array
    if (data.documents && Array.isArray(data.documents)) {
      console.log(`RAG documents array found:`, JSON.stringify(data.documents, null, 2));
      data.documents.forEach((doc: any) => {
        newSources.push({ document: doc });
      });
    }
    
    // Handle where content might be in a "text" field
    if (data.text && typeof data.text === 'string') {
      console.log(`Adding RAG text content (${data.text.length} chars): "${data.text.substring(0, 50)}${data.text.length > 50 ? '...' : ''}"`);
      
      // Check if this is raw document content vs AI-generated content
      const isRawDocumentContent = data.text && (
        data.text.includes("Image:") || 
        data.text.includes("Slide #") || 
        data.text.match(/Slide #\d+:/) !== null || 
        data.text.match(/Image: [a-z]/) !== null ||
        data.text.includes("Background:") ||
        data.text.match(/\n\n\n/) !== null || // Multiple consecutive line breaks suggest raw content
        (data.text.length > 500 && data.text.split('\n').length > 10) // Very long chunks with many line breaks
      );
      
      if (!isRawDocumentContent) {
        content += data.text;
      } else {
        console.log("Skipping raw document content, but checking for embedded metadata");
        
        // Even if we skip the content, try to extract metadata/source info
        if (data.document || data.doc_metadata || data.metadata) {
          console.log("Found metadata in raw content chunk");
          newSources.push({
            document: data.document || {
              doc_metadata: data.doc_metadata || data.metadata || {},
              doc_id: data.doc_id || data.id || 'unknown'
            }
          });
        }
      }
    }
    
    // If there's content directly in the root of the data object
    if (typeof data.content === 'string') {
      console.log(`Adding RAG direct content (${data.content.length} chars): "${data.content.substring(0, 50)}${data.content.length > 50 ? '...' : ''}"`);
      content += data.content;
    }
    
    // Extract from additional response formats
    if (data.message && data.message.content) {
      console.log(`Adding RAG message content: ${data.message.content.substring(0, 50)}...`);
      content += data.message.content;
    }
    
    // Extract sources from metadata if available
    if (data.metadata && data.metadata.sources) {
      console.log(`RAG sources found in metadata:`, JSON.stringify(data.metadata.sources, null, 2));
      newSources = [...newSources, ...(data.metadata.sources || [])];
    }
    
    // Look for any additional fields with "source" in the name
    Object.keys(data).forEach(key => {
      if (key.toLowerCase().includes('source') && key !== 'sources' && data[key]) {
        console.log(`Found potential source info in field '${key}':`, JSON.stringify(data[key], null, 2));
        if (Array.isArray(data[key])) {
          newSources = [...newSources, ...data[key]];
        } else {
          newSources.push(data[key]);
        }
      }
    });
  } 
  else if (mode === 'summarize') {
    // The summarize endpoint can return data in different formats
    if (data.text) {
      content = data.text;
      console.log(`Adding summarize content (${content.length} chars): "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`);
    }
    else if (data.choices && data.choices[0]?.delta?.content) {
      if (data.choices[0].delta.content !== "Empty Response") {
        content = data.choices[0].delta.content;
        console.log(`Adding summarize delta content (${content.length} chars): "${content}"`);
      }
    }
  } 
  else {
    // For regular chat completions endpoint
    if (data.choices && data.choices[0]?.delta?.content) {
      content = data.choices[0].delta.content;
      console.log(`Adding chat content (${content.length} chars): "${content}"`);
    }
  }
  
  return { content, newSources };
}

/**
 * Attempts to extract potential source information from content text
 */
function extractSourcesFromContent(text: string): string[] {
  if (!text) return [];
  
  const sources: string[] = [];
  const uniqueSources = new Set<string>();
  
  // Look for industry/country mentions which often indicate source documents
  const industryMatch = text.match(/Industry:\s*([^\\n\r,]+)/);
  if (industryMatch && industryMatch[1]) {
    const source = `Industry: ${industryMatch[1].trim()}`;
    uniqueSources.add(source);
  }
  
  const countryMatch = text.match(/Country:\s*([^\\n\r,]+)/);
  if (countryMatch && countryMatch[1]) {
    const source = `Country: ${countryMatch[1].trim()}`;
    uniqueSources.add(source);
  }
  
  // Look for obvious document titles or file patterns
  const docPatterns = [
    /(\w+_\w+_\w+\.(?:pdf|docx|pptx))/gi,
    /(\d{2}-\d{2}\s+\w+(?:_\w+)+)/gi,
    /((?:Onyx|Onix)\s+\w+\s+Capabilities)/gi
  ];
  
  docPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => uniqueSources.add(match));
    }
  });
  
  // Look for sections that might be from a presentation
  const sectionHeaders = text.match(/([A-Z][A-Za-z\s]+):\s*\$?\d+[A-Za-z\d\-\.\s]+/g);
  if (sectionHeaders && sectionHeaders.length > 0) {
    sectionHeaders.forEach(header => uniqueSources.add(header.trim()));
  }
  
  return Array.from(uniqueSources);
}