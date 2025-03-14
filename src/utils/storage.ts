
// Storage utility for conversations persistence

const STORAGE_KEY = 'chatgbho_conversations';
const GLOBAL_MEMORY_KEY = 'chatgbho_global_memory';

// Type imports for clarity
import type { ConversationType } from '@/context/ChatContext';

export type MemoryItem = {
  id: string;
  content: string;
  timestamp: Date;
};

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

/**
 * Save a memory to global storage
 */
export const saveMemory = (content: string): MemoryItem => {
  try {
    const memories = loadMemories() || [];
    const newMemory: MemoryItem = {
      id: `memory_${Date.now()}`,
      content,
      timestamp: new Date()
    };
    
    memories.push(newMemory);
    localStorage.setItem(GLOBAL_MEMORY_KEY, JSON.stringify(memories));
    return newMemory;
  } catch (error) {
    console.error('Error saving memory to localStorage:', error);
    throw error;
  }
};

/**
 * Load all memories from global storage
 */
export const loadMemories = (): MemoryItem[] | null => {
  try {
    const data = localStorage.getItem(GLOBAL_MEMORY_KEY);
    if (!data) return [];
    
    // Parse the data from string to object
    const parsed = JSON.parse(data);
    
    // Convert string dates back to Date objects
    return parsed.map((memory: any) => ({
      ...memory,
      timestamp: new Date(memory.timestamp)
    }));
  } catch (error) {
    console.error('Error loading memories from localStorage:', error);
    return null;
  }
};

/**
 * Remove a specific memory by ID
 */
export const removeMemory = (id: string): void => {
  try {
    const memories = loadMemories() || [];
    const updatedMemories = memories.filter(memory => memory.id !== id);
    localStorage.setItem(GLOBAL_MEMORY_KEY, JSON.stringify(updatedMemories));
  } catch (error) {
    console.error('Error removing memory from localStorage:', error);
  }
};

/**
 * Clear all global memories
 */
export const clearMemories = (): void => {
  try {
    localStorage.removeItem(GLOBAL_MEMORY_KEY);
  } catch (error) {
    console.error('Error clearing memories from localStorage:', error);
  }
};
