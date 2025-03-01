
import React, { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "0";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = scrollHeight > 200 ? "200px" : `${scrollHeight}px`;
    }
  }, [message]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage("");
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto w-full">
      <div className="relative flex items-center">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="w-full resize-none py-3 px-4 pr-12 rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-input-shadow transition-shadow"
          rows={1}
          style={{ minHeight: "56px", maxHeight: "200px" }}
        />
        
        <button
          type="submit"
          disabled={!message.trim()}
          className="absolute right-3 p-2 rounded-md bg-primary text-primary-foreground opacity-90 hover:opacity-100 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2 text-center">
        Press Enter to send, Shift+Enter for a new line
      </p>
    </form>
  );
};

export default ChatInput;
