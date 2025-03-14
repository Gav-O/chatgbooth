
import React, { useState, useRef, useEffect } from "react";
import { Send, Square, BookMarked } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onStopGeneration?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { isWaitingForResponse } = useChat();

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height =
        scrollHeight > 200 ? "200px" : `${scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isWaitingForResponse) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey && !isWaitingForResponse) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleStopGeneration = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (onStopGeneration) {
      onStopGeneration();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
      <div className="relative flex items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="absolute left-3 p-2 rounded-md text-muted-foreground opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setMessage(prev => prev + " #remember ")}
              >
                <BookMarked size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add to global memory with #remember</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <textarea
          ref={textareaRef}
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isWaitingForResponse 
              ? "Type a message..." 
              : "Type a message or use #remember to store information globally"
          }
          className={`w-full resize-none py-3 px-4 pl-12 pr-12 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-input-shadow transition-shadow ${
            isWaitingForResponse ? "opacity-90" : ""
          }`}
          rows={1}
          style={{ minHeight: "56px", maxHeight: "200px" }}
        />

        {isWaitingForResponse ? (
          <button
            type="button" // Changed from default to button type
            onClick={handleStopGeneration} // Use the new handler
            className="absolute right-3 p-2 rounded-md bg-red-500 text-primary-foreground opacity-90 hover:opacity-100 transition-opacity"
            aria-label="Stop generation">
            <Square size={18} />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!message.trim() || isWaitingForResponse}
            className="absolute right-3 p-2 rounded-md bg-primary text-primary-foreground opacity-90 hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message">
            <Send size={18} />
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        {isWaitingForResponse
          ? "Press square button to stop generation"
          : "Press Enter to send, Shift+Enter for a new line"}
      </p>
    </form>
  );
};

export default ChatInput;
