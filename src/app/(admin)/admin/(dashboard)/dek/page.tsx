'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Copy,
  Loader2,
  Layers,
  CheckSquare,
  Square,
  Globe,
  Lock,
  MoreHorizontal,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Deck } from '@/types/deck';
import { ImportConfirmationModal } from '@/components/admin/ImportConfirmationModal';

export const dynamic = 'force-dynamic';

interface DeckWithDetails extends Deck {
  creator: {
    id: string;
    name: string | null;
    email: string;
  };
  _count?: {
    flashcards: number;
  };
  isTaskDeck?: boolean;
}

interface BulkImportResult {
  fileName: string;
  deckName: string;
  success: boolean;
  deckId?: string;
  cardsImported: number;
  errors: Array<{ row: number; message: string }>;
}

export default function AdminDecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterTaskDeck, setFilterTaskDeck] = useState<string>('all'); // all, task, regular
  const [filterVisibility, setFilterVisibility] = useState<string>('all'); // all, public, private
  const [selectedDecks, setSelectedDecks] = useState<Set<string>>(new Set());
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    success: boolean;
    deckId?: string;
    cardsImported: number;
    errors: Array<{ row: number; message: string }>;
  } | null>(null);
  const [bulkImportResults, setBulkImportResults] = useState<{
    summary: { total: number; successful: number; failed: number; totalCardsImported: number };
    results: BulkImportResult[];
  } | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [isBulkImport, setIsBulkImport] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      setLoading(true);
      // Admin can see all decks (no isPublic filter)
      const response = await fetch('/api/decks?limit=100');
      if (response.ok) {
        const data = await response.json();
        setDecks(data.decks || []);
      }
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (deckId: string, deckName: string) => {
    const confirmDelete = window.confirm(
      `⚠️ WARNING: Delete "${deckName}"?\n\n` +
        'This will permanently delete:\n' +
        '• The deck\n' +
        '• All flashcards in this deck\n' +
        '• All study sessions for this deck\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Click OK to confirm deletion.'
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Deck deleted successfully');
        fetchDecks();
      } else {
        const data = await response.json();
        alert(`Failed to delete deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting deck:', error);
      alert('Failed to delete deck. Please try again.');
    }
  };

  const handleDuplicate = async (deckId: string, deckName: string) => {
    const newName = window.prompt(`Enter a name for the duplicated deck:`, `${deckName} (Copy)`);

    if (!newName) return;

    try {
      const response = await fetch(`/api/decks/${deckId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newName }),
      });

      if (response.ok) {
        alert('Deck duplicated successfully');
        fetchDecks();
      } else {
        const data = await response.json();
        alert(`Failed to duplicate deck: ${data.error}`);
      }
    } catch (error) {
      console.error('Error duplicating deck:', error);
      alert('Failed to duplicate deck. Please try again.');
    }
  };

  const handleExport = async (deckId: string, deckName: string) => {
    try {
      const response = await fetch(`/api/decks/${deckId}/export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deckName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error exporting deck:', error);
      alert('Failed to export deck');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/decks/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'deck-import-template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleBulkImportClick = () => {
    bulkFileInputRef.current?.click();
  };

  const handleBulkFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Store files and show modal
    setPendingFiles(Array.from(files));
    setIsBulkImport(true);
    setShowImportModal(true);

    // Reset file input
    if (bulkFileInputRef.current) {
      bulkFileInputRef.current.value = '';
    }
  };

  const handleImportConfirm = async (settings: {
    category: string;
    difficulty: string;
    isPublic: boolean;
    isActive: boolean;
    isTaskDeck: boolean;
  }) => {
    setImporting(true);
    setBulkImportResults(null);
    setImportResults(null);

    try {
      const formData = new FormData();

      if (isBulkImport) {
        // Bulk import
        for (const file of pendingFiles) {
          formData.append('files', file);
        }
        if (settings.category) formData.append('category', settings.category);
        if (settings.difficulty) formData.append('difficulty', settings.difficulty);
        // If isTaskDeck is true, force isPublic to true so deck shows in task selector
        const isPublic = settings.isTaskDeck ? true : settings.isPublic;
        formData.append('isPublic', String(isPublic));
        formData.append('isActive', String(settings.isActive));
        formData.append('isTaskDeck', String(settings.isTaskDeck));

        const response = await fetch('/api/decks/import-bulk', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setBulkImportResults(data);
          fetchDecks();
          setShowImportModal(false);
        } else {
          alert(`Bulk import failed: ${data.error}`);
        }
      } else {
        // Single import
        const file = pendingFiles[0];
        const deckName = file.name.replace(/\.(xlsx|xls)$/i, '');

        formData.append('file', file);
        formData.append('name', deckName);
        if (settings.category) formData.append('category', settings.category);
        if (settings.difficulty) formData.append('difficulty', settings.difficulty);
        // If isTaskDeck is true, force isPublic to true so deck shows in task selector
        const isPublic = settings.isTaskDeck ? true : settings.isPublic;
        formData.append('isPublic', String(isPublic));
        formData.append('isActive', String(settings.isActive));
        formData.append('isTaskDeck', String(settings.isTaskDeck));

        const response = await fetch('/api/decks/import', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (response.ok) {
          setImportResults(data);
          fetchDecks();
          setShowImportModal(false);
        } else {
          alert(`Import failed: ${data.error}`);
        }
      }
    } catch (error) {
      console.error('Error importing decks:', error);
      alert('Failed to import decks');
    } finally {
      setImporting(false);
      setPendingFiles([]);
    }
  };

  const handleImportModalClose = () => {
    if (!importing) {
      setShowImportModal(false);
      setPendingFiles([]);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Store file and show modal
    setPendingFiles([file]);
    setIsBulkImport(false);
    setShowImportModal(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredDecks = decks.filter(deck => {
    const matchesSearch =
      deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (deck.description && deck.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty = filterDifficulty === 'all' || deck.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === 'all' || deck.category === filterCategory;
    const matchesTaskDeck =
      filterTaskDeck === 'all' ||
      (filterTaskDeck === 'task' && deck.isTaskDeck) ||
      (filterTaskDeck === 'regular' && !deck.isTaskDeck);
    const matchesVisibility =
      filterVisibility === 'all' ||
      (filterVisibility === 'public' && deck.isPublic) ||
      (filterVisibility === 'private' && !deck.isPublic);
    return (
      matchesSearch && matchesDifficulty && matchesCategory && matchesTaskDeck && matchesVisibility
    );
  });

  // Bulk action handlers
  const handleSelectAll = () => {
    if (selectedDecks.size === filteredDecks.length) {
      setSelectedDecks(new Set());
    } else {
      setSelectedDecks(new Set(filteredDecks.map(d => d.id)));
    }
  };

  const handleSelectDeck = (deckId: string) => {
    const newSelected = new Set(selectedDecks);
    if (newSelected.has(deckId)) {
      newSelected.delete(deckId);
    } else {
      newSelected.add(deckId);
    }
    setSelectedDecks(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedDecks.size === 0) return;

    const confirmDelete = window.confirm(
      `⚠️ PERINGATAN: Hapus ${selectedDecks.size} deck?\n\n` +
        'Ini akan menghapus secara permanen:\n' +
        '• Semua deck yang dipilih\n' +
        '• Semua flashcard di deck tersebut\n' +
        '• Semua sesi belajar untuk deck tersebut\n\n' +
        'Aksi ini TIDAK DAPAT dibatalkan!\n\n' +
        'Klik OK untuk konfirmasi.'
    );

    if (!confirmDelete) return;

    setBulkActionLoading(true);
    try {
      const deletePromises = Array.from(selectedDecks).map(deckId =>
        fetch(`/api/decks/${deckId}`, { method: 'DELETE' })
      );
      await Promise.all(deletePromises);
      alert(`${selectedDecks.size} deck berhasil dihapus`);
      setSelectedDecks(new Set());
      fetchDecks();
    } catch (error) {
      console.error('Error deleting decks:', error);
      alert('Gagal menghapus beberapa deck');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkToggleActive = async (active: boolean) => {
    if (selectedDecks.size === 0) return;

    setBulkActionLoading(true);
    try {
      const updatePromises = Array.from(selectedDecks).map(deckId =>
        fetch(`/api/decks/${deckId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isActive: active }),
        })
      );
      await Promise.all(updatePromises);
      alert(`${selectedDecks.size} deck berhasil di${active ? 'aktifkan' : 'nonaktifkan'}`);
      setSelectedDecks(new Set());
      fetchDecks();
    } catch (error) {
      console.error('Error updating decks:', error);
      alert('Gagal mengupdate beberapa deck');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkTogglePublic = async (isPublic: boolean) => {
    if (selectedDecks.size === 0) return;

    setBulkActionLoading(true);
    try {
      const updatePromises = Array.from(selectedDecks).map(deckId =>
        fetch(`/api/decks/${deckId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isPublic }),
        })
      );
      await Promise.all(updatePromises);
      alert(`${selectedDecks.size} deck berhasil diubah ke ${isPublic ? 'publik' : 'privat'}`);
      setSelectedDecks(new Set());
      fetchDecks();
    } catch (error) {
      console.error('Error updating decks:', error);
      alert('Gagal mengupdate beberapa deck');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const categories = Array.from(
    new Set(decks.map(d => d.category).filter((c): c is string => Boolean(c)))
  );
  const difficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dek</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Dek</p>
                <p className="text-2xl font-bold">{decks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Layers className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold">{decks.filter(d => d.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Kartu</p>
                <p className="text-2xl font-bold">
                  {decks.reduce((sum, d) => sum + d.totalCards, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Layers className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Publik</p>
                <p className="text-2xl font-bold">{decks.filter(d => d.isPublic).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari dek..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importing}>
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importing...' : 'Import'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkImportClick}
                disabled={importing}
              >
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importing...' : 'Bulk Import'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={bulkFileInputRef}
                type="file"
                accept=".xlsx,.xls"
                multiple
                onChange={handleBulkFileChange}
                className="hidden"
              />
              <Button size="sm" onClick={() => router.push('/admin/dek/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Dek
              </Button>
            </div>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="mb-4 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
              <h3 className="font-semibold text-secondary mb-2">Import Results</h3>
              <div className="text-sm text-foreground space-y-1">
                <p className="text-tertiary-green">
                  Successfully imported: {importResults.cardsImported} cards
                </p>
                {importResults.errors.length > 0 && (
                  <>
                    <p className="text-primary">Errors: {importResults.errors.length}</p>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <p className="font-semibold mb-1">Error details:</p>
                      {importResults.errors.map((err, idx) => (
                        <p key={idx} className="text-xs">
                          Row {err.row}: {err.message}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setImportResults(null)}
                className="mt-2 text-xs text-secondary hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Bulk Import Results */}
          {bulkImportResults && (
            <div className="mb-4 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
              <h3 className="font-semibold text-secondary mb-2">Bulk Import Results</h3>
              <div className="text-sm text-foreground space-y-1">
                <div className="flex gap-4 mb-2">
                  <p>
                    Total: <span className="font-semibold">{bulkImportResults.summary.total}</span>
                  </p>
                  <p className="text-tertiary-green">
                    Success:{' '}
                    <span className="font-semibold">{bulkImportResults.summary.successful}</span>
                  </p>
                  {bulkImportResults.summary.failed > 0 && (
                    <p className="text-primary">
                      Failed:{' '}
                      <span className="font-semibold">{bulkImportResults.summary.failed}</span>
                    </p>
                  )}
                  <p>
                    Cards:{' '}
                    <span className="font-semibold">
                      {bulkImportResults.summary.totalCardsImported}
                    </span>
                  </p>
                </div>
                <div className="mt-2 max-h-60 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 px-2">File</th>
                        <th className="text-left py-1 px-2">Deck Name</th>
                        <th className="text-left py-1 px-2">Status</th>
                        <th className="text-left py-1 px-2">Cards</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkImportResults.results.map((result, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-1 px-2 truncate max-w-[150px]">{result.fileName}</td>
                          <td className="py-1 px-2">{result.deckName}</td>
                          <td className="py-1 px-2">
                            {result.success ? (
                              <span className="text-tertiary-green">Success</span>
                            ) : (
                              <span className="text-primary">Failed</span>
                            )}
                          </td>
                          <td className="py-1 px-2">{result.cardsImported}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <button
                onClick={() => setBulkImportResults(null)}
                className="mt-2 text-xs text-secondary hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {/* Level Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Level:</span>
              <Button
                variant={filterDifficulty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDifficulty('all')}
              >
                Semua
              </Button>
              {difficulties.map(diff => (
                <Button
                  key={diff}
                  variant={filterDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDifficulty(diff)}
                >
                  {diff}
                </Button>
              ))}
            </div>

            {/* Tipe Deck Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Tipe:</span>
              <Button
                variant={filterTaskDeck === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTaskDeck('all')}
              >
                Semua
              </Button>
              <Button
                variant={filterTaskDeck === 'task' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTaskDeck('task')}
              >
                Roleplay
              </Button>
              <Button
                variant={filterTaskDeck === 'regular' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTaskDeck('regular')}
              >
                Regular
              </Button>
            </div>

            {/* Visibilitas Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Visibilitas:</span>
              <Button
                variant={filterVisibility === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVisibility('all')}
              >
                Semua
              </Button>
              <Button
                variant={filterVisibility === 'public' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVisibility('public')}
              >
                <Globe className="h-3 w-3 mr-1" />
                Publik
              </Button>
              <Button
                variant={filterVisibility === 'private' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterVisibility('private')}
              >
                <Lock className="h-3 w-3 mr-1" />
                Privat
              </Button>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Kategori:</span>
                <Button
                  variant={filterCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('all')}
                >
                  Semua
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={filterCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Decks List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Daftar Dek ({filteredDecks.length})
            </CardTitle>

            {/* Bulk Actions */}
            {selectedDecks.size > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{selectedDecks.size} dipilih</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={bulkActionLoading}>
                      {bulkActionLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                      )}
                      Bulk Action
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkToggleActive(true)}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Aktifkan Semua
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkToggleActive(false)}>
                      <Square className="h-4 w-4 mr-2" />
                      Nonaktifkan Semua
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleBulkTogglePublic(true)}>
                      <Globe className="h-4 w-4 mr-2" />
                      Jadikan Publik
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkTogglePublic(false)}>
                      <Lock className="h-4 w-4 mr-2" />
                      Jadikan Privat
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleBulkDelete}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Hapus Semua
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="sm" onClick={() => setSelectedDecks(new Set())}>
                  Batal
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredDecks.length === 0 ? (
            <div className="text-center py-8">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada dek ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium w-10">
                      <Checkbox
                        checked={
                          selectedDecks.size === filteredDecks.length && filteredDecks.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        aria-label="Pilih semua"
                      />
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Dek</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden sm:table-cell">
                      Tipe
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden sm:table-cell">
                      Kategori
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Level</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden md:table-cell">
                      Kartu
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden md:table-cell">
                      Visibilitas
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden lg:table-cell">
                      Status
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDecks.map(deck => (
                    <tr
                      key={deck.id}
                      className="border-b last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-3 px-2 sm:px-4">
                        <Checkbox
                          checked={selectedDecks.has(deck.id)}
                          onCheckedChange={() => handleSelectDeck(deck.id)}
                          aria-label={`Pilih ${deck.name}`}
                        />
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <div>
                          <p className="font-medium truncate max-w-[150px] sm:max-w-none">
                            {deck.name}
                          </p>
                          {deck.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {deck.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                        {deck.isTaskDeck ? (
                          <Badge className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            Roleplay
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Regular
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                        {deck.category ? (
                          <Badge variant="secondary" className="text-xs">
                            {deck.category}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        {deck.difficulty ? (
                          <Badge
                            className={`text-xs ${
                              deck.difficulty === 'N5' || deck.difficulty === 'N4'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : deck.difficulty === 'N3'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                          >
                            {deck.difficulty}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden md:table-cell">{deck.totalCards}</td>
                      <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                        {deck.isPublic ? (
                          <Badge className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            <Globe className="h-3 w-3 mr-1" />
                            Publik
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Privat
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
                        <Badge
                          variant={deck.isActive ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {deck.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 transition-colors"
                            onClick={() => router.push(`/admin/dek/${deck.id}`)}
                            title="Lihat"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors"
                            onClick={() => router.push(`/admin/dek/${deck.id}/edit`)}
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hidden sm:inline-flex hover:bg-purple-100 hover:text-purple-600 dark:hover:bg-purple-900/30 dark:hover:text-purple-400 transition-colors"
                            onClick={() => handleDuplicate(deck.id, deck.name)}
                            title="Duplikasi"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hidden sm:inline-flex hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 transition-colors"
                            onClick={() => handleExport(deck.id, deck.name)}
                            title="Export"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-colors"
                            onClick={() => handleDelete(deck.id, deck.name)}
                            title="Hapus"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Import Confirmation Modal */}
      <ImportConfirmationModal
        open={showImportModal}
        onClose={handleImportModalClose}
        onConfirm={handleImportConfirm}
        files={pendingFiles}
        isBulk={isBulkImport}
        importing={importing}
      />
    </div>
  );
}
