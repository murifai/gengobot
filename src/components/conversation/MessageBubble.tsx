'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { convertToRuby, hasFurigana } from '@/lib/utils/furigana';
import TokenizedText from '@/components/vocabulary/TokenizedText';

export interface MessageBubbleProps {
  content: string;
  isUser: boolean;
  timestamp?: Date;
  avatar?: string;
  audioUrl?: string;
  autoPlay?: boolean;
  showFurigana?: boolean;
}

export default function MessageBubble({
  content,
  isUser,
  timestamp,
  avatar,
  audioUrl,
  autoPlay = false,
  showFurigana: showFuriganaDefault = true,
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFurigana, setShowFurigana] = useState(showFuriganaDefault);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoPlayed = useRef(false);

  // Check if content has furigana
  const contentHasFurigana = hasFurigana(content);

  // Debug logging
  useEffect(() => {
    if (contentHasFurigana) {
      console.log('[MessageBubble] Message with furigana detected:', {
        content: content.substring(0, 50),
        hasFurigana: contentHasFurigana,
      });
    }
  }, [content, contentHasFurigana]);

  // Process content for furigana display
  const processedContent = showFurigana && contentHasFurigana ? convertToRuby(content) : content;

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    if (!audioRef.current || !audioUrl) return;

    const audio = audioRef.current;

    const handleEnded = () => setIsPlaying(false);
    const handleError = (e: Event) => {
      const error = (e.target as HTMLMediaElement).error;
      console.error('Audio playback error:', {
        code: error?.code,
        message: error?.message,
        audioUrlLength: audioUrl.length,
        audioUrlPrefix: audioUrl.substring(0, 50),
      });
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('Audio can play, duration:', audio.duration);
      // Auto-play if enabled and hasn't played yet
      if (autoPlay && !hasAutoPlayed.current) {
        hasAutoPlayed.current = true;
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('Auto-play failed:', err);
          });
      }
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [audioUrl, autoPlay]);

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-primary text-white' : 'bg-secondary text-white'
        )}
      >
        {avatar ? (
          <img src={avatar} alt="Avatar" className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-sm font-medium">{isUser ? 'You' : 'AI'}</span>
        )}
      </div>

      {/* Message Content */}
      <div className={cn('flex max-w-[70%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        <div className="flex items-start gap-2">
          <div
            className={cn(
              'rounded-2xl px-4 py-3',
              isUser
                ? 'bg-primary text-white rounded-br-sm'
                : 'bg-card-background border border-border rounded-bl-sm'
            )}
          >
            {showFurigana && contentHasFurigana ? (
              <div
                className="whitespace-pre-wrap text-sm furigana-text"
                dangerouslySetInnerHTML={{ __html: processedContent }}
                style={{
                  lineHeight: '2.5em', // Extra space for furigana
                }}
              />
            ) : isUser ? (
              // User messages: plain text
              <p className="whitespace-pre-wrap text-sm">{content}</p>
            ) : (
              // AI messages: tokenized with clickable vocabulary
              <TokenizedText text={content} className="whitespace-pre-wrap text-sm" />
            )}
          </div>

          {/* Furigana Toggle Button */}
          {contentHasFurigana && (
            <button
              onClick={() => setShowFurigana(!showFurigana)}
              className={cn(
                'flex items-center justify-center w-8 h-8 rounded-lg transition-colors shrink-0',
                isUser
                  ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                  : 'bg-secondary/10 hover:bg-secondary/20 text-secondary'
              )}
              aria-label={showFurigana ? 'Hide furigana' : 'Show furigana'}
              title={showFurigana ? 'Hide furigana' : 'Show furigana'}
            >
              <span className="text-xs font-medium">{showFurigana ? 'あ' : 'ア'}</span>
            </button>
          )}
        </div>

        {/* Audio Player for AI responses */}
        {!isUser && audioUrl && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="flex items-center gap-2 rounded-lg bg-secondary/10 hover:bg-secondary/20 px-3 py-1.5 text-xs transition-colors"
              aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span>{isPlaying ? 'Pause' : 'Play'} Audio</span>
            </button>
            <audio ref={audioRef} src={audioUrl} preload="metadata" />
          </div>
        )}

        {timestamp && (
          <span className="mt-1 text-xs text-foreground/50">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>
    </div>
  );
}
