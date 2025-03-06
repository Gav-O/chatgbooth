
import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    toast(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`);
  };

  return (
    <Button 
      onClick={toggleTheme} 
      variant="ghost" 
      size="icon" 
      className="w-10 h-10 rounded-full" 
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun size={18} className="text-sidebar-primary" />
      ) : (
        <Moon size={18} className="text-sidebar-primary" />
      )}
    </Button>
  );
};

export default ThemeToggle;
