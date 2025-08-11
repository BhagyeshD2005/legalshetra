'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { type ChatMessage as ChatMessageType } from '@/ai/types';
import { ChatMessage } from './ChatMessage';
import { MessageSquare, Send, RefreshCw } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onAddToReport: (content: string) => void;
}

export function ChatInterface({ messages, onSendMessage, isLoading, onAddToReport }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when new messages arrive
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <CardTitle className="font-headline">Follow-up Questions</CardTitle>
        </div>
        <CardDescription>
          Ask questions about the generated report. The AI will use the report content as its knowledge base.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[60vh]">
          <ScrollArea className="flex-1 p-4 border rounded-lg" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <ChatMessage 
                    key={index} 
                    message={msg} 
                    onAddToReport={onAddToReport}
                />
              ))}
              {isLoading && messages[messages.length-1]?.role === 'user' && (
                <ChatMessage 
                  message={{ role: 'model', content: '' }} 
                  isLoading={true} 
                />
              )}
            </div>
          </ScrollArea>
          <div className="mt-4 flex items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., 'Summarize the findings of the M.R. Balaji case.'"
              className="flex-1 resize-none"
              rows={1}
              disabled={isLoading}
            />
            <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
