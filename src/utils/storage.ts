
// Storage utility for conversations persistence

const STORAGE_KEY = 'chatgbho_conversations';

// Type imports for clarity
import type { ConversationType } from '@/context/ChatContext';

/**
 * Saves conversations to localStorage
 */
export const saveConversations = (conversations: ConversationType[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations to localStorage:', error);
  }
};

/**
 * Loads conversations from localStorage
 * Returns null if no data is found or if there's an error
 */
export const loadConversations = (): ConversationType[] | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    // Parse the data from string to object
    const parsed = JSON.parse(data);
    
    // Convert string dates back to Date objects
    return parsed.map((conv: any) => ({
      ...conv,
      lastMessageTime: new Date(conv.lastMessageTime),
      messages: conv.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    }));
  } catch (error) {
    console.error('Error loading conversations from localStorage:', error);
    return null;
  }
};

/**
 * Clears all conversations from localStorage
 */
export const clearConversations = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing conversations from localStorage:', error);
  }
};
