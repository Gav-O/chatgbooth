
import React from "react";
import { useChat } from "@/context/ChatContext";
import { PlusCircle, X } from "lucide-react";
import ConversationItem from "./ConversationItem";

const Sidebar: React.FC = () => {
  const { conversations, createNewConversation, toggleMobileSidebar } =
    useChat();

  return (
    <div className="flex flex-col h-full bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <span className="text-2xl font-light">⌘</span>
          <h1 className="text-xl font-semibold tracking-tight">ChatGBHO</h1>
        </div>

        <button
          onClick={toggleMobileSidebar}
          className="p-1 rounded-md hover:bg-sidebar-accent lg:hidden"
          aria-label="Close sidebar">
          <X size={20} />
        </button>
      </div>

      {/* New chat button */}
      <div className="p-4">
        <button
          onClick={createNewConversation}
          className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-md bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity">
          <PlusCircle size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2">
        <div className="space-y-1">
          {conversations.map(conversation => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border text-xs text-sidebar-foreground/70">
        <p>© 2025 ChatGBHO</p>
      </div>
    </div>
  );
};

export default Sidebar;
