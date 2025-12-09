'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoucherType, SubscriptionTier } from '@prisma/client';

export default function NewVoucherPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE' as VoucherType,
    value: 0,
    maxUses: '',
    usesPerUser: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    isActive: true,
    newUsersOnly: false,
    applicableTiers: [] as SubscriptionTier[],
    allowedDurations: [] as number[],
    isStackable: false,
    isExclusive: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/subskripsi/voucher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
          // Store allowedDurations in metadata
          minMonths: formData.allowedDurations.length > 0 ? 1 : null, // Flag to enable duration check
          metadata:
            formData.allowedDurations.length > 0
              ? { allowedDurations: formData.allowedDurations }
              : undefined,
          endDate: formData.endDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create voucher');
      }

      toast.success('Voucher berhasil dibuat');
      router.push('/admin/subskripsi/voucher');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTierToggle = (tier: SubscriptionTier) => {
    setFormData(prev => ({
      ...prev,
      applicableTiers: prev.applicableTiers.includes(tier)
        ? prev.applicableTiers.filter(t => t !== tier)
        : [...prev.applicableTiers, tier],
    }));
  };

  const handleDurationToggle = (duration: number) => {
    setFormData(prev => ({
      ...prev,
      allowedDurations: prev.allowedDurations.includes(duration)
        ? prev.allowedDurations.filter(d => d !== duration)
        : [...prev.allowedDurations, duration],
    }));
  };

  const getValueLabel = () => {
    switch (formData.type) {
      case 'PERCENTAGE':
        return 'Persentase Diskon (%)';
      case 'FIXED_AMOUNT':
        return 'Nominal Diskon (Rp)';
      case 'BONUS_CREDITS':
        return 'Jumlah Kredit Bonus';
      case 'TRIAL_EXTENSION':
        return 'Jumlah Hari Perpanjangan';
      case 'TIER_UPGRADE':
        return 'Durasi Upgrade (hari)';
      default:
        return 'Nilai';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/subskripsi/voucher">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Buat Voucher Baru</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Dasar</CardTitle>
              <CardDescription>Detail utama voucher</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Kode Voucher</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="DISKON20"
                  className="uppercase"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Kode yang akan dimasukkan user. Hanya huruf dan angka.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nama Voucher</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Diskon 20% Spesial"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi voucher..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tipe Voucher</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: VoucherType) =>
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Persentase</SelectItem>
                      <SelectItem value="FIXED_AMOUNT">Nominal Tetap</SelectItem>
                      <SelectItem value="BONUS_CREDITS">Bonus Kredit</SelectItem>
                      <SelectItem value="TRIAL_EXTENSION">Perpanjangan Trial</SelectItem>
                      <SelectItem value="TIER_UPGRADE">Upgrade Tier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="value">{getValueLabel()}</Label>
                  <Input
                    id="value"
                    type="number"
                    min="0"
                    value={formData.value}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, value: parseInt(e.target.value) || 0 }))
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limits & Validity */}
          <Card>
            <CardHeader>
              <CardTitle>Batas & Validitas</CardTitle>
              <CardDescription>Atur batasan penggunaan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxUses">Maks Penggunaan</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={e => setFormData(prev => ({ ...prev, maxUses: e.target.value }))}
                    placeholder="Unlimited"
                  />
                  <p className="text-xs text-muted-foreground">Kosongkan untuk unlimited</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="usesPerUser">Per User</Label>
                  <Input
                    id="usesPerUser"
                    type="number"
                    min="1"
                    value={formData.usesPerUser}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, usesPerUser: parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Tanggal Mulai</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">Tanggal Berakhir</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Kosongkan untuk tidak ada batas</p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Voucher Aktif</Label>
                    <p className="text-xs text-muted-foreground">
                      Aktifkan voucher untuk bisa digunakan
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Hanya User Baru</Label>
                    <p className="text-xs text-muted-foreground">
                      Hanya untuk user yang belum pernah upgrade
                    </p>
                  </div>
                  <Switch
                    checked={formData.newUsersOnly}
                    onCheckedChange={checked =>
                      setFormData(prev => ({ ...prev, newUsersOnly: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle>Eligibilitas</CardTitle>
              <CardDescription>Tentukan siapa yang bisa menggunakan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tier yang Berlaku</Label>
                <p className="text-xs text-muted-foreground mb-2">Kosongkan untuk semua tier</p>
                <div className="flex gap-2">
                  {(['FREE', 'BASIC', 'PRO'] as SubscriptionTier[]).map(tier => (
                    <Button
                      key={tier}
                      type="button"
                      variant={formData.applicableTiers.includes(tier) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTierToggle(tier)}
                    >
                      {tier}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Durasi yang Berlaku</Label>
                <p className="text-xs text-muted-foreground mb-2">Kosongkan untuk semua durasi</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 1, label: '1 Bulan' },
                    { value: 3, label: '3 Bulan' },
                    { value: 6, label: '6 Bulan' },
                    { value: 12, label: '1 Tahun' },
                  ].map(duration => (
                    <Button
                      key={duration.value}
                      type="button"
                      variant={
                        formData.allowedDurations.includes(duration.value) ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleDurationToggle(duration.value)}
                    >
                      {duration.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stacking */}
          <Card>
            <CardHeader>
              <CardTitle>Kombinasi Voucher</CardTitle>
              <CardDescription>Atur aturan stacking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Bisa Digabung</Label>
                  <p className="text-xs text-muted-foreground">
                    Bisa digunakan bersamaan dengan voucher lain
                  </p>
                </div>
                <Switch
                  checked={formData.isStackable}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, isStackable: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Voucher Eksklusif</Label>
                  <p className="text-xs text-muted-foreground">
                    User hanya bisa pakai satu voucher eksklusif
                  </p>
                </div>
                <Switch
                  checked={formData.isExclusive}
                  onCheckedChange={checked =>
                    setFormData(prev => ({ ...prev, isExclusive: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error & Submit */}
        {error && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-md">{error}</div>}

        <div className="flex justify-end gap-4 mt-6">
          <Link href="/admin/subskripsi/voucher">
            <Button variant="outline" type="button">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Buat Voucher
          </Button>
        </div>
      </form>
    </div>
  );
}
