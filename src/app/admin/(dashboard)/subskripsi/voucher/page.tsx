'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Tag,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { VoucherType } from '@prisma/client';

interface VoucherItem {
  id: string;
  code: string;
  name: string;
  type: VoucherType;
  value: number;
  isActive: boolean;
  currentUses: number;
  maxUses: number | null;
  endDate: string | null;
  stats: {
    totalRedemptions: number;
    totalDiscountGiven: number;
  };
}

export default function VouchersPage() {
  const [vouchers, setVouchers] = useState<VoucherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.set('search', search);
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('isActive', statusFilter);

      const response = await fetch(`/api/admin/vouchers?${params}`);
      const data = await response.json();

      if (response.ok) {
        setVouchers(data.vouchers);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch vouchers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVouchers();
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchVouchers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/vouchers/${id}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        setVouchers(prev => prev.map(v => (v.id === id ? { ...v, isActive: !currentStatus } : v)));
      }
    } catch (error) {
      console.error('Failed to toggle voucher:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this voucher?')) return;

    try {
      const response = await fetch(`/api/admin/vouchers/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setVouchers(prev => prev.filter(v => v.id !== id));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete voucher');
      }
    } catch (error) {
      console.error('Failed to delete voucher:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeLabel = (type: VoucherType) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'Persentase';
      case 'FIXED_AMOUNT':
        return 'Nominal';
      case 'BONUS_CREDITS':
        return 'Bonus Kredit';
      case 'TRIAL_EXTENSION':
        return 'Perpanjangan Trial';
      case 'TIER_UPGRADE':
        return 'Upgrade Tier';
      default:
        return type;
    }
  };

  const getValueDisplay = (type: VoucherType, value: number) => {
    switch (type) {
      case 'PERCENTAGE':
        return `${value}%`;
      case 'FIXED_AMOUNT':
        return formatCurrency(value);
      case 'BONUS_CREDITS':
        return `${value.toLocaleString()} kredit`;
      case 'TRIAL_EXTENSION':
        return `${value} hari`;
      case 'TIER_UPGRADE':
        return 'Upgrade';
      default:
        return value.toString();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Voucher Management</h1>
          <p className="text-muted-foreground">Kelola voucher dan kode promo untuk subscription</p>
        </div>
        <Link href="/admin/subskripsi/voucher/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Buat Voucher
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari kode atau nama voucher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="PERCENTAGE">Persentase</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Nominal</SelectItem>
                <SelectItem value="BONUS_CREDITS">Bonus Kredit</SelectItem>
                <SelectItem value="TRIAL_EXTENSION">Perpanjangan Trial</SelectItem>
                <SelectItem value="TIER_UPGRADE">Upgrade Tier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="true">Aktif</SelectItem>
                <SelectItem value="false">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Voucher List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Daftar Voucher
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada voucher</p>
              <Link href="/admin/subskripsi/voucher/new">
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Buat Voucher Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Voucher</th>
                    <th className="text-left py-3 px-4 font-medium">Tipe</th>
                    <th className="text-left py-3 px-4 font-medium">Nilai</th>
                    <th className="text-left py-3 px-4 font-medium">Penggunaan</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map(voucher => (
                    <tr key={voucher.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{voucher.name}</p>
                          <p className="text-sm text-muted-foreground font-mono">{voucher.code}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="secondary">{getTypeLabel(voucher.type)}</Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {getValueDisplay(voucher.type, voucher.value)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm">
                            {voucher.currentUses}
                            {voucher.maxUses ? ` / ${voucher.maxUses}` : ' (unlimited)'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatCurrency(voucher.stats.totalDiscountGiven)} diskon
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={voucher.isActive ? 'success' : 'secondary'}>
                          {voucher.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link href={`/admin/subskripsi/voucher/${voucher.id}`}>
                              <DropdownMenuItem>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            </Link>
                            <Link href={`/admin/subskripsi/voucher/${voucher.id}/redemptions`}>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Lihat Redemptions
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(voucher.id, voucher.isActive)}
                            >
                              {voucher.isActive ? (
                                <>
                                  <ToggleLeft className="h-4 w-4 mr-2" />
                                  Nonaktifkan
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="h-4 w-4 mr-2" />
                                  Aktifkan
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(voucher.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
