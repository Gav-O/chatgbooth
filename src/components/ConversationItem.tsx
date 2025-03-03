
import React, { useState, useRef } from "react";
import { MessageSquare, MoreVertical, Trash, Pencil } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const { activeConversationId, setActiveConversationId, toggleMobileSidebar, deleteConversation, renameConversation } = useChat();
  const [showMenu, setShowMenu] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(conversation.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const isActive = activeConversationId === conversation.id;
  
  const handleClick = () => {
    if (!isRenaming) {
      setActiveConversationId(conversation.id);
      // On mobile, close the sidebar after selecting a conversation
      if (window.innerWidth < 1024) {
        toggleMobileSidebar();
      }
    }
  };

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteConversation(conversation.id);
    setShowMenu(false);
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed",
    });
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRenaming(true);
    setShowMenu(false);
    // Focus the input after it renders
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.trim()) {
      renameConversation(conversation.id, newTitle.trim());
      toast({
        title: "Conversation renamed",
        description: "The conversation title has been updated",
      });
    } else {
      setNewTitle(conversation.title);
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setNewTitle(conversation.title);
    setIsRenaming(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);
  
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
    <div
      className={cn(
        "w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors relative",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "hover:bg-sidebar-accent/50 text-sidebar-foreground/90"
      )}
    >
      {isRenaming ? (
        <form onSubmit={handleRenameSubmit} className="w-full flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-2 py-1 bg-sidebar-accent/30 border border-sidebar-border rounded-md text-sm"
            onBlur={handleRenameCancel}
            onKeyDown={(e) => e.key === "Escape" && handleRenameCancel()}
          />
          <button type="submit" className="sr-only">Save</button>
        </form>
      ) : (
        <div className="flex items-start w-full justify-between">
          <button onClick={handleClick} className="flex items-start gap-3 flex-1 text-left overflow-hidden">
            <MessageSquare size={18} className="mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0 overflow-hidden">
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

          <div className="relative ml-2 flex-shrink-0" ref={menuRef}>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleMenuToggle}
                    className="p-1 rounded-md hover:bg-sidebar-accent/70 text-sidebar-foreground/70"
                    aria-label="Conversation options"
                  >
                    <MoreVertical size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10">
                <button
                  onClick={handleRenameClick}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-sidebar-accent/30 transition-colors"
                >
                  <Pencil size={14} /> Rename
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-destructive hover:bg-sidebar-accent/30 transition-colors"
                >
                  <Trash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationItem;
