'use client';

import { memo } from 'react';
import { type ChatMessage as ChatMessageType } from '@/ai/types';
import { cn } from '@/lib/utils';
import { Bot, User, PlusSquare, FileOutput } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';

interface ChatMessageProps {
  message: ChatMessageType;
  isLoading?: boolean;
  onAddToReport?: (content: string) => void;
  onExportToDocs?: (content: string) => void;
}

const ChatMessageComponent = ({ message, isLoading = false, onAddToReport, onExportToDocs }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  const TypingIndicator = () => (
    <div className="flex items-center space-x-1">
      <motion.div
        className="w-2 h-2 bg-muted-foreground rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-2 h-2 bg-muted-foreground rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, delay: 0.1, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="w-2 h-2 bg-muted-foreground rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'group flex items-start gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot className="h-5 w-5" />
        </div>
      )}

      <div
        className={cn(
          'relative max-w-md rounded-lg px-4 py-3 text-sm',
          isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted'
        )}
      >
        {isLoading ? (
            <TypingIndicator />
        ) : (
          <p className="whitespace-pre-wrap">{message.content}</p>
        )}
        
        {!isUser && !isLoading && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-0 right-0 translate-x-full translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pl-2"
            >
                {onAddToReport && (
                    <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-7 w-7 rounded-full bg-background hover:bg-primary/10 shadow-md"
                        onClick={() => onAddToReport(message.content)}
                        aria-label="Add to report"
                    >
                        <PlusSquare className="h-4 w-4 text-primary" />
                    </Button>
                )}
                {onExportToDocs && (
                    <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-7 w-7 rounded-full bg-background hover:bg-primary/10 shadow-md"
                        onClick={() => onExportToDocs(message.content)}
                        aria-label="Export to Google Docs"
                    >
                        <FileOutput className="h-4 w-4 text-primary" />
                    </Button>
                )}
            </motion.div>
        )}
      </div>


      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <User className="h-5 w-5" />
        </div>
      )}
    </motion.div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
