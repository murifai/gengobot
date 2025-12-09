'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Upload, Check } from 'lucide-react';
import {
  ImageCrop,
  ImageCropContent,
  ImageCropApply,
  ImageCropReset,
} from '@/components/ui/shadcn-io/image-crop';

interface City {
  name: string;
  country: string;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  fullName: string | null;
  nickname: string | null;
  domicile: string | null;
  institution: string | null;
  proficiency: string;
}

interface EditProfilePageProps {
  user: UserProfile;
}

export function EditProfilePage({ user }: EditProfilePageProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: user.fullName || user.name || '',
    nickname: user.nickname || '',
    domicile: user.domicile || '',
    institution: user.institution || '',
    proficiency: user.proficiency || 'N5',
  });
  const [imagePreview, setImagePreview] = useState<string | null>(user.image);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fileToCrop, setFileToCrop] = useState<File | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => setCities(data.cities))
      .catch(err => console.error('Failed to load cities:', err));
  }, []);

  // Display full name first, fallback to Google account name
  const displayName = user.fullName || user.name || 'User';
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }

      setFileToCrop(file);
      setIsCropping(true);
      setError(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCroppedImage = async (croppedImageDataUrl: string) => {
    setError(null);

    try {
      // Convert data URL to blob
      const response = await fetch(croppedImageDataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'avatar.png', { type: 'image/png' });

      // Upload immediately
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        throw new Error(data.error || 'Failed to upload image');
      }

      const data = await uploadResponse.json();

      // Update preview with the uploaded URL
      setImagePreview(data.url);
      setImageFile(null); // Clear the file since it's already uploaded
      setFileToCrop(null);
      setIsCropping(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
      setFileToCrop(null);
      setIsCropping(false);
    }
  };

  const handleCancelCrop = () => {
    setFileToCrop(null);
    setIsCropping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Upload image if changed
      let imageUrl = user.image;
      if (imageFile) {
        const formDataUpload = new FormData();
        formDataUpload.append('file', imageFile);

        const uploadResponse = await fetch('/api/upload/avatar', {
          method: 'POST',
          body: formDataUpload,
        });

        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          imageUrl = uploadResult.url;
        } else {
          console.warn('Image upload failed, continuing without image update');
        }
      }

      // Update profile
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      router.push('/profile');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-base">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Avatar Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Foto Profil</CardTitle>
              <CardDescription>
                {isCropping ? 'Sesuaikan area foto' : 'Klik foto untuk mengubah'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isCropping && fileToCrop ? (
                <div className="space-y-4">
                  <ImageCrop file={fileToCrop} onCrop={handleCroppedImage} aspect={1} circularCrop>
                    <div className="flex flex-col items-center gap-4">
                      <ImageCropContent className="max-h-[300px] rounded-base overflow-hidden" />
                      <div className="flex items-center gap-2">
                        <ImageCropReset type="button" />
                        <ImageCropApply type="button">
                          <Check className="h-4 w-4" />
                        </ImageCropApply>
                      </div>
                    </div>
                  </ImageCrop>
                  <div className="flex justify-center">
                    <Button type="button" variant="ghost" size="sm" onClick={handleCancelCrop}>
                      Batal
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar
                      className="h-24 w-24 cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <AvatarImage src={imagePreview || undefined} alt={displayName} />
                      <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                    </Avatar>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Foto
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      JPG, PNG atau GIF. Maksimal 5MB.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Personal</CardTitle>
              <CardDescription>Data diri dan informasi belajar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nickname">Nama Panggilan</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                  placeholder="Masukkan nama panggilan"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={user.email} disabled className="bg-muted" />
                <p className="text-sm text-muted-foreground">Email tidak dapat diubah</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domicile">Domisili</Label>
                <Input
                  id="domicile"
                  value={formData.domicile}
                  onChange={e => setFormData({ ...formData, domicile: e.target.value })}
                  placeholder="Masukkan kota domisili"
                  list="cities-list"
                />
                <datalist id="cities-list">
                  {cities.map(city => (
                    <option key={city.name} value={city.name} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institusi</Label>
                <Input
                  id="institution"
                  value={formData.institution}
                  onChange={e => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Sekolah/Universitas/Tempat Kerja"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="proficiency">Level Bahasa Jepang</Label>
                <Select
                  value={formData.proficiency}
                  onValueChange={value => setFormData({ ...formData, proficiency: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N5">N5 - Pemula</SelectItem>
                    <SelectItem value="N4">N4 - Dasar</SelectItem>
                    <SelectItem value="N3">N3 - Menengah</SelectItem>
                    <SelectItem value="N2">N2 - Mahir</SelectItem>
                    <SelectItem value="N1">N1 - Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
