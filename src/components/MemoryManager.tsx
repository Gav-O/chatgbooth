
import React, { useState, useEffect } from 'react';
import { loadMemories, removeMemory, clearMemories, MemoryItem } from '@/utils/storage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, BookMarked } from 'lucide-react';
import { toast } from 'sonner';

const MemoryManager: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [open, setOpen] = useState(false);

  // Load memories when dialog opens
  useEffect(() => {
    if (open) {
      loadMemoriesFromStorage();
    }
  }, [open]);

  const loadMemoriesFromStorage = () => {
    const loadedMemories = loadMemories() || [];
    setMemories(loadedMemories);
  };

  const handleRemoveMemory = (id: string) => {
    removeMemory(id);
    setMemories(prev => prev.filter(memory => memory.id !== id));
    toast.success('Memory removed successfully');
  };

  const handleClearAllMemories = () => {
    clearMemories();
    setMemories([]);
    toast.success('All memories cleared');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <BookMarked size={16} />
          <span>Memories</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Global Memories</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          {memories.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No memories stored yet</p>
          ) : (
            <>
              <div className="flex justify-end">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={handleClearAllMemories}
                  className="gap-2"
                >
                  <Trash2 size={14} />
                  <span>Clear All</span>
                </Button>
              </div>
              
              <ScrollArea className="h-[300px] rounded-md border p-4">
                <div className="space-y-4">
                  {memories.map((memory) => (
                    <div 
                      key={memory.id} 
                      className="p-3 rounded-md border relative group"
                    >
                      <div className="text-sm whitespace-pre-wrap">{memory.content}</div>
                      <div className="text-xs text-muted-foreground mt-2">
                        {formatDate(memory.timestamp)}
                      </div>
                      <button
                        onClick={() => handleRemoveMemory(memory.id)}
                        className="absolute top-2 right-2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
                        aria-label="Remove memory"
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MemoryManager;
