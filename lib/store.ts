"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Chat, ChatMode, Message, UserPreferences, User, ColorPalette, SystemPrompts } from './types';
import { 
  Auth,
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider, db } from './firebase';
import { 
  doc, 
  setDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy,
  updateDoc,
  deleteDoc,
  getDoc,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

interface ChatState {
  chats: Chat[];
  activeChat: string | null;
  userPreferences: UserPreferences;
  isTyping: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setChats: (chats: Chat[]) => void;
  setActiveChat: (chatId: string) => void;
  createChat: (mode: ChatMode) => string;
  deleteChat: (chatId: string) => void;
  addMessage: (chatId: string, content: string, role: 'user' | 'assistant' | 'system', parentId?: string) => void;
  updateMessage: (chatId: string, messageId: string, content: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  toggleMessageReaction: (chatId: string, messageId: string, reactionType: 'liked' | 'saved') => void;
  toggleMessageEditing: (chatId: string, messageId: string, isEditing: boolean) => void;
  updateChatMode: (chatId: string, mode: ChatMode) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  updateChatDocuments: (chatId: string, documentIds: string[]) => void;
  updateChatSystemPrompt: (chatId: string, systemPrompt: string) => void;
  setIsTyping: (isTyping: boolean) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  clearChats: () => void;
  
  // Auth actions
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Data sync actions
  fetchUserChats: () => Promise<void>;
}

// Default system prompts
const DEFAULT_SYSTEM_PROMPTS: SystemPrompts = {
  rag: 'Answer based ONLY on the context provided from the documents.',
  chat: 'You are a helpful assistant.',
  summarize: 'Create a concise summary with key points.'
};

// Default color palette
const DEFAULT_COLOR_PALETTE: ColorPalette = {
  primary: '#f76361',
  secondary: '#884f83',
  tertiary: '#263b58',
  background: '#ffffff',
  foreground: '#1a1a1a'
};

// Create a store instance
export const useStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,
      isTyping: false,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      userPreferences: {
        theme: 'system',
        fontSize: 'medium',
        bubbleStyle: 'modern',
        codeTheme: 'github',
        defaultSystemPrompts: DEFAULT_SYSTEM_PROMPTS,
        colorPalette: DEFAULT_COLOR_PALETTE,
      },

      setChats: (chats) => set({ chats }),
      
      setActiveChat: (chatId) => set({ activeChat: chatId }),
      
      createChat: (mode) => {
        const id = uuidv4();
        const userId = get().user?.id;
        const defaultSystemPrompt = get().userPreferences.defaultSystemPrompts[mode as keyof typeof DEFAULT_SYSTEM_PROMPTS] || 
          DEFAULT_SYSTEM_PROMPTS[mode as keyof typeof DEFAULT_SYSTEM_PROMPTS] || 
          '';
        
        const newChat: Chat = {
          id,
          title: `New ${mode.charAt(0).toUpperCase() + mode.slice(1)} Chat`,
          messages: [],
          mode,
          createdAt: new Date(),
          updatedAt: new Date(),
          documents: [],
          userId,
          systemPrompt: defaultSystemPrompt,
        };
        
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: id,
        }));
        
        // If user is authenticated, save to Firestore
        if (userId && db) {
          const chatToSave = {
            ...newChat,
            messages: [],
            createdAt: newChat.createdAt.toISOString(),
            updatedAt: newChat.updatedAt.toISOString(),
          };
          
          setDoc(doc(db, 'chats', id), chatToSave)
            .catch(error => console.error('Error saving chat:', error));
        }
        
        return id;
      },
      
      deleteChat: (chatId) => {
        const userId = get().user?.id;
        
        // If user is authenticated, delete from Firestore
        if (userId && db) {
          // Delete chat document
          deleteDoc(doc(db, 'chats', chatId))
            .catch(error => console.error('Error deleting chat:', error));
            
          // Delete all messages for this chat
          getDocs(query(collection(db, 'messages'), where('chatId', '==', chatId)))
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                deleteDoc(doc.ref)
                  .catch(error => console.error('Error deleting message:', error));
              });
            })
            .catch(error => console.error('Error fetching messages to delete:', error));
        }
        
        set((state) => {
          const newChats = state.chats.filter((chat) => chat.id !== chatId);
          let newActiveChat = state.activeChat;
          
          if (state.activeChat === chatId) {
            newActiveChat = newChats.length > 0 ? newChats[0].id : null;
          }
          
          return {
            chats: newChats,
            activeChat: newActiveChat,
          };
        });
      },
      
      addMessage: (chatId, content, role, parentId) => {
        const userId = get().user?.id;
        const messageId = uuidv4();
        const message: Message = {
          id: messageId,
          content,
          role,
          timestamp: new Date(),
          mode: get().chats.find(chat => chat.id === chatId)?.mode || 'chat',
          reactions: { liked: false, saved: false },
          isEdited: false,
          ...(parentId ? { parentId } : {}),
        };
        
        set((state) => {
          // Find the chat to update
          const chatToUpdate = state.chats.find(chat => chat.id === chatId);
          
          if (!chatToUpdate) return state;
          
          // If this is a reply, increment the parent message's thread count
          let updatedMessages = [...chatToUpdate.messages];
          if (parentId) {
            updatedMessages = updatedMessages.map(msg => {
              if (msg.id === parentId) {
                return {
                  ...msg,
                  threadCount: (msg.threadCount || 0) + 1
                };
              }
              return msg;
            });
          }
          
          // Add the new message
          updatedMessages = [...updatedMessages, message];
          
          // Return the updated state with the new message added
          return {
            chats: state.chats.map((chat) => {
              if (chat.id === chatId) {
                const newTitle = chat.messages.length === 0 && role === 'user' 
                  ? content.slice(0, 30) + (content.length > 30 ? '...' : '')
                  : chat.title;
                  
                return {
                  ...chat,
                  messages: updatedMessages,
                  updatedAt: new Date(),
                  title: newTitle,
                };
              }
              return chat;
            }),
          };
        });
        
        // If user is authenticated, save message to Firestore
        if (userId && db) {
          // Save message
          const messageToSave = {
            ...message,
            timestamp: message.timestamp.toISOString(),
            chatId,
            userId,
          };
          
          // Remove undefined fields before saving to Firestore
          Object.keys(messageToSave).forEach(key => {
            if (messageToSave[key as keyof typeof messageToSave] === undefined) {
              delete messageToSave[key as keyof typeof messageToSave];
            }
          });
          
          setDoc(doc(db, 'messages', messageId), messageToSave)
            .catch(error => console.error('Error saving message:', error));
            
          // If this is a reply, update the parent message's thread count
          if (parentId) {
            const parentMessageRef = doc(db, 'messages', parentId);
            const parentMessage = get().chats.find(chat => chat.id === chatId)?.messages.find(msg => msg.id === parentId);
            
            if (parentMessage) {
              updateDoc(parentMessageRef, {
                threadCount: (parentMessage.threadCount || 0) + 1
              }).catch(error => console.error('Error updating parent message thread count:', error));
            }
          }
            
          // Update chat's updatedAt timestamp and title
          const chatRef = doc(db, 'chats', chatId);
          const chatTitle = get().chats.find(chat => chat.id === chatId)?.title;
          
          updateDoc(chatRef, { 
            updatedAt: new Date().toISOString(),
            title: chatTitle
          })
            .catch(error => console.error('Error updating chat:', error));
        }
      },
      
      updateMessage: (chatId, messageId, content) => {
        const userId = get().user?.id;
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map((message) => {
                  if (message.id === messageId) {
                    return {
                      ...message,
                      content,
                      isEdited: true,
                      isEditing: false,
                    };
                  }
                  return message;
                }),
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
        
        // If user is authenticated, update in Firestore
        if (userId && db) {
          const messageRef = doc(db, 'messages', messageId);
          
          updateDoc(messageRef, { 
            content,
            isEdited: true,
            isEditing: false,
            updatedAt: new Date().toISOString()
          })
            .catch(error => console.error('Error updating message:', error));
        }
      },
      
      deleteMessage: (chatId, messageId) => {
        const userId = get().user?.id;
        
        // If user is authenticated, delete from Firestore
        if (userId && db) {
          // Delete message document
          deleteDoc(doc(db, 'messages', messageId))
            .catch(error => console.error('Error deleting message:', error));
        }
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.filter((message) => message.id !== messageId),
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
      },
      
      toggleMessageReaction: (chatId, messageId, reactionType) => {
        const userId = get().user?.id;
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map((message) => {
                  if (message.id === messageId) {
                    const currentReactions = message.reactions || { liked: false, saved: false };
                    return {
                      ...message,
                      reactions: {
                        ...currentReactions,
                        [reactionType]: !currentReactions[reactionType]
                      },
                      updatedAt: new Date(),
                    };
                  }
                  return message;
                }),
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
        
        // If user is authenticated, update in Firestore
        if (userId && db) {
          const messageRef = doc(db, 'messages', messageId);
          const message = get().chats.find(chat => chat.id === chatId)?.messages.find(msg => msg.id === messageId);
          const currentReactions = message?.reactions || { liked: false, saved: false };
          
          updateDoc(messageRef, { 
            reactions: {
              ...currentReactions,
              [reactionType]: !currentReactions[reactionType]
            },
            updatedAt: new Date().toISOString()
          })
            .catch(error => console.error('Error updating message reaction:', error));
        }
      },
      
      toggleMessageEditing: (chatId, messageId, isEditing) => {
        const userId = get().user?.id;
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map((message) => {
                  if (message.id === messageId) {
                    return {
                      ...message,
                      isEditing,
                      updatedAt: new Date(),
                    };
                  }
                  return message;
                }),
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
        
        // If user is authenticated, update in Firestore
        if (userId && db) {
          const messageRef = doc(db, 'messages', messageId);
          
          updateDoc(messageRef, { 
            isEditing,
            updatedAt: new Date().toISOString()
          })
            .catch(error => console.error('Error updating message editing:', error));
        }
      },
      
      updateChatMode: (chatId, mode) => {
        const userId = get().user?.id;
        const defaultSystemPrompt = get().userPreferences.defaultSystemPrompts[mode as keyof typeof DEFAULT_SYSTEM_PROMPTS] || 
          DEFAULT_SYSTEM_PROMPTS[mode as keyof typeof DEFAULT_SYSTEM_PROMPTS] || 
          '';
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                mode,
                systemPrompt: defaultSystemPrompt,
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
        
        // If user is authenticated, update in Firestore
        if (userId && db) {
          const chatRef = doc(db, 'chats', chatId);
          
          updateDoc(chatRef, { 
            mode,
            systemPrompt: defaultSystemPrompt,
            updatedAt: new Date().toISOString()
          })
            .catch(error => console.error('Error updating chat mode:', error));
        }
      },
      
      updateChatTitle: (chatId, title) => {
        const userId = get().user?.id;
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                title,
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
        
        // If user is authenticated, update in Firestore
        if (userId && db) {
          const chatRef = doc(db, 'chats', chatId);
          
          updateDoc(chatRef, { 
            title,
            updatedAt: new Date().toISOString()
          })
            .catch(error => console.error('Error updating chat title:', error));
        }
      },
      
      updateChatDocuments: (chatId, documentIds) => {
        const userId = get().user?.id;
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                documents: documentIds,
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
        
        // If user is authenticated, update in Firestore
        if (userId && db) {
          const chatRef = doc(db, 'chats', chatId);
          
          updateDoc(chatRef, { 
            documents: documentIds,
            updatedAt: new Date().toISOString()
          })
            .catch(error => console.error('Error updating chat documents:', error));
        }
      },
      
      updateChatSystemPrompt: (chatId, systemPrompt) => {
        const userId = get().user?.id;
        
        set((state) => ({
          chats: state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                systemPrompt,
                updatedAt: new Date(),
              };
            }
            return chat;
          }),
        }));
        
        // If user is authenticated, update in Firestore
        if (userId && db) {
          const chatRef = doc(db, 'chats', chatId);
          
          updateDoc(chatRef, { 
            systemPrompt,
            updatedAt: new Date().toISOString()
          })
            .catch(error => console.error('Error updating chat system prompt:', error));
        }
      },
      
      setIsTyping: (isTyping) => set({ isTyping }),
      
      updateUserPreferences: (preferences) => {
        const userId = get().user?.id;
        
        set((state) => ({
          userPreferences: {
            ...state.userPreferences,
            ...preferences,
          },
        }));
        
        // Apply color palette if it's being updated
        if (preferences.colorPalette) {
          const root = document.documentElement;
          root.style.setProperty('--primary-color', preferences.colorPalette.primary);
          root.style.setProperty('--secondary-color', preferences.colorPalette.secondary);
          root.style.setProperty('--tertiary-color', preferences.colorPalette.tertiary);
        }
        
        // If user is authenticated, save preferences to Firestore
        if (userId && db) {
          const updatedPreferences = {
            ...get().userPreferences,
            ...preferences,
            userId,
          };
          
          setDoc(doc(db, 'user_preferences', userId), updatedPreferences, { merge: true })
            .catch(error => console.error('Error saving preferences:', error));
        }
      },
      
      clearChats: () => {
        const userId = get().user?.id;
        
        // If user is authenticated, delete all chats from Firestore
        if (userId && db) {
          // Get all user's chats
          getDocs(query(collection(db, 'chats'), where('userId', '==', userId)))
            .then(querySnapshot => {
              querySnapshot.forEach(document => {
                // Delete each chat
                deleteDoc(doc(db, 'chats', document.id))
                  .catch(error => console.error('Error deleting chat:', error));
                  
                // Delete all messages for this chat
                getDocs(query(collection(db, 'messages'), where('chatId', '==', document.id)))
                  .then(messagesSnapshot => {
                    messagesSnapshot.forEach(messageDoc => {
                      deleteDoc(messageDoc.ref)
                        .catch(error => console.error('Error deleting message:', error));
                    });
                  })
                  .catch(error => console.error('Error fetching messages to delete:', error));
              });
            })
            .catch(error => console.error('Error fetching chats to delete:', error));
        }
        
        set({ chats: [], activeChat: null });
      },
      
      setUser: (user) => {
        set({ 
          user,
          isAuthenticated: !!user,
          isLoading: false
        });
        
        // If user is set, fetch their chats
        if (user) {
          get().fetchUserChats();
        }
      },
      
      signIn: async (email, password) => {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || email.split('@')[0],
            avatar_url: firebaseUser.photoURL || undefined,
            created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
            last_sign_in: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          };
          
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Fetch user's chats
          await get().fetchUserChats();
        } catch (error) {
          console.error('Error signing in:', error);
          throw error;
        }
      },
      
      signUp: async (email, password, name) => {
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = userCredential.user;
          
          // Update profile with name if provided
          if (name && firebaseUser) {
            await updateProfile(firebaseUser, {
              displayName: name
            });
          }
          
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: name || email.split('@')[0],
            avatar_url: firebaseUser.photoURL || undefined,
            created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
            last_sign_in: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          };
          
          // Create user document in Firestore
          if (db) {
            await setDoc(doc(db, 'users', user.id), {
              email: user.email,
              name: user.name,
              avatar_url: user.avatar_url,
              created_at: user.created_at,
              updated_at: new Date().toISOString()
            });
            
            // Create default user preferences
            await setDoc(doc(db, 'user_preferences', user.id), {
              theme: 'system',
              fontSize: 'medium',
              bubbleStyle: 'modern',
              codeTheme: 'github',
              defaultSystemPrompts: DEFAULT_SYSTEM_PROMPTS,
              colorPalette: DEFAULT_COLOR_PALETTE,
              userId: user.id
            });
          }
          
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          console.error('Error signing up:', error);
          throw error;
        }
      },
      
      signInWithGoogle: async () => {
        try {
          const userCredential = await signInWithPopup(auth, googleProvider);
          const firebaseUser = userCredential.user;
          
          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            avatar_url: firebaseUser.photoURL || undefined,
            created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
            last_sign_in: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
          };
          
          if (db) {
            // Check if user document exists, if not create it
            const userDoc = await getDoc(doc(db, 'users', user.id));
            
            if (!userDoc.exists()) {
              // Create user document in Firestore
              await setDoc(doc(db, 'users', user.id), {
                email: user.email,
                name: user.name,
                avatar_url: user.avatar_url,
                created_at: user.created_at,
                updated_at: new Date().toISOString()
              });
              
              // Create default user preferences
              await setDoc(doc(db, 'user_preferences', user.id), {
                theme: 'system',
                fontSize: 'medium',
                bubbleStyle: 'modern',
                codeTheme: 'github',
                defaultSystemPrompts: DEFAULT_SYSTEM_PROMPTS,
                colorPalette: DEFAULT_COLOR_PALETTE,
                userId: user.id
              });
            }
          }
          
          set({ 
            user,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Fetch user's chats
          await get().fetchUserChats();
        } catch (error) {
          console.error('Error signing in with Google:', error);
          throw error;
        }
      },
      
      signOut: async () => {
        try {
          await firebaseSignOut(auth);
          
          set({ 
            user: null,
            isAuthenticated: false,
            chats: [],
            activeChat: null,
          });
        } catch (error) {
          console.error('Error signing out:', error);
          throw error;
        }
      },
      
      fetchUserChats: async () => {
        const userId = get().user?.id;
        if (!userId || !db) {
          console.log("fetchUserChats: No userId or db available");
          return;
        }
        
        try {
          set({ isLoading: true });
          
          console.log("Fetching chats for user:", userId);
          
          // Fetch user's chats from Firestore
          const chatsQuery = query(
            collection(db, 'chats'), 
            where('userId', '==', userId),
            orderBy('updatedAt', 'desc')
          );
          
          console.log("Chats query created, attempting to fetch documents");
          
          try {
            const chatsSnapshot = await getDocs(chatsQuery);
            console.log("Chats snapshot received, document count:", chatsSnapshot.docs.length);
            const chatsData = chatsSnapshot.docs.map(doc => doc.data());
            
            // Fetch messages for each chat
            const chats: Chat[] = [];
            
            for (const chatData of chatsData) {
              const messagesQuery = query(
                collection(db, 'messages'),
                where('chatId', '==', chatData.id),
                orderBy('timestamp', 'asc')
              );
              
              const messagesSnapshot = await getDocs(messagesQuery);
              const messagesData = messagesSnapshot.docs.map(doc => doc.data());
              
              // Convert timestamps to Date objects
              const messages: Message[] = messagesData.map(msg => ({
                ...msg,
                content: msg.content || '',
                role: msg.role || 'user',
                mode: msg.mode || 'chat',
                timestamp: new Date(msg.timestamp),
                id: msg.id || uuidv4() // Ensure each message has an ID
              })) as Message[];
              
              chats.push({
                ...chatData,
                createdAt: new Date(chatData.createdAt),
                updatedAt: new Date(chatData.updatedAt),
                messages,
                id: chatData.id, // Ensure chat ID is set
                title: chatData.title || `Chat ${chatData.id.slice(0, 6)}`,
                mode: chatData.mode || 'chat',
                systemPrompt: chatData.systemPrompt || DEFAULT_SYSTEM_PROMPTS[chatData.mode as keyof typeof DEFAULT_SYSTEM_PROMPTS] || ''
              });
            }
            
            // Fetch user preferences
            const preferencesDoc = await getDoc(doc(db, 'user_preferences', userId));
            
            if (preferencesDoc.exists()) {
              const preferencesData = preferencesDoc.data();
              // Update user preferences
              set({
                userPreferences: {
                  ...get().userPreferences,
                  ...preferencesData,
                  defaultSystemPrompts: {
                    ...DEFAULT_SYSTEM_PROMPTS,
                    ...preferencesData.defaultSystemPrompts
                  },
                  colorPalette: {
                    ...DEFAULT_COLOR_PALETTE,
                    ...preferencesData.colorPalette
                  }
                },
              });
              
              // Apply color palette
              if (preferencesData.colorPalette) {
                const root = document.documentElement;
                root.style.setProperty('--primary-color', preferencesData.colorPalette.primary);
                root.style.setProperty('--secondary-color', preferencesData.colorPalette.secondary);
                root.style.setProperty('--tertiary-color', preferencesData.colorPalette.tertiary);
              }
            }
            
            // Update state with fetched chats
            set({ 
              chats,
              activeChat: chats.length > 0 ? chats[0].id : null,
              isLoading: false,
            });
          } catch (error) {
            console.error("Error fetching chat documents:", error);
            set({ isLoading: false });
          }
        } catch (error) {
          console.error('Error in fetchUserChats:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'onix-ai-storage',
      partialize: (state) => ({
        userPreferences: state.userPreferences,
      }),
    }
  )
);

// Make the store accessible globally for API functions
// Using module augmentation instead of global declaration
if (typeof window !== 'undefined') {
  // @ts-ignore - Add store to window object
  window.store = useStore;
  
  // Set up auth state change listener
  auth.onAuthStateChanged((firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      const user: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        avatar_url: firebaseUser.photoURL || undefined,
        created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
        last_sign_in: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
      };
      
      useStore.getState().setUser(user);
    } else {
      useStore.setState({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      });
    }
  });
  
  // Apply color palette on initial load
  const { userPreferences } = useStore.getState();
  if (userPreferences.colorPalette) {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', userPreferences.colorPalette.primary);
    root.style.setProperty('--secondary-color', userPreferences.colorPalette.secondary);
    root.style.setProperty('--tertiary-color', userPreferences.colorPalette.tertiary);
  }
}