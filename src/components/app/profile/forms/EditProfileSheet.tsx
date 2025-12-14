'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserProfile } from '../ProfilePage';

interface EditProfileSheetProps {
  user: UserProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (user: UserProfile) => void;
}

export function EditProfileSheet({ user, open, onOpenChange, onSave }: EditProfileSheetProps) {
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    nickname: user.nickname || '',
    domicile: user.domicile || '',
    institution: user.institution || '',
    proficiency: user.proficiency || 'N5',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      onSave({ ...user, ...updatedUser });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>Perbarui informasi profil Anda</SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {error && (
            <div className="p-3 bg-destructive/10 border-2 border-destructive rounded-base">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

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
            <Label htmlFor="domicile">Domisili</Label>
            <Input
              id="domicile"
              value={formData.domicile}
              onChange={e => setFormData({ ...formData, domicile: e.target.value })}
              placeholder="Contoh: Jakarta, Bandung"
            />
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
                <SelectItem value="N5">JLPT N5</SelectItem>
                <SelectItem value="N4">JLPT N4</SelectItem>
                <SelectItem value="N3">JLPT N3</SelectItem>
                <SelectItem value="N2">JLPT N2</SelectItem>
                <SelectItem value="N1">JLPT N1</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
