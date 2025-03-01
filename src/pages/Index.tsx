
import React from "react";
import { ChatProvider } from "@/context/ChatContext";
import ChatLayout from "@/components/ChatLayout";

const Index = () => {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
};

export default Index;
