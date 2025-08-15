'use client'

import { useState, useEffect } from 'react';

interface TypingEffectProps {
  text: string;
  speed?: number;
}

export function TypingEffect({ text, speed = 20 }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText(''); // Reset when text changes
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(prev => prev + text.charAt(i));
      i++;
      if (i > text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed]);

  return (
    <pre className="font-mono text-xs whitespace-pre-wrap">
      {displayedText}
      <span className="animate-ping">|</span>
    </pre>
  );
}
