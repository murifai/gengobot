'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Plus, Pencil, Trash2, Loader2, LayoutGrid, List } from 'lucide-react';

interface Character {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  personality: {
    type: string;
    traits?: string[];
  };
  isUserCreated: boolean;
}

type ViewMode = 'grid' | 'list';

export function CharactersTab() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/characters');
      if (!response.ok) throw new Error('Gagal memuat karakter');
      const data = await response.json();
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const deleteCharacter = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus karakter "${name}"?`)) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Gagal menghapus karakter');

      setCharacters(characters.filter(c => c.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus karakter');
    } finally {
      setDeletingId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-500',
      'bg-orange-500',
      'bg-amber-500',
      'bg-yellow-500',
      'bg-lime-500',
      'bg-green-500',
      'bg-emerald-500',
      'bg-teal-500',
      'bg-cyan-500',
      'bg-sky-500',
      'bg-blue-500',
      'bg-indigo-500',
      'bg-violet-500',
      'bg-purple-500',
      'bg-fuchsia-500',
      'bg-pink-500',
      'bg-rose-500',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Karakter AI
            </CardTitle>
            <CardDescription>Kelola karakter AI untuk latihan percakapan</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-r-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                className="h-8 w-8 rounded-l-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
            </div>
            <Link href="/app/profile/characters/new">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Baru
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Memuat karakter...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={fetchCharacters} variant="outline" size="sm">
              Coba Lagi
            </Button>
          </div>
        ) : characters.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-6" />
            <h3 className="text-lg font-medium mb-2">Belum Ada Karakter</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Buat karakter AI pertama Anda untuk memulai latihan percakapan bahasa Jepang
            </p>
            <Link href="/app/profile/characters/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Buat Karakter
              </Button>
            </Link>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-3">
            {characters.map(character => (
              <div
                key={character.id}
                className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-10 w-10">
                  {character.avatar && <AvatarImage src={character.avatar} alt={character.name} />}
                  <AvatarFallback
                    className={`${getAvatarColor(character.name)} text-white text-sm font-medium`}
                  >
                    {getInitials(character.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-sm truncate">{character.name}</h4>
                    {character.isUserCreated && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  {character.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {character.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push(`/app/profile/characters/${character.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  {character.isUserCreated && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteCharacter(character.id, character.name)}
                      disabled={deletingId === character.id}
                    >
                      {deletingId === character.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Hapus</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {characters.map(character => (
              <div
                key={character.id}
                className="flex flex-col items-center p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-16 w-16 mb-3">
                  {character.avatar && <AvatarImage src={character.avatar} alt={character.name} />}
                  <AvatarFallback
                    className={`${getAvatarColor(character.name)} text-white text-lg font-medium`}
                  >
                    {getInitials(character.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center w-full mb-3">
                  <div className="flex items-center justify-center gap-1.5">
                    <h4 className="font-medium text-sm truncate">{character.name}</h4>
                    {character.isUserCreated && (
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-primary/10 text-primary rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  {character.description && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {character.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => router.push(`/app/profile/characters/${character.id}/edit`)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  {character.isUserCreated && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => deleteCharacter(character.id, character.name)}
                      disabled={deletingId === character.id}
                    >
                      {deletingId === character.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Hapus</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
