import { useEffect, useState } from 'react';
import './TypingHeadline.css';

interface TypingHeadlineProps {
  lines: string[];
  typingSpeedMs?: number;
  pauseMs?: number;
}

export function TypingHeadline({
  lines,
  typingSpeedMs = 60,
  pauseMs = 2000,
}: TypingHeadlineProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentLine = lines[lineIndex] ?? '';

  useEffect(() => {
    if (lines.length === 0) {
      return;
    }

    const isComplete = !isDeleting && charIndex === currentLine.length;
    const isEmpty = isDeleting && charIndex === 0;

    let delay = typingSpeedMs;
    if (isComplete) {
      delay = pauseMs;
    } else if (isDeleting) {
      delay = typingSpeedMs / 2;
    }

    const timer = window.setTimeout(() => {
      if (isComplete) {
        setIsDeleting(true);
        return;
      }

      if (isEmpty) {
        setIsDeleting(false);
        setLineIndex((prev) => (prev + 1) % lines.length);
        return;
      }

      setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [charIndex, currentLine.length, isDeleting, lines.length, pauseMs, typingSpeedMs]);

  const displayText = currentLine.slice(0, charIndex);

  return (
    <p className="typing-headline" aria-live="polite">
      <span className="typing-headline__text">{displayText}</span>
      <span className="typing-headline__cursor" aria-hidden="true">
        |
      </span>
    </p>
  );
}
