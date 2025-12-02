'use client';

import { useEffect, useState } from 'react';
import { Users, Search, Loader2, UserCheck, UserPlus, Crown, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface UserItem {
  id: string;
  email: string;
  name: string | null;
  fullName: string | null;
  nickname: string | null;
  proficiency: string;
  subscriptionPlan: string;
  onboardingCompleted: boolean;
  domicile: string | null;
  institution: string | null;
  createdAt: string;
  lastActive: string | null;
}

interface UserStats {
  total: number;
  active30d: number;
  newThisMonth: number;
  proUsers: number;
  basicUsers: number;
}

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-100 text-gray-800',
  basic: 'bg-blue-100 text-blue-800',
  pro: 'bg-purple-100 text-purple-800',
};

const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  basic: 'Basic',
  pro: 'Pro',
};

const LEVEL_COLORS: Record<string, string> = {
  N5: 'bg-green-100 text-green-800',
  N4: 'bg-blue-100 text-blue-800',
  N3: 'bg-yellow-100 text-yellow-800',
  N2: 'bg-orange-100 text-orange-800',
  N1: 'bg-red-100 text-red-800',
};

export default function PenggunaPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.set('search', search);
      if (levelFilter !== 'all') params.set('proficiency', levelFilter);
      if (tierFilter !== 'all') params.set('tier', tierFilter);

      const response = await fetch(`/api/admin/analytics/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
        setStats(data.stats || null);
        setTotalPages(data.totalPages || 1);
        setTotal(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, levelFilter, tierFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengguna</h1>
        <p className="text-muted-foreground">Lihat data pengguna aplikasi (read-only)</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Pengguna</p>
                  <p className="text-2xl font-bold">{stats.total.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Aktif (30 hari)</p>
                  <p className="text-2xl font-bold">{stats.active30d.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserPlus className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Baru (bulan ini)</p>
                  <p className="text-2xl font-bold">{stats.newThisMonth.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Crown className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pro Users</p>
                  <p className="text-2xl font-bold">{stats.proUsers.toLocaleString('id-ID')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama atau email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Level</SelectItem>
                <SelectItem value="N5">N5</SelectItem>
                <SelectItem value="N4">N4</SelectItem>
                <SelectItem value="N3">N3</SelectItem>
                <SelectItem value="N2">N2</SelectItem>
                <SelectItem value="N1">N1</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tier</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* User List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Pengguna ({total.toLocaleString('id-ID')})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada pengguna ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Pengguna</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Level</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden sm:table-cell">
                      Tier
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden md:table-cell">
                      Domisili
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden lg:table-cell">
                      Bergabung
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} className="border-b last:border-0">
                      <td className="py-3 px-2 sm:px-4">
                        <div>
                          <p className="font-medium truncate max-w-[120px] sm:max-w-none">
                            {user.fullName || user.nickname || user.name || 'Unnamed'}
                          </p>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                            {user.email}
                          </p>
                          {/* Show tier on mobile */}
                          <div className="sm:hidden mt-1">
                            <Badge
                              className={`text-xs ${TIER_COLORS[user.subscriptionPlan] || TIER_COLORS.free}`}
                            >
                              {TIER_LABELS[user.subscriptionPlan] || 'Free'}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <Badge
                          className={`text-xs ${LEVEL_COLORS[user.proficiency] || 'bg-gray-100'}`}
                        >
                          {user.proficiency}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <Badge
                          className={`text-xs ${TIER_COLORS[user.subscriptionPlan] || TIER_COLORS.free}`}
                        >
                          {TIER_LABELS[user.subscriptionPlan] || 'Free'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-muted-foreground hidden md:table-cell">
                        {user.domicile || '-'}
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-muted-foreground hidden lg:table-cell">
                        {new Date(user.createdAt).toLocaleDateString('id-ID')}
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
