'use client';

import { useState, useEffect } from 'react';
import {
  tokenizeJapanese,
  VocabularyInfo,
  shouldHighlightToken,
} from '@/lib/utils/kuromoji-parser';
import VocabularyDetail from './VocabularyDetail';

interface TokenizedTextProps {
  text: string;
  className?: string;
}

export default function TokenizedText({ text, className = '' }: TokenizedTextProps) {
  const [tokens, setTokens] = useState<VocabularyInfo[]>([]);
  const [selectedVocab, setSelectedVocab] = useState<VocabularyInfo | null>(null);
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function parseText() {
      setIsLoading(true);
      try {
        const parsedTokens = await tokenizeJapanese(text);
        if (isMounted) {
          setTokens(parsedTokens);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to tokenize text:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    parseText();

    return () => {
      isMounted = false;
    };
  }, [text]);

  const handleTokenClick = (vocab: VocabularyInfo, event: React.MouseEvent) => {
    if (!shouldHighlightToken(vocab)) return;

    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setClickPosition({
      x: rect.left,
      y: rect.bottom + 5, // 5px below the clicked element
    });
    setSelectedVocab(vocab);
  };

  const handleCloseDetail = () => {
    setSelectedVocab(null);
    setClickPosition(undefined);
  };

  // Show loading state or plain text while tokenizing
  if (isLoading) {
    return <span className={className}>{text}</span>;
  }

  // Fallback to plain text if tokenization failed
  if (tokens.length === 0) {
    return <span className={className}>{text}</span>;
  }

  return (
    <>
      <span className={className}>
        {tokens.map((vocab, index) => {
          const isClickable = shouldHighlightToken(vocab);

          return (
            <span
              key={`${vocab.word}-${index}`}
              onClick={e => handleTokenClick(vocab, e)}
              className={
                isClickable
                  ? 'cursor-pointer hover:bg-secondary/10 hover:text-secondary rounded px-0.5 transition-colors duration-150 underline decoration-primary/50 decoration-1 underline-offset-2'
                  : ''
              }
              style={{ display: 'inline' }}
            >
              {vocab.word}
            </span>
          );
        })}
      </span>

      {/* Vocabulary Detail Popup */}
      {selectedVocab && (
        <VocabularyDetail
          vocab={selectedVocab}
          onClose={handleCloseDetail}
          position={clickPosition}
        />
      )}
    </>
  );
}
