import React from "react";
import { useChat } from "@/context/ChatContext";
import { Menu } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import axios from "axios";

const ChatArea: React.FC = () => {
  const askAI = async (prompt: string) => {
    try {
      const activeConversation = activeConversationId
        ? conversations.find(c => c.id === activeConversationId)
        : null;

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: prompt,
          stream: true,
          context: activeConversation?.context || [], // Use the conversation's context
        }),
      });

      const reader = response.body?.getReader();
      let result = "";
      let finalContext: any[] = []; // Store the final context from the server

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = new TextDecoder().decode(value);
          const lines = chunk.split("\n"); // Split the chunk by newlines

          for (const line of lines) {
            if (line.trim() === "") continue; // Skip empty lines

            try {
              const parsedChunk = JSON.parse(line); // Parse each line as JSON
              result += parsedChunk.response;

              // Update the message with the new chunk
              updateStreamingMessage(result);

              // Store the context from the server's response
              if (parsedChunk.context) {
                finalContext = parsedChunk.context;
              }
            } catch (error) {
              console.error("Error parsing chunk:", error);
            }
          }
        }
      }

      // Return the final result and context
      return { response: result, context: finalContext };
    } catch (error) {
      console.error("Error:", error);
      return { response: "Error: Could not get a response.", context: [] };
    }
  };

  const updateStreamingMessage = (content: string) => {
    if (!activeConversationId) return;

    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === activeConversationId) {
          const lastMessage = conv.messages[conv.messages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            // Update the last assistant message
            return {
              ...conv,
              messages: conv.messages.map((msg, index) =>
                index === conv.messages.length - 1
                  ? { ...msg, content: content }
                  : msg
              ),
            };
          }
        }
        return conv;
      });
    });
  };

  const {
    conversations,
    activeConversationId,
    addMessage,
    toggleMobileSidebar,
    createNewConversation,
    setConversations,
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
      role: "user",
      content,
    });

    // Add a placeholder assistant message
    addMessage({
      role: "assistant",
      content: "", // Empty content for the placeholder
    });

    // Start streaming the AI response
    askAI(content).then(({ response, context }) => {
      // Update the assistant's message with the final response and context
      updateStreamingMessage(response);

      // Update the conversation's context with the new context
      if (activeConversationId) {
        setConversations(prevConversations =>
          prevConversations.map(conv => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                context: context || conv.context, // Use the new context or fall back to the existing context
              };
            }
            return conv;
          })
        );
      }
    });
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <header className="flex items-center h-16 px-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <button
          onClick={toggleMobileSidebar}
          className="p-2 mr-2 rounded-md hover:bg-muted lg:hidden"
          aria-label="Open sidebar">
          <Menu size={20} />
        </button>

        <div className="flex-1 flex items-center justify-center lg:justify-start">
          <h2 className="text-lg font-medium">
            {activeConversation ? activeConversation.title : "New Chat"}
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
              Start a new conversation by typing a message below or select an
              existing conversation from the sidebar.
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
