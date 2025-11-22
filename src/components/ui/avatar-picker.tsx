'use client';

import { useState, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Upload, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ImageCrop,
  ImageCropContent,
  ImageCropApply,
  ImageCropReset,
} from '@/components/ui/shadcn-io/image-crop';

// Premade avatar options
const PREMADE_AVATARS = [
  // Characters - Human style
  '/avatars/character-1.svg',
  '/avatars/character-2.svg',
  '/avatars/character-3.svg',
  '/avatars/character-4.svg',
  '/avatars/character-5.svg',
  '/avatars/character-6.svg',
  '/avatars/character-7.svg',
  '/avatars/character-8.svg',
  // Characters - Anime style
  '/avatars/anime-1.svg',
  '/avatars/anime-2.svg',
  '/avatars/anime-3.svg',
  '/avatars/anime-4.svg',
  '/avatars/anime-5.svg',
  '/avatars/anime-6.svg',
  // Abstract/Icons
  '/avatars/abstract-1.svg',
  '/avatars/abstract-2.svg',
  '/avatars/abstract-3.svg',
  '/avatars/abstract-4.svg',
];

interface AvatarPickerProps {
  value?: string;
  onChange: (url: string) => void;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AvatarPicker({
  value,
  onChange,
  name = 'Avatar',
  size = 'lg',
  className,
}: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
  };

  const getInitials = (name: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setError(null);
    setFileToCrop(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCroppedImage = async (croppedImageDataUrl: string) => {
    setUploading(true);
    setError(null);

    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.png', { type: 'image/png' });

      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || 'Gagal mengunggah gambar');
      }

      const data = await uploadResponse.json();
      onChange(data.url);
      setFileToCrop(null);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengunggah gambar');
    } finally {
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setFileToCrop(null);
    setError(null);
  };

  const handleSelectPremade = (avatarUrl: string) => {
    onChange(avatarUrl);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'relative group rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          className
        )}
      >
        <Avatar className={sizeClasses[size]}>
          {value && <AvatarImage src={value} alt={name} />}
          <AvatarFallback className="bg-primary/10 text-primary text-xl">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Pencil className="h-5 w-5 text-white" />
        </div>
      </button>

      <Dialog open={open} onClose={() => setOpen(false)} size="md">
        <DialogTitle>Pilih Avatar</DialogTitle>
        <DialogDescription>Pilih avatar premade atau unggah foto sendiri</DialogDescription>

        <Tabs defaultValue="premade" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="premade">Premade</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="premade" className="mt-4">
            <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-1">
              {PREMADE_AVATARS.map((avatar, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectPremade(avatar)}
                  className={cn(
                    'relative rounded-lg p-1 hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary',
                    value === avatar && 'bg-primary/10 ring-2 ring-primary'
                  )}
                >
                  <Avatar className="h-14 w-14 mx-auto">
                    <AvatarImage src={avatar} alt={`Avatar ${index + 1}`} />
                    <AvatarFallback className="bg-muted">{index + 1}</AvatarFallback>
                  </Avatar>
                  {value === avatar && (
                    <div className="absolute top-0 right-0 bg-primary rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-center gap-4 py-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />

              {fileToCrop ? (
                <div className="w-full space-y-4">
                  <ImageCrop file={fileToCrop} onCrop={handleCroppedImage} aspect={1} circularCrop>
                    <div className="flex flex-col items-center gap-4">
                      <ImageCropContent className="max-h-[250px] rounded-lg overflow-hidden" />
                      <div className="flex items-center gap-2">
                        <ImageCropReset />
                        <ImageCropApply disabled={uploading}>
                          {uploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </ImageCropApply>
                      </div>
                    </div>
                  </ImageCrop>
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelCrop}
                      disabled={uploading}
                    >
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {value && (
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={value} alt="Current avatar" />
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Pilih Gambar
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Format: JPG, PNG, GIF. Maksimal 5MB.
                  </p>
                </>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </TabsContent>
        </Tabs>
      </Dialog>
    </>
  );
}
