'use client';

import { useState } from 'react';
import { Dialog, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, X } from 'lucide-react';

interface ImportSettings {
  category: string;
  difficulty: string;
  isPublic: boolean;
  isActive: boolean;
  isTaskDeck: boolean;
}

interface ImportConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (settings: ImportSettings) => void;
  files: File[];
  isBulk: boolean;
  importing: boolean;
}

const CATEGORIES = [
  { value: '', label: 'Tidak ada kategori' },
  { value: 'Kosakata', label: 'Kosakata' },
  { value: 'Kanji', label: 'Kanji' },
  { value: 'Tata Bahasa', label: 'Tata Bahasa' },
  { value: 'Percakapan', label: 'Percakapan' },
  { value: 'Budaya', label: 'Budaya' },
];

const DIFFICULTIES = [
  { value: '', label: 'Tidak ada level' },
  { value: 'N5', label: 'JLPT N5' },
  { value: 'N4', label: 'JLPT N4' },
  { value: 'N3', label: 'JLPT N3' },
  { value: 'N2', label: 'JLPT N2' },
  { value: 'N1', label: 'JLPT N1' },
];

export function ImportConfirmationModal({
  open,
  onClose,
  onConfirm,
  files,
  isBulk,
  importing,
}: ImportConfirmationModalProps) {
  const [settings, setSettings] = useState<ImportSettings>({
    category: '',
    difficulty: '',
    isPublic: true,
    isActive: true,
    isTaskDeck: false,
  });

  const handleConfirm = () => {
    onConfirm(settings);
  };

  const handleClose = () => {
    if (!importing) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} size="lg">
      <div className="flex items-center justify-between mb-4">
        <DialogTitle className="mb-0">{isBulk ? 'Bulk Import Dek' : 'Import Dek'}</DialogTitle>
        {!importing && (
          <button onClick={handleClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* File List */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          File yang akan diimport ({files.length}):
        </h3>
        <div className="max-h-40 overflow-y-auto border border-border rounded-md p-2 bg-muted/30">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-2 py-1">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              <span className="text-sm truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground ml-auto">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ))}
        </div>
        {isBulk && (
          <p className="text-xs text-muted-foreground mt-2">
            Nama dek akan diambil dari nama file (tanpa ekstensi .xlsx)
          </p>
        )}
      </div>

      {/* Settings */}
      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-medium text-foreground">Pengaturan Dek:</h3>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Kategori</label>
          <select
            value={settings.category}
            onChange={e => setSettings({ ...settings, category: e.target.value })}
            className="w-full px-3 py-2 border-2 border-border rounded-base bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={importing}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-1">Level JLPT</label>
          <select
            value={settings.difficulty}
            onChange={e => setSettings({ ...settings, difficulty: e.target.value })}
            className="w-full px-3 py-2 border-2 border-border rounded-base bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            disabled={importing}
          >
            {DIFFICULTIES.map(diff => (
              <option key={diff.value} value={diff.value}>
                {diff.label}
              </option>
            ))}
          </select>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4">
          {/* Is Public */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isPublic}
              onChange={e => setSettings({ ...settings, isPublic: e.target.checked })}
              className="w-4 h-4 rounded border-2 border-border text-primary focus:ring-primary/50"
              disabled={importing}
            />
            <span className="text-sm text-foreground">Publik</span>
          </label>

          {/* Is Active */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isActive}
              onChange={e => setSettings({ ...settings, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-2 border-border text-primary focus:ring-primary/50"
              disabled={importing}
            />
            <span className="text-sm text-foreground">Aktif</span>
          </label>

          {/* Is Task Deck */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.isTaskDeck}
              onChange={e => setSettings({ ...settings, isTaskDeck: e.target.checked })}
              className="w-4 h-4 rounded border-2 border-border text-primary focus:ring-primary/50"
              disabled={importing}
            />
            <span className="text-sm text-foreground">Task Deck</span>
          </label>
        </div>
        {settings.isTaskDeck && (
          <p className="text-xs text-muted-foreground mt-2">
            Dek akan otomatis menjadi publik agar bisa ditambahkan ke task
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={handleClose} disabled={importing}>
          Batal
        </Button>
        <Button onClick={handleConfirm} disabled={importing}>
          {importing ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-pulse" />
              Mengimport...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Import {files.length} File
            </>
          )}
        </Button>
      </div>
    </Dialog>
  );
}
