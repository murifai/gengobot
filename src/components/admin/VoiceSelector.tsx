'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';

// OpenAI TTS voices
const VOICE_OPTIONS = [
  { id: 'alloy', name: 'Alloy' },
  { id: 'ash', name: 'Ash' },
  { id: 'ballad', name: 'Ballad' },
  { id: 'coral', name: 'Coral' },
  { id: 'echo', name: 'Echo' },
  { id: 'fable', name: 'Fable' },
  { id: 'nova', name: 'Nova' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'sage', name: 'Sage' },
  { id: 'shimmer', name: 'Shimmer' },
  { id: 'verse', name: 'Verse' },
] as const;

interface VoiceSelectorProps {
  voice: string;
  speakingSpeed: number;
  onVoiceChange: (voice: string) => void;
  onSpeedChange: (speed: number) => void;
}

export default function VoiceSelector({
  voice,
  speakingSpeed,
  onVoiceChange,
  onSpeedChange,
}: VoiceSelectorProps) {
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlaySample = (voiceId: string) => {
    // Stop current playback if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same voice that's playing, just stop
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceId);

    // Play from static samples
    const audio = new Audio(`/audio/${voiceId}.mp3`);
    audioRef.current = audio;

    audio.onended = () => {
      setPlayingVoice(null);
      audioRef.current = null;
    };

    audio.onerror = () => {
      setPlayingVoice(null);
      audioRef.current = null;
    };

    audio.play().catch(() => {
      setPlayingVoice(null);
      audioRef.current = null;
    });
  };

  const formatSpeed = (speed: number) => {
    return speed.toFixed(2) + 'x';
  };

  return (
    <div className="space-y-4">
      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Voice <span className="text-primary">*</span>
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Select the AI voice for this task conversation
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {VOICE_OPTIONS.map(option => (
            <div
              key={option.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                voice === option.id
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
              }`}
              onClick={() => onVoiceChange(option.id)}
            >
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {option.name}
              </span>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handlePlaySample(option.id);
                }}
                className={`p-1 rounded-full transition-colors ${
                  playingVoice === option.id
                    ? 'text-primary bg-primary/20'
                    : 'text-gray-500 hover:text-primary hover:bg-primary/10'
                }`}
                title={playingVoice === option.id ? 'Stop' : 'Preview'}
              >
                {playingVoice === option.id ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <rect x="6" y="5" width="3" height="10" rx="1" />
                    <rect x="11" y="5" width="3" height="10" rx="1" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Speaking Speed */}
      <div>
        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
          Speaking Speed
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Adjust the voice speed (0.25x - 4.0x)
        </p>

        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0.25"
            max="4.0"
            step="0.05"
            value={speakingSpeed}
            onChange={e => onSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary"
          />
          <div className="w-16 text-center">
            <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
              {formatSpeed(speakingSpeed)}
            </span>
          </div>
        </div>

        {/* Speed presets */}
        <div className="flex gap-2 mt-3">
          <Button
            type="button"
            variant={speakingSpeed === 0.75 ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onSpeedChange(0.75)}
            className="text-xs"
          >
            Slow (0.75x)
          </Button>
          <Button
            type="button"
            variant={speakingSpeed === 1.0 ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onSpeedChange(1.0)}
            className="text-xs"
          >
            Normal (1.0x)
          </Button>
          <Button
            type="button"
            variant={speakingSpeed === 1.25 ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onSpeedChange(1.25)}
            className="text-xs"
          >
            Fast (1.25x)
          </Button>
        </div>
      </div>
    </div>
  );
}
