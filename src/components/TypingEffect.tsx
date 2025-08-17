
'use client'

import { useState, useEffect } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
}

export const TypingEffect = ({ text, speed = 30 }: TypingEffectProps) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset on text change
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);

    return () => {
      clearInterval(typingInterval);
    };
  }, [text, speed]);

  return <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono">{displayedText}<span className="animate-pulse">|</span></p>;
};
