'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, X, Check, Loader2, Music } from 'lucide-react';

interface AudioUploadProps {
  onUploadComplete?: (url: string, key: string) => void;
  currentUrl?: string;
  className?: string;
  maxSizeMB?: number;
  level?: string;
  section?: string;
}

export function AudioUpload({
  onUploadComplete,
  currentUrl,
  className = '',
  maxSizeMB = 50,
  level,
  section,
}: AudioUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      'audio/webm',
      'audio/aac',
      'audio/m4a',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a valid audio file (MP3, WAV, OGG, WebM, AAC, M4A)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (level) formData.append('level', level);
      if (section) formData.append('section', section);

      const response = await fetch('/api/jlpt/upload/audio', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadSuccess(true);
      onUploadComplete?.(result.data.url, result.data.key);

      // Clear after 2 seconds
      setTimeout(() => {
        setFile(null);
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setError(null);
    setUploadSuccess(false);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Current Audio Preview */}
      {currentUrl && !file && (
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Current Audio</span>
          </div>
          <audio controls src={currentUrl} className="w-full">
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

      {/* File Input */}
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {currentUrl ? 'Replace Audio' : 'Choose Audio'}
            </span>
          </Button>
        </label>

        {file && (
          <div className="flex items-center gap-2 text-sm">
            <Music className="h-4 w-4 text-blue-600" />
            <span className="truncate max-w-[200px]">{file.name}</span>
            <span className="text-muted-foreground">
              ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </span>
            {!uploading && (
              <button onClick={handleRemove} className="text-destructive hover:text-destructive/80">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Upload Button */}
      {file && !uploadSuccess && (
        <Button onClick={handleUpload} disabled={uploading} size="sm">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Audio
            </>
          )}
        </Button>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Audio uploaded successfully!
        </div>
      )}

      {/* Error Message */}
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  );
}
