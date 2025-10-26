import React, { useEffect, useState } from 'react';
import { useFurigana } from '@/hooks';

interface FuriganaTextProps {
  text: string;
  showFurigana?: boolean;
  className?: string;
}

/**
 * Component for displaying Japanese text with optional furigana (ruby text)
 * Uses kuroshiro to automatically add furigana to kanji characters
 */
export function FuriganaText({ text, showFurigana = false, className = '' }: FuriganaTextProps) {
  const { isReady, convertToFurigana } = useFurigana();
  const [displayText, setDisplayText] = useState<string>(text);
  const [isConverting, setIsConverting] = useState(false);

  useEffect(() => {
    const convert = async () => {
      if (showFurigana && isReady && text) {
        setIsConverting(true);
        try {
          const furiganaText = await convertToFurigana(text);
          setDisplayText(furiganaText);
        } catch (error) {
          console.error('Failed to convert to furigana:', error);
          setDisplayText(text);
        } finally {
          setIsConverting(false);
        }
      } else {
        setDisplayText(text);
      }
    };

    convert();
  }, [text, showFurigana, isReady, convertToFurigana]);

  if (isConverting) {
    return <span className={className}>{text}</span>;
  }

  if (showFurigana && isReady) {
    // Render HTML with ruby tags
    return (
      <span
        className={className}
        dangerouslySetInnerHTML={{ __html: displayText }}
        style={
          {
            // Ruby text styling
            ruby: {
              rubyPosition: 'over',
            },
          } as React.CSSProperties
        }
      />
    );
  }

  return <span className={className}>{displayText}</span>;
}

/**
 * Inline styles for ruby text to ensure proper rendering
 * Add this to your global CSS or component styles
 */
export const furiganaStyles = `
  ruby {
    ruby-position: over;
  }

  rt {
    font-size: 0.5em;
    line-height: 1;
    user-select: none;
  }

  /* For better visual appearance */
  ruby > rt {
    opacity: 0.8;
  }
`;
