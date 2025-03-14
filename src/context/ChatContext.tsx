import React, { createContext, useContext, useState, useEffect } from "react";
import { loadConversations, saveConversations, saveMemory, loadMemories } from "@/utils/storage";

type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

export type ConversationType = {
  id: string;
  title: string;
  lastMessageTime: Date;
  messages: MessageType[];
  context: any[];
};

interface ChatContextType {
  conversations: ConversationType[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string) => void;
  addMessage: (
    message: Omit<MessageType, "id" | "timestamp">,
    context?: any[]
  ) => void;
  createNewConversation: () => string; // Modified to return the new conversation ID
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  isWaitingForResponse: boolean;
  setIsWaitingForResponse: React.Dispatch<React.SetStateAction<boolean>>; // Add this line
  setConversations: React.Dispatch<React.SetStateAction<ConversationType[]>>;
  processMessageForMemory: (content: string) => string;
  globalMemories: any[];
  refreshGlobalMemories: () => void;
}

const initialConversations: ConversationType[] = [
  {
    id: "1",
    title: "New conversation",
    lastMessageTime: new Date(),
    messages: [],
    context: [],
  },
];

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Load conversations from localStorage on initial render
  const [conversations, setConversations] = useState<ConversationType[]>(() => {
    const savedConversations = loadConversations();
    return savedConversations || initialConversations;
  });
  
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(() => {
    // If we have saved conversations, set the first one as active
    const savedConversations = loadConversations();
    return savedConversations && savedConversations.length > 0 
      ? savedConversations[0].id 
      : "1";
  });
  
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);
  const [globalMemories, setGlobalMemories] = useState<any[]>([]);

  // Load global memories on initial render
  useEffect(() => {
    refreshGlobalMemories();
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const refreshGlobalMemories = () => {
    const memories = loadMemories() || [];
    setGlobalMemories(memories);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
  };

  /**
   * Process message content for memory storage
   * Returns the cleaned message content (without #remember)
   */
  const processMessageForMemory = (content: string): string => {
    const rememberRegex = /#remember\s+(.*?)(?=\s*#|\s*$)/gs;
    let cleanedContent = content;
    
    // Extract all memory segments
    const matches = content.matchAll(rememberRegex);
    for (const match of matches) {
      if (match[1] && match[1].trim()) {
        // Save this segment to global memory
        saveMemory(match[1].trim());
        
        // Remove the #remember tag from the original message
        cleanedContent = cleanedContent.replace(match[0], match[1]);
      }
    }
    
    // If the entire message was a memory command, keep the content but remove the command
    if (content.trim().startsWith('#remember ')) {
      cleanedContent = content.replace(/#remember\s+/, '');
    }
    
    refreshGlobalMemories();
    return cleanedContent;
  };

  const addMessage = (
    message: Omit<MessageType, "id" | "timestamp">,
    context?: any[]
  ) => {
    if (!activeConversationId) return;

    // Generate a unique ID using Date.now() and a random number
    const uniqueId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 9)}`;

    // If it's a user message, process it for memory storage
    let processedContent = message.content;
    if (message.role === "user") {
      processedContent = processMessageForMemory(message.content);
    }

    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === activeConversationId) {
          const newMessage = {
            ...message,
            content: processedContent,
            id: uniqueId, // Use the unique ID
            timestamp: new Date(),
          };

          return {
            ...conv,
            lastMessageTime: new Date(),
            messages: [...conv.messages, newMessage],
            context: context || conv.context,
          };
        }
        return conv;
      });
    });
  };

  const createNewConversation = () => {
    const newId = Date.now().toString();
    const newConversation: ConversationType = {
      id: newId,
      title: "New conversation",
      lastMessageTime: new Date(),
      messages: [],
      context: [],
    };

    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newId);

    // Reset waiting state when creating a new conversation
    setIsWaitingForResponse(false);

    // Close mobile sidebar when creating a new conversation
    if (isMobileSidebarOpen) {
      setIsMobileSidebarOpen(false);
    }

    return newId; // Return the new conversation ID
  };

  const deleteConversation = (id: string) => {
    // Check if we're deleting the active conversation
    const isActiveConversation = activeConversationId === id;

    // Filter out the conversation to delete
    setConversations(prev => {
      const filtered = prev.filter(conv => conv.id !== id);

      // If we deleted the active conversation, set a new active conversation
      if (isActiveConversation && filtered.length > 0) {
        setActiveConversationId(filtered[0].id);
      } else if (filtered.length === 0) {
        // If no conversations left, create a new one
        setActiveConversationId(null);
      }

      return filtered;
    });
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(conv => (conv.id === id ? { ...conv, title: newTitle } : conv))
    );
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        setActiveConversationId,
        addMessage,
        createNewConversation,
        deleteConversation,
        renameConversation,
        isMobileSidebarOpen,
        toggleMobileSidebar,
        isWaitingForResponse,
        setIsWaitingForResponse,
        setConversations,
        processMessageForMemory,
        globalMemories,
        refreshGlobalMemories,
      }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
