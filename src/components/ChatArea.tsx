
import React from "react";
import { useChat } from "@/context/ChatContext";
import { Menu } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

const ChatArea: React.FC = () => {
  const { 
    conversations, 
    activeConversationId, 
    addMessage, 
    toggleMobileSidebar,
    createNewConversation
  } = useChat();
  
  const activeConversation = activeConversationId 
    ? conversations.find(c => c.id === activeConversationId) 
    : null;

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    // If no conversation is active, create a new one
    if (!activeConversationId) {
      createNewConversation();
    }
    
    // Add user message
    addMessage({
      role: 'user',
      content,
    });
    
    // Simulate AI response after a short delay
    setTimeout(() => {
      addMessage({
        role: 'assistant',
        content: `This is a simulated response to: "${content}"`,
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <header className="flex items-center h-16 px-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 mr-2 rounded-md hover:bg-muted lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex-1 flex items-center justify-center lg:justify-start">
          <h2 className="text-lg font-medium">
            {activeConversation ? activeConversation.title : 'New Chat'}
          </h2>
        </div>
      </header>
      
      {/* Message area */}
      <div className="flex-1 overflow-hidden">
        {activeConversation ? (
          <MessageList messages={activeConversation.messages} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="text-6xl mb-4">⌘</div>
            <h3 className="text-2xl font-medium mb-2">Welcome to ChatGBHO</h3>
            <p className="text-muted-foreground max-w-md">
              Start a new conversation by typing a message below or select an existing conversation from the sidebar.
            </p>
          </div>
        )}
      </div>
      
      {/* Input area */}
      <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
};

export default ChatArea;
