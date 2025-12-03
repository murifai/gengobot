'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/Card';
import { AvatarPicker } from '@/components/ui/avatar-picker';
import { ChevronLeft, Volume2 } from 'lucide-react';
import { toKatakana, isRomaji } from 'wanakana';
import { RelationshipType } from '@/types/character';

// OpenAI TTS voices
const OPENAI_VOICES = [
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

// Relationship types
const RELATIONSHIP_TYPES: { value: RelationshipType; label: string }[] = [
  { value: 'teman', label: 'Teman' },
  { value: 'guru', label: 'Guru' },
  { value: 'atasan', label: 'Atasan' },
  { value: 'pacar', label: 'Pacar' },
  { value: 'keluarga', label: 'Keluarga' },
  { value: 'lainnya', label: 'Lainnya' },
];

export default function NewCharacterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromPage = searchParams?.get('from');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '',
    voice: 'alloy',
    relationshipType: 'teman' as RelationshipType,
    relationshipCustom: '',
    speakingStyle: '',
  });

  // Preview converted name
  const [namePreview, setNamePreview] = useState<string | null>(null);

  // Update name preview when name changes
  useEffect(() => {
    if (formData.name && isRomaji(formData.name)) {
      setNamePreview(toKatakana(formData.name));
    } else {
      setNamePreview(null);
    }
  }, [formData.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Nama karakter wajib diisi');
      }

      if (formData.relationshipType === 'lainnya' && !formData.relationshipCustom.trim()) {
        throw new Error('Silakan isi hubungan kustom');
      }

      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || undefined,
          avatar: formData.avatar || undefined,
          voice: formData.voice,
          speakingStyle: formData.speakingStyle || undefined,
          relationshipType: formData.relationshipType,
          relationshipCustom:
            formData.relationshipType === 'lainnya' ? formData.relationshipCustom : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Gagal membuat karakter');
      }

      // Redirect based on where the user came from
      if (fromPage === 'free-chat') {
        router.push('/app/kaiwa/bebas');
      } else {
        router.push('/app/profile/characters');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const playVoiceSample = (voice: string) => {
    if (playingVoice === voice) return;

    setPlayingVoice(voice);
    const audio = new Audio(`/audio/${voice}.mp3`);
    audio.onended = () => {
      setPlayingVoice(null);
    };
    audio.onerror = () => {
      setPlayingVoice(null);
    };
    audio.play().catch(() => {
      setPlayingVoice(null);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-accent rounded-base transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-7 h-7 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold">Buat Karakter</h1>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar & Name */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Informasi Dasar</h2>

              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-2">
                  <AvatarPicker
                    value={formData.avatar}
                    onChange={url => setFormData({ ...formData, avatar: url })}
                    name={formData.name || 'Character'}
                    size="lg"
                  />
                  <span className="text-xs text-muted-foreground">Klik untuk ubah</span>
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Nama Karakter *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例: タナカ ユキ atau Tanaka Yuki"
                    required
                  />
                  {namePreview && (
                    <p className="text-sm text-muted-foreground">
                      Akan dikonversi ke: <span className="font-medium">{namePreview}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mahasiswa semester 5 yang suka anime dan gaming. Tinggal di Tokyo dan bekerja part-time di konbini."
                  rows={3}
                />
              </div>
            </div>

            {/* Voice Selection */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Suara</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {OPENAI_VOICES.map(voice => (
                  <div
                    key={voice.value}
                    onClick={() => setFormData({ ...formData, voice: voice.value })}
                    className={`relative p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                      formData.voice === voice.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{voice.label}</span>
                      <button
                        type="button"
                        className={`h-6 w-6 flex items-center justify-center rounded hover:bg-muted ${
                          playingVoice === voice.value ? 'text-primary' : 'text-muted-foreground'
                        }`}
                        onClick={e => {
                          e.stopPropagation();
                          playVoiceSample(voice.value);
                        }}
                        disabled={playingVoice === voice.value}
                      >
                        <Volume2
                          className={`h-3 w-3 ${playingVoice === voice.value ? 'animate-pulse' : ''}`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Relationship */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Hubungan</h2>

              <div>
                <Label htmlFor="relationshipType">Tipe Hubungan *</Label>
                <select
                  id="relationshipType"
                  value={formData.relationshipType}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      relationshipType: e.target.value as RelationshipType,
                    })
                  }
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {RELATIONSHIP_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.relationshipType === 'lainnya' && (
                <div>
                  <Label htmlFor="relationshipCustom">Hubungan Kustom *</Label>
                  <Input
                    id="relationshipCustom"
                    value={formData.relationshipCustom}
                    onChange={e => setFormData({ ...formData, relationshipCustom: e.target.value })}
                    placeholder="contoh: Tetangga, Rekan kerja senior, dll."
                    required
                  />
                </div>
              )}
            </div>

            {/* Speaking Style */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Gaya Bicara</h2>

              <div>
                <Label htmlFor="speakingStyle">Deskripsi Gaya Bicara</Label>
                <Textarea
                  id="speakingStyle"
                  value={formData.speakingStyle}
                  onChange={e => setFormData({ ...formData, speakingStyle: e.target.value })}
                  placeholder="contoh: Kasual, malu-malu, dialek Kansai, menggunakan keigo, dll."
                  rows={3}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Jelaskan bagaimana karakter ini berbicara dalam percakapan
                </p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-primary/10 border border-primary/30 rounded-md">
                <p className="text-primary text-sm">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Menyimpan...' : 'Buat Karakter'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
