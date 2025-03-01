
import React from "react";
import { useChat } from "@/context/ChatContext";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

const ChatLayout: React.FC = () => {
  const { isMobileSidebarOpen, toggleMobileSidebar } = useChat();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10 lg:hidden transition-opacity"
          onClick={toggleMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`fixed top-0 bottom-0 left-0 z-20 w-72 transform transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0 lg:relative lg:z-0`}
      >
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col h-full w-full lg:pl-72">
        <ChatArea />
      </div>
    </div>
  );
};

export default ChatLayout;
