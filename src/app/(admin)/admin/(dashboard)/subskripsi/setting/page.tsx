'use client';

import { useEffect, useState } from 'react';
import {
  CreditCard,
  Save,
  Plus,
  X,
  Loader2,
  DollarSign,
  Coins,
  Check,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface TierConfig {
  id?: string;
  name: 'FREE' | 'BASIC' | 'PRO';
  priceMonthly: number;
  credits: number;
  features: string[];
  isActive: boolean;
  discount3Months: number;
  discount6Months: number;
  discount12Months: number;
}

const TIER_LABELS: Record<string, string> = {
  FREE: 'Gratis',
  BASIC: 'Basic',
  PRO: 'Pro',
};

const TIER_COLORS: Record<string, string> = {
  FREE: 'bg-gray-100 text-gray-800',
  BASIC: 'bg-blue-100 text-blue-800',
  PRO: 'bg-purple-100 text-purple-800',
};

export default function SubscriptionSettingsPage() {
  const [tiers, setTiers] = useState<TierConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newFeatures, setNewFeatures] = useState<Record<string, string>>({
    FREE: '',
    BASIC: '',
    PRO: '',
  });

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/admin/subscription/tiers');
      const data = await response.json();

      if (response.ok) {
        // Ensure all three tiers exist
        const tierNames = ['FREE', 'BASIC', 'PRO'] as const;
        const existingTiers = data.tiers || [];

        const completeTiers = tierNames.map(name => {
          const existing = existingTiers.find((t: TierConfig) => t.name === name);
          return (
            existing || {
              name,
              priceMonthly: 0,
              credits: 0,
              features: [],
              isActive: true,
              discount3Months: 10,
              discount6Months: 20,
              discount12Months: 30,
            }
          );
        });

        setTiers(completeTiers);
      } else {
        toast.error('Gagal memuat konfigurasi tier');
      }
    } catch (error) {
      console.error('Error fetching tiers:', error);
      toast.error('Gagal memuat konfigurasi tier');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/subscription/tiers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers }),
      });

      if (response.ok) {
        toast.success('Konfigurasi tier berhasil disimpan');
        fetchTiers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Gagal menyimpan konfigurasi');
      }
    } catch (error) {
      console.error('Error saving tiers:', error);
      toast.error('Gagal menyimpan konfigurasi');
    } finally {
      setIsSaving(false);
    }
  };

  const updateTier = (tierName: string, field: keyof TierConfig, value: unknown) => {
    setTiers(prev =>
      prev.map(tier => (tier.name === tierName ? { ...tier, [field]: value } : tier))
    );
  };

  const addFeature = (tierName: string) => {
    const feature = newFeatures[tierName]?.trim();
    if (!feature) return;

    setTiers(prev =>
      prev.map(tier =>
        tier.name === tierName ? { ...tier, features: [...tier.features, feature] } : tier
      )
    );
    setNewFeatures(prev => ({ ...prev, [tierName]: '' }));
  };

  const removeFeature = (tierName: string, index: number) => {
    setTiers(prev =>
      prev.map(tier =>
        tier.name === tierName
          ? { ...tier, features: tier.features.filter((_, i) => i !== index) }
          : tier
      )
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan Subskripsi</h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {tiers.map(tier => (
          <Card key={tier.name} className={!tier.isActive ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={TIER_COLORS[tier.name]}>{TIER_LABELS[tier.name]}</Badge>
                  {tier.name === 'PRO' && (
                    <Badge variant="outline" className="text-xs">
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`active-${tier.name}`} className="text-xs text-muted-foreground">
                    Aktif
                  </Label>
                  <Switch
                    id={`active-${tier.name}`}
                    checked={tier.isActive}
                    onCheckedChange={checked => updateTier(tier.name, 'isActive', checked)}
                    disabled={tier.name === 'FREE'}
                  />
                </div>
              </div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Tier {TIER_LABELS[tier.name]}
              </CardTitle>
              <CardDescription>
                Konfigurasi harga dan fitur untuk tier {TIER_LABELS[tier.name].toLowerCase()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pricing */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DollarSign className="h-4 w-4" />
                  Harga Dasar Bulanan
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`monthly-${tier.name}`}>Harga per Bulan (IDR)</Label>
                  <Input
                    id={`monthly-${tier.name}`}
                    type="number"
                    min="0"
                    value={tier.priceMonthly}
                    onChange={e =>
                      updateTier(tier.name, 'priceMonthly', parseInt(e.target.value) || 0)
                    }
                    disabled={tier.name === 'FREE'}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(tier.priceMonthly)}/bulan
                  </p>
                </div>
              </div>

              {/* Discounts */}
              {tier.name !== 'FREE' && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Percent className="h-4 w-4" />
                    Diskon Durasi
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor={`discount3-${tier.name}`} className="text-xs">
                        3 Bulan
                      </Label>
                      <div className="relative">
                        <Input
                          id={`discount3-${tier.name}`}
                          type="number"
                          min="0"
                          max="100"
                          value={tier.discount3Months}
                          onChange={e =>
                            updateTier(
                              tier.name,
                              'discount3Months',
                              Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                            )
                          }
                          className="pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`discount6-${tier.name}`} className="text-xs">
                        6 Bulan
                      </Label>
                      <div className="relative">
                        <Input
                          id={`discount6-${tier.name}`}
                          type="number"
                          min="0"
                          max="100"
                          value={tier.discount6Months}
                          onChange={e =>
                            updateTier(
                              tier.name,
                              'discount6Months',
                              Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                            )
                          }
                          className="pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`discount12-${tier.name}`} className="text-xs">
                        12 Bulan
                      </Label>
                      <div className="relative">
                        <Input
                          id={`discount12-${tier.name}`}
                          type="number"
                          min="0"
                          max="100"
                          value={tier.discount12Months}
                          onChange={e =>
                            updateTier(
                              tier.name,
                              'discount12Months',
                              Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                            )
                          }
                          className="pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Preview calculated prices */}
                  <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-2 rounded">
                    <p className="font-medium">Preview Harga:</p>
                    <p>
                      3 bulan:{' '}
                      {formatCurrency(
                        Math.round(tier.priceMonthly * 3 * (1 - tier.discount3Months / 100))
                      )}
                      {tier.discount3Months > 0 && (
                        <span className="text-green-600 ml-1">(-{tier.discount3Months}%)</span>
                      )}
                    </p>
                    <p>
                      6 bulan:{' '}
                      {formatCurrency(
                        Math.round(tier.priceMonthly * 6 * (1 - tier.discount6Months / 100))
                      )}
                      {tier.discount6Months > 0 && (
                        <span className="text-green-600 ml-1">(-{tier.discount6Months}%)</span>
                      )}
                    </p>
                    <p>
                      12 bulan:{' '}
                      {formatCurrency(
                        Math.round(tier.priceMonthly * 12 * (1 - tier.discount12Months / 100))
                      )}
                      {tier.discount12Months > 0 && (
                        <span className="text-green-600 ml-1">(-{tier.discount12Months}%)</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Credits */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Coins className="h-4 w-4" />
                  Kredit AI per Bulan
                </div>
                <Input
                  type="number"
                  min="0"
                  value={tier.credits}
                  onChange={e => updateTier(tier.name, 'credits', parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  {tier.credits.toLocaleString('id-ID')} kredit AI/bulan
                </p>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Check className="h-4 w-4" />
                  Fitur
                </div>

                <div className="space-y-2">
                  {tier.features.map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1"
                    >
                      <Check className="h-3 w-3 text-green-600 flex-shrink-0" />
                      <span className="flex-1">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(tier.name, index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Input
                    placeholder="Tambah fitur..."
                    value={newFeatures[tier.name] || ''}
                    onChange={e =>
                      setNewFeatures(prev => ({ ...prev, [tier.name]: e.target.value }))
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature(tier.name);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => addFeature(tier.name)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan Harga</CardTitle>
          <CardDescription>Perbandingan harga dan diskon antar tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tier</th>
                  <th className="text-right py-3 px-4 font-medium">Harga/Bulan</th>
                  <th className="text-center py-3 px-4 font-medium">Diskon 3 Bln</th>
                  <th className="text-center py-3 px-4 font-medium">Diskon 6 Bln</th>
                  <th className="text-center py-3 px-4 font-medium">Diskon 12 Bln</th>
                  <th className="text-right py-3 px-4 font-medium">Kredit AI</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(tier => (
                  <tr key={tier.name} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <Badge className={TIER_COLORS[tier.name]}>{TIER_LABELS[tier.name]}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {formatCurrency(tier.priceMonthly)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tier.name !== 'FREE' ? (
                        <span className="text-green-600 font-medium">{tier.discount3Months}%</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tier.name !== 'FREE' ? (
                        <span className="text-green-600 font-medium">{tier.discount6Months}%</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {tier.name !== 'FREE' ? (
                        <span className="text-green-600 font-medium">{tier.discount12Months}%</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">{tier.credits.toLocaleString('id-ID')}</td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={tier.isActive ? 'success' : 'secondary'}>
                        {tier.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
