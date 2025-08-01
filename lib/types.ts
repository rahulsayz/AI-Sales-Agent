"use client";

export type ChatMode = 'rag' | 'chat' | 'summarize' | 'search';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  mode: ChatMode;
  reactions?: {
    liked?: boolean;
    saved?: boolean;
  };
  isEditing?: boolean;
  isEdited?: boolean;
  parentId?: string; // For threaded replies - references parent message ID
  threadCount?: number; // Count of replies in the thread
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  mode: ChatMode;
  createdAt: Date;
  updatedAt: Date;
  documents?: string[]; // Document IDs for RAG mode
  userId?: string; // User ID for authentication
  systemPrompt?: string; // System prompt for the chat
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  tertiary: string;
  background: string;
  foreground: string;
}

// Define the type for modes that support system prompts
export type SystemPromptMode = Exclude<ChatMode, 'search'>;

// Define the type for system prompts
export type SystemPrompts = Record<SystemPromptMode, string>;

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  bubbleStyle: 'modern' | 'classic' | 'minimal';
  codeTheme: 'github' | 'dracula' | 'solarized';
  defaultSystemPrompts: SystemPrompts;
  colorPalette?: ColorPalette;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  last_sign_in?: string;
}

// Add global window type extension
declare global {
  interface Window {
    store: any;
  }
}