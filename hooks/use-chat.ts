"use client";
  
import { useState } from 'react';
import { useStore } from '@/lib/store';
import { sendMessage } from '@/lib/api';
import { ChatMode } from '@/lib/types';

export function useChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    chats,
    activeChat,
    isTyping,
    createChat,
    addMessage,
    setIsTyping,
    updateChatMode,
  } = useStore();
  
  const currentChat = chats.find(chat => chat.id === activeChat);
  
  const sendUserMessage = async (content: string, mode?: ChatMode, parentId?: string) => {
    try {
      setError(null);
      
      // If no active chat or mode change requested, create a new chat
      let chatId = activeChat;
      if (!chatId || (mode && currentChat?.mode !== mode)) {
        chatId = createChat(mode || 'chat');
        if (mode && currentChat) {
          updateChatMode(chatId, mode);
        }
      }
      
      // Add user message immediately
      addMessage(chatId, content, 'user', parentId);
      
      // Set loading state with a small delay to ensure UI updates
      setIsLoading(true);
      setIsTyping(true);
      
      // Get the current chat with system prompt
      const chat = chats.find(c => c.id === chatId);
      const systemPrompt = chat?.systemPrompt;
      
      // Send to API
      const currentMode = mode || currentChat?.mode || 'chat';
      
      // Add a small artificial delay for better UX if response comes too quickly
      const loadingPromise = new Promise(r => setTimeout(r, 700));
      
      // Pass document IDs if in RAG mode and documents are selected
      const [response] = await Promise.all([
        sendMessage(
          content, 
          currentMode, 
          chatId,
          systemPrompt
        ),
        loadingPromise
      ]);
      
      // Add AI response, with the same parent ID if this is part of a thread
      addMessage(chatId, response.content, 'assistant', parentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error(err);
    } finally {
      // Ensure loading states are reset
      setIsLoading(false);
      setIsTyping(false);
    }
  };
  
  return {
    sendMessage: sendUserMessage,
    isLoading,
    error,
    currentChat,
    isTyping,
  };
}