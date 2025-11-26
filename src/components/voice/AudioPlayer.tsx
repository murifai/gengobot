'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioPlayerProps {
  src?: string | Blob;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number; // 0-1
  playbackRate?: number; // 0.5-2.0
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  showControls?: boolean;
  className?: string;
}

export default function AudioPlayer({
  src,
  autoPlay = false,
  loop = false,
  volume = 1.0,
  playbackRate = 1.0,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTimeUpdate,
  showControls = true,
  className = '',
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentVolume, setCurrentVolume] = useState(volume);
  const [currentPlaybackRate, setCurrentPlaybackRate] = useState(playbackRate);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sourceUrlRef = useRef<string | null>(null);

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
    setCurrentTime(0);
    onEnded?.();
  }, [onEnded]);

  const handleError = useCallback(() => {
    const errorMsg = 'Failed to load audio';
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
      onTimeUpdate?.(audioRef.current.currentTime, audioRef.current.duration);
    }
  }, [onTimeUpdate]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    // Set initial properties
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    audio.loop = loop;

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

      // Revoke object URL if exists
      if (sourceUrlRef.current) {
        URL.revokeObjectURL(sourceUrlRef.current);
      }
    };
  }, [
    handlePlay,
    handlePause,
    handleEnded,
    handleError,
    handleLoadedMetadata,
    handleTimeUpdate,
    volume,
    playbackRate,
    loop,
  ]);

  // Update audio source
  useEffect(() => {
    if (!audioRef.current || !src) return;

    // Revoke previous object URL
    if (sourceUrlRef.current) {
      URL.revokeObjectURL(sourceUrlRef.current);
      sourceUrlRef.current = null;
    }

    setError(null);
    setIsLoading(true);

    if (src instanceof Blob) {
      const url = URL.createObjectURL(src);
      sourceUrlRef.current = url;
      audioRef.current.src = url;
    } else {
      audioRef.current.src = src;
    }

    if (autoPlay) {
      audioRef.current.play().catch(err => {
        console.error('Auto-play failed:', err);
        setError('Auto-play is not allowed. Please click play.');
      });
    }
  }, [src, autoPlay]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = currentVolume;
    }
  }, [currentVolume]);

  // Update playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = currentPlaybackRate;
    }
  }, [currentPlaybackRate]);

  // Control functions
  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => {
        console.error('Play failed:', err);
        setError('Failed to play audio');
      });
    }
  }, []);

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

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setCurrentVolume(vol);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setCurrentPlaybackRate(rate);
  };

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

  return (
    <div className={`audio-player ${className}`}>
      {error && <div className="text-primary text-sm mb-2">{error}</div>}

      {showControls && (
        <div className="audio-controls space-y-3">
          {/* Play/Pause Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={isLoading || !!error}
              className="w-12 h-12 rounded-full disabled:opacity-50 text-white flex items-center justify-center transition-colors hover:brightness-90"
              style={{ backgroundColor: 'var(--primary)' }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
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
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Time Display */}
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-sm text-foreground/80">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>

              {/* Progress Bar */}
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                disabled={isLoading || !!error}
                className="w-full h-2 rounded-base appearance-none cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`,
                }}
              />
            </div>
          </div>

          {/* Additional Controls */}
          <div className="flex items-center gap-4 text-sm">
            {/* Volume Control */}
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-foreground/80" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={currentVolume}
                onChange={handleVolumeChange}
                className="w-20 h-1.5 bg-secondary-background rounded-base appearance-none cursor-pointer"
              />
              <span className="text-xs text-muted-foreground w-8">
                {Math.round(currentVolume * 100)}%
              </span>
            </div>

            {/* Playback Speed */}
            <div className="flex items-center gap-2">
              <span className="text-foreground/80">Speed:</span>
              <select
                value={currentPlaybackRate}
                onChange={e => handlePlaybackRateChange(parseFloat(e.target.value))}
                className="px-2 py-1 border-2 border-border rounded-base text-sm bg-background"
              >
                <option value="0.5">0.5x</option>
                <option value="0.75">0.75x</option>
                <option value="0.85">0.85x</option>
                <option value="1.0">1.0x</option>
                <option value="1.25">1.25x</option>
                <option value="1.5">1.5x</option>
                <option value="2.0">2.0x</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
