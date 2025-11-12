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
  showParser?: boolean;
}

export default function MessageBubble({
  content,
  isUser,
  timestamp,
  avatar,
  audioUrl,
  autoPlay = false,
  showFurigana: showFuriganaDefault = true,
  showParser: showParserDefault = true,
}: MessageBubbleProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFurigana, setShowFurigana] = useState(showFuriganaDefault);
  const [showParser, setShowParser] = useState(showParserDefault);
  const audioRef = useRef<HTMLAudioElement>(null);
  const hasAutoPlayed = useRef(false);

  // Check if content has furigana
  const contentHasFurigana = hasFurigana(content);

  // Debug logging
  useEffect(() => {
    console.log('[MessageBubble] Rendered:', {
      isUser,
      hasAudioUrl: !!audioUrl,
      audioUrl: audioUrl ? audioUrl.substring(0, 50) + '...' : 'none',
      autoPlay,
      contentPreview: content.substring(0, 30),
    });

    if (contentHasFurigana) {
      console.log('[MessageBubble] Message with furigana detected:', {
        content: content.substring(0, 50),
        hasFurigana: contentHasFurigana,
      });
    }
  }, [content, contentHasFurigana, audioUrl, autoPlay, isUser]);

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
    console.log('[MessageBubble] Audio effect triggered:', {
      hasAudioRef: !!audioRef.current,
      audioUrl,
      autoPlay,
      hasAutoPlayed: hasAutoPlayed.current,
    });

    if (!audioRef.current || !audioUrl) {
      console.log('[MessageBubble] Skipping audio setup - no ref or URL');
      return;
    }

    const audio = audioRef.current;

    const handleEnded = () => {
      console.log('[MessageBubble] Audio ended');
      setIsPlaying(false);
    };

    const handleError = (e: Event) => {
      const error = (e.target as HTMLMediaElement).error;
      console.error('[MessageBubble] Audio playback error:', {
        code: error?.code,
        message: error?.message,
        audioUrlLength: audioUrl.length,
        audioUrlPrefix: audioUrl.substring(0, 50),
        audioUrl: audioUrl,
      });
      setIsPlaying(false);
    };

    const handleCanPlay = () => {
      console.log('[MessageBubble] Audio can play:', {
        duration: audio.duration,
        autoPlay,
        hasAutoPlayed: hasAutoPlayed.current,
        willAutoPlay: autoPlay && !hasAutoPlayed.current,
      });

      // Auto-play if enabled and hasn't played yet
      if (autoPlay && !hasAutoPlayed.current) {
        console.log('[MessageBubble] Starting auto-play...');
        hasAutoPlayed.current = true;
        audio
          .play()
          .then(() => {
            console.log('[MessageBubble] Auto-play started successfully');
            setIsPlaying(true);
          })
          .catch(err => {
            console.error('[MessageBubble] Auto-play failed:', err);
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
          ) : showParser ? (
            // AI messages: tokenized with clickable vocabulary
            <TokenizedText text={content} className="whitespace-pre-wrap text-sm" />
          ) : (
            // AI messages: plain text (parser disabled)
            <p className="whitespace-pre-wrap text-sm">{content}</p>
          )}

          {/* Toggle Buttons Container - Bottom of bubble */}
          {!isUser && (
            <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
              {/* Parser Toggle Button */}
              <button
                onClick={() => setShowParser(!showParser)}
                className="flex items-center justify-center px-2 py-1 rounded transition-colors bg-white dark:bg-gray-700 text-primary hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                aria-label={showParser ? 'Disable text parser' : 'Enable text parser'}
                title={showParser ? 'Disable text parser' : 'Enable text parser'}
              >
                <span className="text-xs font-medium">{showParser ? '辞' : '文'}</span>
              </button>

              {/* Furigana Toggle Button */}
              {contentHasFurigana && (
                <button
                  onClick={() => setShowFurigana(!showFurigana)}
                  className="flex items-center justify-center px-2 py-1 rounded transition-colors bg-white dark:bg-gray-700 text-primary hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600"
                  aria-label={showFurigana ? 'Hide furigana' : 'Show furigana'}
                  title={showFurigana ? 'Hide furigana' : 'Show furigana'}
                >
                  <span className="text-xs font-medium">{showFurigana ? 'あ' : 'ア'}</span>
                </button>
              )}
            </div>
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
