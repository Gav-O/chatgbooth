
import React from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageType = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface MessageItemProps {
  message: MessageType;
}

const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div 
      className={cn(
        "group animate-fade-in",
        isUser ? "" : ""
      )}
    >
      <div className="flex items-start gap-4 max-w-3xl mx-auto">
        {/* Avatar/icon */}
        <div className={cn(
          "flex-shrink-0 rounded-full w-8 h-8 flex items-center justify-center",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-accent text-accent-foreground"
        )}>
          {isUser ? <User size={16} /> : <span className="text-xl">⌘</span>}
        </div>
        
        {/* Message content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">
              {isUser ? 'You' : 'ChatGBHO'}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatTime(message.timestamp)}
            </span>
          </div>
          
          <div className={cn(
            "p-4 rounded-xl text-base leading-relaxed",
            isUser 
              ? "bg-chat-user text-foreground" 
              : "bg-chat-assistant text-foreground"
          )}>
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;
