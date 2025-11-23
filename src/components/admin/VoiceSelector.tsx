'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// OpenAI TTS voices with descriptions
const VOICE_OPTIONS = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral and balanced voice', gender: 'neutral' },
  { id: 'ash', name: 'Ash', description: 'Warm and engaging voice', gender: 'male' },
  { id: 'ballad', name: 'Ballad', description: 'Soft and melodic voice', gender: 'female' },
  { id: 'coral', name: 'Coral', description: 'Clear and friendly voice', gender: 'female' },
  { id: 'echo', name: 'Echo', description: 'Deep and resonant voice', gender: 'male' },
  { id: 'fable', name: 'Fable', description: 'Expressive storytelling voice', gender: 'female' },
  { id: 'nova', name: 'Nova', description: 'Energetic and youthful voice', gender: 'female' },
  { id: 'onyx', name: 'Onyx', description: 'Deep and authoritative voice', gender: 'male' },
  { id: 'sage', name: 'Sage', description: 'Calm and wise voice', gender: 'neutral' },
  { id: 'shimmer', name: 'Shimmer', description: 'Bright and cheerful voice', gender: 'female' },
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectedVoice = VOICE_OPTIONS.find(v => v.id === voice);

  const handlePlaySample = async (voiceId: string) => {
    // Stop current playback if any
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same voice that's playing, just stop
    if (playingVoice === voiceId && isPlaying) {
      setIsPlaying(false);
      setPlayingVoice(null);
      return;
    }

    setIsPlaying(true);
    setPlayingVoice(voiceId);

    try {
      // Try to play from static samples first
      const samplePath = `/audio/voices/${voiceId}-sample.mp3`;
      const audio = new Audio(samplePath);
      audioRef.current = audio;

      audio.onended = () => {
        setIsPlaying(false);
        setPlayingVoice(null);
      };

      audio.onerror = () => {
        // Sample not available, show message
        console.log(`Voice sample for ${voiceId} not available`);
        setIsPlaying(false);
        setPlayingVoice(null);
      };

      await audio.play();
    } catch (error) {
      console.error('Error playing voice sample:', error);
      setIsPlaying(false);
      setPlayingVoice(null);
    }
  };

  const formatSpeed = (speed: number) => {
    return speed.toFixed(2) + 'x';
  };

  return (
    <div className="space-y-4">
      {/* Voice Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Voice <span className="text-primary">*</span>
        </label>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Select the AI voice for this task conversation
        </p>

        <div className="flex gap-2">
          <Select value={voice} onValueChange={onVoiceChange}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
              {VOICE_OPTIONS.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{option.name}</span>
                    <span className="text-xs text-gray-500">({option.gender})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handlePlaySample(voice)}
                  disabled={!voice}
                  className="px-3"
                >
                  {isPlaying && playingVoice === voice ? (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <rect x="6" y="4" width="4" height="16" />
                        <rect x="14" y="4" width="4" height="16" />
                      </svg>
                      Stop
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Preview
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Play voice sample</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Voice description */}
        {selectedVoice && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
            {selectedVoice.description}
          </p>
        )}
      </div>

      {/* Speaking Speed */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-secondary"
          />
          <div className="w-16 text-center">
            <span className="font-mono text-sm font-medium text-gray-700 dark:text-gray-300">
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

      {/* Voice list for quick reference */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          All Available Voices
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {VOICE_OPTIONS.map(option => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onVoiceChange(option.id);
                handlePlaySample(option.id);
              }}
              className={`p-2 text-left rounded-lg border transition-all ${
                voice === option.id
                  ? 'border-secondary bg-secondary/10 text-secondary'
                  : 'border-gray-200 dark:border-gray-700 hover:border-secondary/50 hover:bg-secondary/5'
              }`}
            >
              <div className="font-medium text-sm">{option.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{option.gender}</div>
              {isPlaying && playingVoice === option.id && (
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1 text-xs text-secondary">
                    <span className="w-1 h-1 bg-secondary rounded-full animate-pulse" />
                    Playing
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
