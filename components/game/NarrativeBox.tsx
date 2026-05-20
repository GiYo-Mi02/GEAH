"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface NarrativeBoxProps {
  text: string;
  className?: string;
  onComplete?: () => void;
  sentencesPerPage?: number;
  typingSpeedMs?: number;
}

const DEFAULT_SENTENCES_PER_PAGE = 2;
const DEFAULT_TYPING_SPEED_MS = 25;

function splitIntoPages(rawText: string, sentencesPerPage: number): string[] {
  const normalized = rawText.replace(/\s+/g, ' ').trim();
  if (!normalized) return [''];

  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [normalized];
  if (sentences.length <= sentencesPerPage) return [normalized];

  const pages: string[] = [];
  for (let i = 0; i < sentences.length; i += sentencesPerPage) {
    pages.push(sentences.slice(i, i + sentencesPerPage).join(' ').trim());
  }
  return pages;
}

export const NarrativeBox: React.FC<NarrativeBoxProps> = ({
  text,
  className,
  onComplete,
  sentencesPerPage = DEFAULT_SENTENCES_PER_PAGE,
  typingSpeedMs = DEFAULT_TYPING_SPEED_MS,
}) => {
  const pages = useMemo(
    () => splitIntoPages(text, sentencesPerPage),
    [text, sentencesPerPage]
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPageComplete, setIsPageComplete] = useState(false);
  const completedRef = useRef(false);

  const currentPageText = pages[pageIndex] ?? '';

  useEffect(() => {
    setPageIndex(0);
    completedRef.current = false;
  }, [pages]);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
    setIsPageComplete(false);
  }, [currentPageText]);

  useEffect(() => {
    if (currentIndex < currentPageText.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + currentPageText[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeedMs);
      return () => clearTimeout(timeout);
    }

    setIsPageComplete(true);

    if (pageIndex >= pages.length - 1 && !completedRef.current) {
      completedRef.current = true;
      if (onComplete) onComplete();
    }
  }, [currentIndex, currentPageText, pageIndex, pages.length, onComplete]);

  const showContinue = isPageComplete && pageIndex < pages.length - 1;
  const isInteractive = !isPageComplete || pageIndex < pages.length - 1;

  const handleAdvance = () => {
    if (!isPageComplete) {
      setDisplayedText(currentPageText);
      setCurrentIndex(currentPageText.length);
      return;
    }

    if (pageIndex < pages.length - 1) {
      setPageIndex((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "font-serif text-2xl md:text-3xl font-light text-[#e0d8d0] narrative-text",
        isInteractive ? 'cursor-pointer' : 'cursor-default',
        className
      )}
      onClick={isInteractive ? handleAdvance : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : -1}
      onKeyDown={(event) => {
        if (!isInteractive) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleAdvance();
        }
      }}
    >
      <span>{displayedText}</span>
      {currentIndex < currentPageText.length && (
        <span className="typewriter-cursor animate-pulse"></span>
      )}
      {showContinue && (
        <button
          type="button"
          onClick={handleAdvance}
          className="mt-4 block text-[10px] uppercase tracking-widest font-mono text-[var(--color-brand-accent)] hover:text-white/80 transition-colors"
        >
          Click to continue
        </button>
      )}
    </motion.div>
  );
};
