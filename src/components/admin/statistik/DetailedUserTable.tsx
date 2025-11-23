'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string;
  proficiency: string;
  ageRange: string | null;
  gender: string | null;
  domicile: string | null;
  institution: string | null;
  learningDuration: string | null;
  subscriptionPlan: string;
  subscriptionTier: string;
  createdAt: string;
  updatedAt: string;
}

interface DetailedUserTableProps {
  users: User[];
  onExport: () => void;
  isExporting: boolean;
}

const TIER_STYLES = {
  FREE: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  BASIC: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  PRO: 'bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300',
};

const LEVEL_STYLES: Record<string, string> = {
  N5: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  N4: 'bg-lime-100 text-lime-700 dark:bg-lime-900 dark:text-lime-300',
  N3: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  N2: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
  N1: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
};

const PAGE_SIZE = 20;

export function DetailedUserTable({ users, onExport, isExporting }: DetailedUserTableProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        user.name?.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.domicile?.toLowerCase().includes(searchLower) ||
        user.institution?.toLowerCase().includes(searchLower);

      // Level filter
      const matchesLevel = levelFilter === 'all' || user.proficiency === levelFilter;

      // Tier filter
      const matchesTier = tierFilter === 'all' || user.subscriptionTier === tierFilter;

      return matchesSearch && matchesLevel && matchesTier;
    });
  }, [users, search, levelFilter, tierFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);
  const paginatedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Detailed User Data</CardTitle>
            <CardDescription>
              {filteredUsers.length} of {users.length} users
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onExport} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, location..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9"
            />
          </div>
          <Select value={levelFilter} onValueChange={handleFilterChange(setLevelFilter)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="N5">N5</SelectItem>
              <SelectItem value="N4">N4</SelectItem>
              <SelectItem value="N3">N3</SelectItem>
              <SelectItem value="N2">N2</SelectItem>
              <SelectItem value="N1">N1</SelectItem>
            </SelectContent>
          </Select>
          <Select value={tierFilter} onValueChange={handleFilterChange(setTierFilter)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Tier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="FREE">Free</SelectItem>
              <SelectItem value="BASIC">Basic</SelectItem>
              <SelectItem value="PRO">Pro</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-center p-3 font-medium">Level</th>
                <th className="text-center p-3 font-medium">Tier</th>
                <th className="text-left p-3 font-medium">Location</th>
                <th className="text-left p-3 font-medium">Institution</th>
                <th className="text-left p-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map(user => (
                <tr key={user.id} className="border-t hover:bg-muted/50">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{user.name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary" className={LEVEL_STYLES[user.proficiency] || ''}>
                      {user.proficiency}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Badge
                      variant="secondary"
                      className={
                        TIER_STYLES[user.subscriptionTier as keyof typeof TIER_STYLES] || ''
                      }
                    >
                      {user.subscriptionTier}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{user.domicile || '-'}</td>
                  <td className="p-3 text-muted-foreground">{user.institution || '-'}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString('id-ID')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedUsers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No users found matching your filters
            </p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
