import React, { createContext, useContext, useState } from "react";

type MessageType = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type ConversationType = {
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
  const [conversations, setConversations] =
    useState<ConversationType[]>(initialConversations);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >("1");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isWaitingForResponse, setIsWaitingForResponse] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(prev => !prev);
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

    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === activeConversationId) {
          const newMessage = {
            ...message,
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
        setIsWaitingForResponse, // Add this line
        setConversations,
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
