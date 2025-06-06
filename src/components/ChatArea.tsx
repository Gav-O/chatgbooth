
import React, { useRef } from "react";
import { useChat } from "@/context/ChatContext";
import { Menu } from "lucide-react";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import MemoryManager from "./MemoryManager";
import { formatText } from "@/utils/formatText";

const ChatArea: React.FC = () => {
  const finalContextRef = useRef<any[]>([]);
  const {
    conversations,
    activeConversationId,
    addMessage,
    toggleMobileSidebar,
    createNewConversation,
    setConversations,
    isWaitingForResponse,
    setIsWaitingForResponse,
    globalMemories,
  } = useChat();

  // Add a ref to store the current reader
  const readerRef = useRef<ReadableStreamDefaultReader<Uint8Array> | null>(
    null
  );

  const stopGeneration = async () => {
    // Cancel the reader if it exists
    if (readerRef.current) {
      try {
        // Save the current context before canceling
        const activeConversation = activeConversationId
          ? conversations.find(c => c.id === activeConversationId)
          : null;

        if (activeConversation) {
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === activeConversationId) {
                return {
                  ...conv,
                  context: finalContextRef.current || conv.context, // Use the ref
                };
              }
              return conv;
            });
          });
        }

        // Cancel the reader
        await readerRef.current.cancel();
        readerRef.current = null;

        // Update the last message to indicate it was stopped
        if (activeConversationId) {
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === activeConversationId) {
                const messages = [...conv.messages];
                const lastMessage = messages[messages.length - 1];

                if (lastMessage && lastMessage.role === "assistant") {
                  messages[messages.length - 1] = {
                    ...lastMessage,
                    content: `${lastMessage.content.replace(
                      " ⬤",
                      ""
                    )} (stopped)`,
                  };
                }

                return {
                  ...conv,
                  messages,
                };
              }
              return conv;
            });
          });
        }

        // Reset the waiting state
        setIsWaitingForResponse(false);
      } catch (error) {
        console.error("Error cancelling reader:", error);
      }
    }
  };

  const askAI = async (prompt: string) => {
    try {
      setIsWaitingForResponse(true); // Set waiting state to true when starting the request

      const activeConversation = activeConversationId
        ? conversations.find(c => c.id === activeConversationId)
        : null;

      // Initialize the ref with the current context
      finalContextRef.current = activeConversation?.context || [];

      // Prepare global memories to include in the prompt if there are any
      let enhancedPrompt = prompt;
      if (globalMemories && globalMemories.length > 0) {
        const memoryText = globalMemories.map(m => m.content).join('\n');
        enhancedPrompt = `[User's stored memories:\n${memoryText}\n]\n\nUser: ${prompt}`;
      }

      const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.2",
          prompt: enhancedPrompt,
          stream: true,
          context: activeConversation?.context || [],
        }),
      });

      const reader = response.body?.getReader();
      // Store the reader in the ref so we can cancel it if needed
      readerRef.current = reader;

      let result = "";

      if (reader) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split("\n");

            for (const line of lines) {
              if (line.trim() === "") continue;

              try {
                const parsedChunk = JSON.parse(line);
                result += parsedChunk.response;

                const formattedResult = formatText(result);
                updateStreamingMessage(formattedResult, true);

                if (parsedChunk.context) {
                  finalContextRef.current = parsedChunk.context; // Update the ref
                }
              } catch (error) {
                console.error("Error parsing chunk:", error);
              }
            }
          }
        } catch (error) {
          // This could be a cancellation or other error
          console.error("Stream reading error:", error);

          // If it's not a cancellation, we should still clean up
          if (readerRef.current) {
            readerRef.current = null;
          }

          // Save the context before returning
          setConversations(prevConversations => {
            return prevConversations.map(conv => {
              if (conv.id === activeConversationId) {
                return {
                  ...conv,
                  context: finalContextRef.current || conv.context,
                };
              }
              return conv;
            });
          });

          // We still return what we have
          return {
            response: formatText(result),
            context: finalContextRef.current,
          };
        }
      }

      readerRef.current = null;
      const formattedResponse = formatText(result);

      // Save the final context
      setConversations(prevConversations => {
        return prevConversations.map(conv => {
          if (conv.id === activeConversationId) {
            return {
              ...conv,
              context: finalContextRef.current || conv.context,
            };
          }
          return conv;
        });
      });

      return { response: formattedResponse, context: finalContextRef.current };
    } catch (error) {
      console.error("Error:", error);
      return { response: "Error: Could not get a response.", context: [] };
    } finally {
      setIsWaitingForResponse(false); // Set waiting state to false when the request is complete
    }
  };

  const updateStreamingMessage = (
    content: string,
    isStreaming: boolean = true
  ) => {
    if (!activeConversationId) return;

    const formattedContent = formatText(content);

    setConversations(prevConversations => {
      return prevConversations.map(conv => {
        if (conv.id === activeConversationId) {
          const lastMessage = conv.messages[conv.messages.length - 1];
          if (lastMessage && lastMessage.role === "assistant") {
            return {
              ...conv,
              messages: conv.messages.map((msg, index) =>
                index === conv.messages.length - 1
                  ? {
                      ...msg,
                      content: isStreaming
                        ? `${formattedContent} ⬤`
                        : formattedContent,
                    }
                  : msg
              ),
            };
          }
        }
        return conv;
      });
    });
  };

  const activeConversation = activeConversationId
    ? conversations.find(c => c.id === activeConversationId)
    : null;

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;

    if (!activeConversationId) {
      const newConversationId = createNewConversation();

      addMessage({
        role: "user",
        content,
      });

      addMessage({
        role: "assistant",
        content: "⬤",
      });

      askAI(content).then(({ response, context }) => {
        updateStreamingMessage(response, false);

        setConversations(prevConversations =>
          prevConversations.map(conv => {
            if (conv.id === newConversationId) {
              return {
                ...conv,
                context: context || conv.context,
              };
            }
            return conv;
          })
        );
      });

      return;
    }

    addMessage({
      role: "user",
      content,
    });

    addMessage({
      role: "assistant",
      content: "⬤",
    });

    askAI(content).then(({ response, context }) => {
      updateStreamingMessage(response, false);

      if (activeConversationId) {
        setConversations(prevConversations =>
          prevConversations.map(conv => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                context: context || conv.context,
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
        
        <div className="ml-auto">
          <MemoryManager />
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        {activeConversation ? (
          <MessageList messages={activeConversation.messages} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center">
            <div className="text-6xl mb-4">⌘</div>
            <h3 className="text-2xl font-medium mb-2">Welcome to Moss</h3>
            <p className="text-muted-foreground max-w-md">
              Start a new conversation by typing a message below or select an
              existing conversation from the sidebar.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <ChatInput
          onSendMessage={handleSendMessage}
          onStopGeneration={stopGeneration}
        />
      </div>
    </div>
  );
};

export default ChatArea;
