'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface DeckEditPageProps {
  params: Promise<{ deckId: string }>;
}

export default function DeckEditPage({ params }: DeckEditPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    difficulty: '',
    isPublic: false,
  });

  const fetchDeck = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/decks/${resolvedParams.deckId}`);
      if (response.ok) {
        const deck = await response.json();
        setFormData({
          name: deck.name,
          description: deck.description || '',
          category: deck.category || '',
          difficulty: deck.difficulty || '',
          isPublic: deck.isPublic,
        });
      } else {
        alert('Gagal memuat dek');
        router.push('/app/drill');
      }
    } catch (error) {
      console.error('Error fetching deck:', error);
      alert('Gagal memuat dek');
      router.push('/app/drill');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedParams.deckId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Nama dek wajib diisi');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/decks/${resolvedParams.deckId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Dek berhasil diperbarui!');
        router.push(`/app/drill/decks/${resolvedParams.deckId}`);
      } else {
        const data = await response.json();
        alert(`Gagal memperbarui dek: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating deck:', error);
      alert('Gagal memperbarui dek. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `⚠️ PERINGATAN: Hapus "${formData.name}"?\n\n` +
        'Ini akan menghapus secara permanen:\n' +
        '• Dek ini\n' +
        '• Semua kartu dalam dek ini\n' +
        '• Semua sesi belajar untuk dek ini\n\n' +
        'Tindakan ini TIDAK BISA dibatalkan!\n\n' +
        'Klik OK untuk konfirmasi penghapusan.'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/decks/${resolvedParams.deckId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Dek berhasil dihapus');
        router.push('/app/drill');
      } else {
        const data = await response.json();
        alert(`Gagal menghapus dek: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Gagal menghapus dek. Silakan coba lagi.');
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/decks/${resolvedParams.deckId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${formData.name.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Gagal ekspor dek');
      }
    } catch (error) {
      console.error('Error exporting deck:', error);
      alert('Gagal ekspor dek');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Memuat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/app/drill/decks/${resolvedParams.deckId}`)}
            className="p-2 hover:bg-accent rounded-base transition-colors"
            aria-label="Kembali"
          >
            <ChevronLeft className="w-7 h-7 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Edit Dek</h1>
            <p className="text-sm text-muted-foreground">Ubah pengaturan dek</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Quick Actions */}
        <div className="mb-6">
          <Button variant="secondary" className="gap-2 w-full" onClick={handleExport}>
            <Download size={16} />
            Ekspor ke Excel
          </Button>
        </div>

        {/* Form */}
        <div className="bg-card rounded-lg shadow-sm p-6 border-2 border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Deck Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nama Dek *</label>
              <Input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Kosakata JLPT N5"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Deskripsi</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Jelaskan isi dan tujuan dek ini..."
                className="w-full px-3 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                rows={4}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Kategori</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Pilih kategori (opsional)</option>
                <option value="Kanji">Kanji</option>
                <option value="Vocabulary">Kosakata</option>
                <option value="Grammar">Tata Bahasa</option>
                <option value="Mixed">Campuran</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tingkat Kesulitan (Level JLPT)
              </label>
              <select
                value={formData.difficulty}
                onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border-2 border-border rounded-base bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Pilih tingkat kesulitan (opsional)</option>
                <option value="N5">N5 (Pemula)</option>
                <option value="N4">N4</option>
                <option value="N3">N3 (Menengah)</option>
                <option value="N2">N2</option>
                <option value="N1">N1 (Mahir)</option>
              </select>
            </div>

            {/* Public/Private */}
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={e => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                />
                <span className="text-sm font-medium text-foreground">
                  Jadikan dek ini publik (terlihat oleh semua pengguna)
                </span>
              </label>
              <p className="text-xs text-muted-foreground mt-1 ml-6">
                Dek publik dapat dilihat dan dipelajari oleh semua pengguna
              </p>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" variant="default" disabled={saving} className="flex-1">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/app/drill/decks/${resolvedParams.deckId}`)}
                disabled={saving}
              >
                Batal
              </Button>
            </div>
          </form>

          {/* Danger Zone */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-lg font-semibold text-primary mb-4">Zona Berbahaya</h3>
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-primary">Hapus dek ini</h4>
                  <p className="text-sm text-primary/80 mt-1">
                    Hapus permanen dek ini beserta semua kartunya. Tindakan ini tidak bisa
                    dibatalkan.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleDelete}
                  className="ml-4 gap-2 bg-primary hover:brightness-90 text-white"
                >
                  <Trash2 size={16} />
                  Hapus Dek
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-secondary/10 border border-secondary/30 rounded-lg p-4">
          <h3 className="font-semibold text-secondary mb-2">Mengelola Dek</h3>
          <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
            <li>Ekspor dek ke format Excel untuk backup atau berbagi</li>
            <li>Jenis kartu yang didukung: Kanji, Kosakata, dan Tata Bahasa</li>
            <li>Dek publik terlihat oleh semua pengguna di browser studi</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
