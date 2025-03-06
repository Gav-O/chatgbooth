
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/context/ChatContext";
import ThemeToggle from "./ThemeToggle";

const SidebarHeader: React.FC = () => {
  const { createNewConversation } = useChat();

  return (
    <div className="flex items-center justify-between p-4">
      <Button
        variant="ghost"
        className="flex items-center w-full justify-start gap-2 bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/80"
        onClick={() => createNewConversation()}>
        <Plus size={16} />
        <span>New Chat</span>
      </Button>
      <div className="ml-2">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default SidebarHeader;
