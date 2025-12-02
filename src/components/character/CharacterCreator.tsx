'use client';

import { useState, useEffect, useRef } from 'react';
import { CharacterCreationData, RelationshipType } from '@/types/character';
import { toKatakana, isRomaji } from 'wanakana';

interface CharacterCreatorProps {
  onCharacterCreated: (character: CharacterCreationData) => void;
  onCancel: () => void;
}

const relationshipTypes: { value: RelationshipType; label: string }[] = [
  { value: 'teman', label: 'Teman' },
  { value: 'guru', label: 'Guru' },
  { value: 'atasan', label: 'Atasan' },
  { value: 'pacar', label: 'Pacar' },
  { value: 'keluarga', label: 'Keluarga' },
  { value: 'lainnya', label: 'Lainnya' },
];

const voiceOptions = [
  { value: 'alloy', label: 'Alloy' },
  { value: 'ash', label: 'Ash' },
  { value: 'ballad', label: 'Ballad' },
  { value: 'coral', label: 'Coral' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'nova', label: 'Nova' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'sage', label: 'Sage' },
  { value: 'shimmer', label: 'Shimmer' },
  { value: 'verse', label: 'Verse' },
];

export function CharacterCreator({ onCharacterCreated, onCancel }: CharacterCreatorProps) {
  const [formData, setFormData] = useState<CharacterCreationData>({
    name: '',
    description: '',
    voice: 'alloy',
    speakingStyle: '',
    relationshipType: 'teman',
    relationshipCustom: '',
  });

  const [namePreview, setNamePreview] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playVoicePreview = (voiceValue: string) => {
    // Stop currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // If clicking the same voice, just stop
    if (playingVoice === voiceValue) {
      setPlayingVoice(null);
      return;
    }

    // Play new audio
    const audio = new Audio(`/audio/${voiceValue}.mp3`);
    audioRef.current = audio;
    setPlayingVoice(voiceValue);

    audio.play().catch(() => {
      setPlayingVoice(null);
    });

    audio.onended = () => {
      setPlayingVoice(null);
      audioRef.current = null;
    };
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Update name preview when name changes
  useEffect(() => {
    if (formData.name && isRomaji(formData.name)) {
      setNamePreview(toKatakana(formData.name));
    } else {
      setNamePreview(null);
    }
  }, [formData.name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate custom relationship
    if (formData.relationshipType === 'lainnya' && !formData.relationshipCustom?.trim()) {
      alert('Silakan isi hubungan kustom');
      return;
    }

    onCharacterCreated(formData);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">Buat Karakter Baru</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            Nama Karakter *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="例: タナカ ユキ atau Tanaka Yuki"
            required
          />
          {namePreview && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Akan dikonversi ke: <span className="font-medium">{namePreview}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            Deskripsi
          </label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Mahasiswa semester 5 yang suka anime dan gaming. Tinggal di Tokyo dan bekerja part-time di konbini."
            rows={3}
          />
        </div>

        {/* Voice Selection */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            Suara *
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {voiceOptions.map(voice => (
              <div
                key={voice.value}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.voice === voice.value
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-300 dark:border-gray-600 hover:border-primary/50'
                }`}
                onClick={() => setFormData({ ...formData, voice: voice.value })}
              >
                <span className="text-sm font-medium text-dark dark:text-white">{voice.label}</span>
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    playVoicePreview(voice.value);
                  }}
                  className={`p-1 rounded-full transition-colors ${
                    playingVoice === voice.value
                      ? 'text-primary bg-primary/20'
                      : 'text-gray-500 hover:text-primary hover:bg-primary/10'
                  }`}
                  title={playingVoice === voice.value ? 'Stop' : 'Preview'}
                >
                  {playingVoice === voice.value ? (
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

        {/* Relationship Type */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            Tipe Hubungan *
          </label>
          <select
            value={formData.relationshipType}
            onChange={e =>
              setFormData({
                ...formData,
                relationshipType: e.target.value as RelationshipType,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {relationshipTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Custom Relationship */}
        {formData.relationshipType === 'lainnya' && (
          <div>
            <label className="block text-sm font-medium text-dark dark:text-white mb-2">
              Hubungan Kustom *
            </label>
            <input
              type="text"
              value={formData.relationshipCustom || ''}
              onChange={e => setFormData({ ...formData, relationshipCustom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="contoh: Tetangga, Rekan kerja senior, dll."
              required
            />
          </div>
        )}

        {/* Speaking Style */}
        <div>
          <label className="block text-sm font-medium text-dark dark:text-white mb-2">
            Gaya Bicara
          </label>
          <textarea
            value={formData.speakingStyle}
            onChange={e => setFormData({ ...formData, speakingStyle: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-dark dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="contoh: Kasual, malu-malu, dialek Kansai, menggunakan keigo, dll."
            rows={3}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Jelaskan bagaimana karakter ini berbicara dalam percakapan
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Buat Karakter
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-600 text-dark dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
