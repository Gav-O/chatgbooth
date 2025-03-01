
import React from "react";
import { MessageSquare } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";

type ConversationType = {
  id: string;
  title: string;
  lastMessageTime: Date;
  messages: any[];
};

interface ConversationItemProps {
  conversation: ConversationType;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation }) => {
  const { activeConversationId, setActiveConversationId, toggleMobileSidebar } = useChat();
  
  const isActive = activeConversationId === conversation.id;
  
  const handleClick = () => {
    setActiveConversationId(conversation.id);
    // On mobile, close the sidebar after selecting a conversation
    if (window.innerWidth < 1024) {
      toggleMobileSidebar();
    }
  };
  
  // Format the timestamp
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Today";
    } else if (diffInDays === 1) {
      return "Yesterday";
    } else if (diffInDays < 7) {
      return date.toLocaleDateString(undefined, { weekday: 'long' });
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/90"
      )}
    >
      <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline w-full">
          <h3 className="font-medium truncate">{conversation.title}</h3>
          <span className="text-xs opacity-60 ml-2 flex-shrink-0">
            {formatDate(conversation.lastMessageTime)}
          </span>
        </div>
        <p className="text-xs opacity-70 truncate mt-0.5">
          {conversation.messages.length > 0 
            ? conversation.messages[conversation.messages.length - 1].content.substring(0, 40) + (conversation.messages[conversation.messages.length - 1].content.length > 40 ? '...' : '')
            : 'No messages yet'}
        </p>
      </div>
    </button>
  );
};

export default ConversationItem;
