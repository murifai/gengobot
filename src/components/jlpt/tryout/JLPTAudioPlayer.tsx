'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export interface JLPTAudioPlayerProps {
  src: string;
  maxReplays?: number; // Maximum number of replays allowed (JLPT restriction)
  autoPlay?: boolean;
  onReplayLimitReached?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

export function JLPTAudioPlayer({
  src,
  maxReplays = 2, // JLPT typically allows 2 replays
  autoPlay = false,
  onReplayLimitReached,
  onPlay,
  onPause,
  onEnded,
  onError,
  className,
}: JLPTAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playCount, setPlayCount] = useState(0);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Check if replay limit reached
  const isReplayLimitReached = playCount >= maxReplays + 1; // +1 for initial play

  // Event handlers
  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    onPlay?.();
  }, [onPlay]);

  const handlePause = useCallback(() => {
    setIsPlaying(false);
    onPause?.();
  }, [onPause]);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setHasPlayedOnce(true);
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const errorMsg = '音声ファイルの読み込みに失敗しました';
    setError(errorMsg);
    setIsLoading(false);
    onError?.(new Error(errorMsg));
  }, [onError]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Event listeners
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadstart', () => setIsLoading(true));
    audio.addEventListener('canplay', () => setIsLoading(false));

    return () => {
      audio.pause();
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadedMetadata,
    handleTimeUpdate,
  ]);

  // Update audio source
  useEffect(() => {
    if (!audioRef.current || !src) return;

    setError(null);
    setIsLoading(true);
    audioRef.current.src = src;

    if (autoPlay) {
      audioRef.current.play().catch(err => {
        console.error('Auto-play failed:', err);
        setError('自動再生できませんでした。再生ボタンをクリックしてください。');
      });
    }
  }, [src, autoPlay]);

  // Control functions
  const play = useCallback(() => {
    if (!audioRef.current || isReplayLimitReached) return;

    // Increment play count on new play
    if (currentTime === 0 || hasPlayedOnce) {
      const newPlayCount = playCount + 1;
      setPlayCount(newPlayCount);
      setHasPlayedOnce(false);

      // Check if this was the last allowed play
      if (newPlayCount >= maxReplays + 1) {
        onReplayLimitReached?.();
      }
    }

    audioRef.current.play().catch(err => {
      console.error('Play failed:', err);
      setError('音声の再生に失敗しました');
    });
  }, [playCount, maxReplays, onReplayLimitReached, currentTime, hasPlayedOnce, isReplayLimitReached]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const replay = useCallback(() => {
    if (!audioRef.current || isReplayLimitReached) return;

    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setHasPlayedOnce(false);

    const newPlayCount = playCount + 1;
    setPlayCount(newPlayCount);

    if (newPlayCount >= maxReplays + 1) {
      onReplayLimitReached?.();
    }

    audioRef.current.play().catch(err => {
      console.error('Replay failed:', err);
      setError('音声の再生に失敗しました');
    });
  }, [playCount, maxReplays, onReplayLimitReached, isReplayLimitReached]);

  // Format time
  const formatTime = (seconds: number): string => {
    if (!isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!src) {
    return null;
  }

  const replaysRemaining = Math.max(0, maxReplays + 1 - playCount - (isPlaying ? 1 : 0));

  return (
    <div className={cn('jlpt-audio-player border-2 border-primary/20 rounded-lg p-4 bg-primary/5', className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Volume2 className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">リスニング問題</span>
      </div>

      {error && (
        <div className="text-destructive text-sm mb-3 p-2 bg-destructive/10 rounded">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={togglePlay}
            disabled={isLoading || !!error || isReplayLimitReached}
            size="lg"
            className="shrink-0"
            variant="default"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
            <span className="ml-2">{isPlaying ? '一時停止' : '再生'}</span>
          </Button>

          <Button
            onClick={replay}
            disabled={isLoading || !!error || isReplayLimitReached || playCount === 0}
            size="lg"
            variant="outline"
            className="shrink-0"
          >
            <RotateCcw className="h-5 w-5" />
            <span className="ml-2">もう一度</span>
          </Button>

          {/* Time Display */}
          <div className="flex-1 text-right">
            <div className="text-sm text-muted-foreground">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Replay Counter */}
        <div className="flex items-center justify-between text-sm">
          <div className={cn(
            'font-medium',
            isReplayLimitReached ? 'text-destructive' : 'text-muted-foreground'
          )}>
            {isReplayLimitReached ? (
              '再生回数の上限に達しました'
            ) : playCount === 0 ? (
              `再生可能回数: ${maxReplays + 1}回`
            ) : (
              `残り再生回数: ${replaysRemaining}回`
            )}
          </div>

          {playCount > 0 && !isReplayLimitReached && (
            <div className="text-xs text-muted-foreground">
              ({playCount} / {maxReplays + 1} 回再生済み)
            </div>
          )}
        </div>

        {/* JLPT Notice */}
        <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
          ⚠️ JLPT本番と同様に、音声の再生回数に制限があります
        </div>
      </div>
    </div>
  );
}
