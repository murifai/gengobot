'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, X, Check, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUploadComplete?: (url: string, key: string) => void;
  currentUrl?: string;
  className?: string;
  maxSizeMB?: number;
  level?: string;
  section?: string;
}

export function ImageUpload({
  onUploadComplete,
  currentUrl,
  className = '',
  maxSizeMB = 10,
  level,
  section,
}: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

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
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml',
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setUploadSuccess(false);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
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

      const response = await fetch('/api/jlpt/upload/image', {
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
        setPreview(null);
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
    setPreview(null);
    setError(null);
    setUploadSuccess(false);
  };

  const displayPreview = preview || currentUrl;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Image Preview */}
      {displayPreview && (
        <div className="relative w-full max-w-sm">
          <img
            src={displayPreview}
            alt="Preview"
            className="w-full h-auto rounded-lg border border-gray-200"
          />
          {currentUrl && !preview && (
            <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              Current
            </div>
          )}
        </div>
      )}

      {/* File Input */}
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {currentUrl ? 'Replace Image' : 'Choose Image'}
            </span>
          </Button>
        </label>

        {file && (
          <div className="flex items-center gap-2 text-sm">
            <ImageIcon className="h-4 w-4 text-blue-600" />
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
              Upload Image
            </>
          )}
        </Button>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Image uploaded successfully!
        </div>
      )}

      {/* Error Message */}
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  );
}
