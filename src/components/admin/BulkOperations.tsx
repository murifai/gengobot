'use client';

import React, { useState, useRef } from 'react';

interface BulkOperationsProps {
  onImport: (file: File) => Promise<void>;
  onExport: (format: 'json' | 'csv') => Promise<void>;
  selectedTaskIds: string[];
  onBulkDelete: (taskIds: string[]) => Promise<void>;
  onBulkActivate: (taskIds: string[], active: boolean) => Promise<void>;
}

export default function BulkOperations({
  onImport,
  onExport,
  selectedTaskIds,
  onBulkDelete,
  onBulkActivate,
}: BulkOperationsProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      await onImport(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    setLoading(true);
    try {
      await onExport(format);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;

    if (confirm(`Are you sure you want to delete ${selectedTaskIds.length} selected tasks?`)) {
      setLoading(true);
      try {
        await onBulkDelete(selectedTaskIds);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBulkActivate = async (active: boolean) => {
    if (selectedTaskIds.length === 0) return;

    setLoading(true);
    try {
      await onBulkActivate(selectedTaskIds, active);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <h3 className="text-white font-semibold text-lg mb-4">Bulk Operations</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Import/Export */}
        <div>
          <h4 className="text-white font-medium text-sm mb-3">Import / Export</h4>
          <div className="space-y-2">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label
                htmlFor="import-file"
                className={`block text-center px-4 py-2 bg-secondary text-white rounded cursor-pointer hover:bg-secondary/90 transition-opacity ${
                  loading ? 'opacity-50 pointer-events-none' : ''
                }`}
              >
                📥 Import Tasks (JSON/CSV)
              </label>
            </div>

            <button
              onClick={() => handleExport('json')}
              disabled={loading}
              className="w-full px-4 py-2 bg-tertiary-green text-white rounded hover:bg-tertiary-green/90 disabled:opacity-50 transition-opacity"
            >
              📤 Export as JSON
            </button>

            <button
              onClick={() => handleExport('csv')}
              disabled={loading}
              className="w-full px-4 py-2 bg-tertiary-yellow text-dark rounded hover:bg-tertiary-yellow/90 disabled:opacity-50 transition-opacity"
            >
              📊 Export as CSV
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        <div>
          <h4 className="text-white font-medium text-sm mb-3">
            Bulk Actions {selectedTaskIds.length > 0 && `(${selectedTaskIds.length} selected)`}
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => handleBulkActivate(true)}
              disabled={loading || selectedTaskIds.length === 0}
              className="w-full px-4 py-2 bg-tertiary-green text-white rounded hover:bg-tertiary-green/90 disabled:opacity-50 transition-opacity"
            >
              ✅ Activate Selected
            </button>

            <button
              onClick={() => handleBulkActivate(false)}
              disabled={loading || selectedTaskIds.length === 0}
              className="w-full px-4 py-2 bg-dark text-white rounded hover:bg-dark/90 disabled:opacity-50 transition-opacity"
            >
              ⏸️ Deactivate Selected
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={loading || selectedTaskIds.length === 0}
              className="w-full px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50 transition-opacity"
            >
              🗑️ Delete Selected
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-dark rounded text-sm text-gray-400">
        <p className="font-medium text-white mb-2">Import/Export Format:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>JSON: Complete task data including all fields</li>
          <li>CSV: Basic task information (title, description, category, difficulty)</li>
          <li>Select tasks in the task library to perform bulk actions</li>
        </ul>
      </div>
    </div>
  );
}
