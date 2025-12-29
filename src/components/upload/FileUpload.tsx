'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, X, Check, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onUploadComplete?: (url: string, key: string) => void;
  folder?: string;
  accept?: string;
  maxSizeMB?: number;
  className?: string;
}

export function FileUpload({
  onUploadComplete,
  folder = 'uploads',
  accept = 'image/*',
  maxSizeMB = 10,
  className = '',
}: FileUploadProps) {
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

    setFile(selectedFile);
    setError(null);
    setUploadSuccess(false);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', folder);

      const response = await fetch('/api/upload', {
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

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <div className="flex items-center gap-4">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          <Button type="button" variant="outline" disabled={uploading} asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              Choose File
            </span>
          </Button>
        </label>

        {file && (
          <div className="flex items-center gap-2 text-sm">
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

      {/* Preview */}
      {preview && (
        <div className="relative w-full max-w-sm">
          <img src={preview} alt="Preview" className="w-full h-auto rounded-lg border" />
        </div>
      )}

      {/* Upload Button */}
      {file && !uploadSuccess && (
        <Button onClick={handleUpload} disabled={uploading} className="w-full sm:w-auto">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload to R2
            </>
          )}
        </Button>
      )}

      {/* Success Message */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <Check className="h-4 w-4" />
          Upload successful!
        </div>
      )}

      {/* Error Message */}
      {error && <div className="text-sm text-destructive">{error}</div>}
    </div>
  );
}
