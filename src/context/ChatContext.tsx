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
  createNewConversation: () => void;
  deleteConversation: (id: string) => void;
  renameConversation: (id: string, newTitle: string) => void;
  isMobileSidebarOpen: boolean;
  toggleMobileSidebar: () => void;
  isWaitingForResponse: boolean;
}

// Sample conversation data
const initialConversations: ConversationType[] = [
  {
    id: "1",
    title: "How to design a website",
    lastMessageTime: new Date(),
    messages: [
      {
        id: "1",
        role: "user",
        content: "I need help designing a website for my new business.",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "I'd be happy to help you design a website for your business. Could you tell me more about what kind of business you have and what you'd like to achieve with your website?",
        timestamp: new Date(Date.now() - 3500000),
      },
    ],
    context: [],
  },
  {
    id: "2",
    title: "AI model capabilities",
    lastMessageTime: new Date(Date.now() - 86400000),
    messages: [
      {
        id: "1",
        role: "user",
        content: "What are the capabilities of the latest AI models?",
        timestamp: new Date(Date.now() - 86400000),
      },
    ],
    context: [],
  },
  {
    id: "3",
    title: "Programming help",
    lastMessageTime: new Date(Date.now() - 172800000),
    messages: [
      {
        id: "1",
        role: "user",
        content: "Can you help me debug this React code?",
        timestamp: new Date(Date.now() - 172800000),
      },
    ],
    context: [],
  },
  {
    id: "4",
    title: "Learning Spanish",
    lastMessageTime: new Date(Date.now() - 259200000),
    messages: [
      {
        id: "1",
        role: "user",
        content: "I want to learn Spanish. Where should I start?",
        timestamp: new Date(Date.now() - 259200000),
      },
    ],
    context: [],
  },
  {
    id: "5",
    title: "Travel recommendations",
    lastMessageTime: new Date(Date.now() - 345600000),
    messages: [
      {
        id: "1",
        role: "user",
        content: "Can you recommend places to visit in Japan?",
        timestamp: new Date(Date.now() - 345600000),
      },
    ],
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

    // If this is a user message, set waiting state to true
    if (message.role === "user") {
      setIsWaitingForResponse(true);
    } else if (message.role === "assistant") {
      // If this is an assistant message, set waiting state to false
      setIsWaitingForResponse(false);
    }

    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === activeConversationId) {
          const newMessage = {
            ...message,
            id: Date.now().toString(),
            timestamp: new Date(),
          };

          return {
            ...conv,
            lastMessageTime: new Date(),
            messages: [...conv.messages, newMessage],
            context: context || conv.context, // Use the provided context or fall back to the existing context
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
        createNewConversation();
      }
      
      return filtered;
    });
  };

  const renameConversation = (id: string, newTitle: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === id ? { ...conv, title: newTitle } : conv
      )
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
