'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Shield,
  Eye,
  UserCog,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Label } from '@/components/ui/label';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
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
import { AdminRole } from '@prisma/client';
import { toast } from 'sonner';
import { useAdminRole } from '@/hooks/useAdminRole';

interface AdminItem {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  VIEWER: 'Viewer',
};

const ROLE_COLORS: Record<AdminRole, string> = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-800',
  ADMIN: 'bg-blue-100 text-blue-800',
  VIEWER: 'bg-gray-100 text-gray-800',
};

const ROLE_ICONS: Record<AdminRole, typeof Shield> = {
  SUPER_ADMIN: Shield,
  ADMIN: UserCog,
  VIEWER: Eye,
};

export default function AdminListPage() {
  const [currentAdmin, setCurrentAdmin] = useState<AdminItem | null>(null);
  const [admins, setAdmins] = useState<AdminItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Use admin role utilities
  const roleUtils = useAdminRole(currentAdmin?.role || 'VIEWER');

  // Create dialog state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    email: '',
    password: '',
    name: '',
    role: 'ADMIN' as AdminRole,
  });

  // Edit dialog state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    role: 'ADMIN' as AdminRole,
  });

  // Fetch current admin profile
  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      try {
        const response = await fetch('/api/admin/admins/profile');
        const data = await response.json();
        if (response.ok) {
          setCurrentAdmin(data.admin);
        }
      } catch (error) {
        console.error('Failed to fetch current admin:', error);
      }
    };
    fetchCurrentAdmin();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (search) params.set('search', search);
      if (roleFilter !== 'all') params.set('role', roleFilter);

      const response = await fetch(`/api/admin/admins?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAdmins(data.admins);
        setTotalPages(data.totalPages);
      } else {
        toast.error('Gagal memuat data admin');
      }
    } catch (error) {
      console.error('Failed to fetch admins:', error);
      toast.error('Gagal memuat data admin');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, roleFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchAdmins();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Admin berhasil ditambahkan');
        setIsCreateOpen(false);
        setCreateForm({ email: '', password: '', name: '', role: 'ADMIN' });
        fetchAdmins();
      } else {
        toast.error(data.error || 'Gagal menambahkan admin');
      }
    } catch (error) {
      console.error('Failed to create admin:', error);
      toast.error('Gagal menambahkan admin');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setIsEditing(true);

    try {
      const response = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Admin berhasil diupdate');
        setIsEditOpen(false);
        setEditingAdmin(null);
        fetchAdmins();
      } else {
        toast.error(data.error || 'Gagal mengupdate admin');
      }
    } catch (error) {
      console.error('Failed to update admin:', error);
      toast.error('Gagal mengupdate admin');
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleActive = async (admin: AdminItem) => {
    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(admin.isActive ? 'Admin dinonaktifkan' : 'Admin diaktifkan');
        fetchAdmins();
      } else {
        toast.error(data.error || 'Gagal mengubah status admin');
      }
    } catch (error) {
      console.error('Failed to toggle admin:', error);
      toast.error('Gagal mengubah status admin');
    }
  };

  const handleDelete = async (admin: AdminItem) => {
    if (!confirm(`Yakin ingin menghapus admin "${admin.name}"?`)) return;

    try {
      const response = await fetch(`/api/admin/admins/${admin.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Admin berhasil dihapus');
        fetchAdmins();
      } else {
        toast.error(data.error || 'Gagal menghapus admin');
      }
    } catch (error) {
      console.error('Failed to delete admin:', error);
      toast.error('Gagal menghapus admin');
    }
  };

  const openEditDialog = (admin: AdminItem) => {
    setEditingAdmin(admin);
    setEditForm({ name: admin.name, role: admin.role });
    setIsEditOpen(true);
  };

  const canCreate = roleUtils.can('admins.create');
  const canEdit = roleUtils.can('admins.edit');
  const canDelete = roleUtils.can('admins.delete');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daftar Admin</h1>
          <p className="text-muted-foreground">Kelola akun admin dashboard</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Admin
          </Button>
        )}
      </div>

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
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Role</SelectItem>
                <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="VIEWER">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Admin List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Admin ({admins.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada admin</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Admin</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Role</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden sm:table-cell">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden md:table-cell">
                      Login Terakhir
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map(admin => {
                    const RoleIcon = ROLE_ICONS[admin.role];
                    const isSelf = admin.id === currentAdmin?.id;

                    return (
                      <tr key={admin.id} className="border-b last:border-0">
                        <td className="py-3 px-2 sm:px-4">
                          <div>
                            <p className="font-medium truncate max-w-[100px] sm:max-w-none">
                              {admin.name}
                              {isSelf && (
                                <span className="ml-2 text-xs text-muted-foreground">(Anda)</span>
                              )}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground truncate max-w-[100px] sm:max-w-none">
                              {admin.email}
                            </p>
                            {/* Show status on mobile */}
                            <div className="sm:hidden mt-1">
                              <Badge
                                variant={admin.isActive ? 'success' : 'secondary'}
                                className="text-xs"
                              >
                                {admin.isActive ? 'Aktif' : 'Nonaktif'}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2 sm:px-4">
                          <Badge
                            className={`${ROLE_COLORS[admin.role]} flex items-center gap-1 w-fit text-xs`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            <span className="hidden sm:inline">{ROLE_LABELS[admin.role]}</span>
                            <span className="sm:hidden">
                              {admin.role === 'SUPER_ADMIN'
                                ? 'SA'
                                : admin.role === 'ADMIN'
                                  ? 'A'
                                  : 'V'}
                            </span>
                          </Badge>
                        </td>
                        <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                          <Badge
                            variant={admin.isActive ? 'success' : 'secondary'}
                            className="text-xs"
                          >
                            {admin.isActive ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-muted-foreground hidden md:table-cell">
                          {admin.lastLogin
                            ? new Date(admin.lastLogin).toLocaleString('id-ID')
                            : 'Belum pernah login'}
                        </td>
                        <td className="py-3 px-2 sm:px-4 text-right">
                          {(canEdit || canDelete) && !isSelf && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {canEdit && (
                                  <>
                                    <DropdownMenuItem onClick={() => openEditDialog(admin)}>
                                      <Pencil className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleActive(admin)}>
                                      {admin.isActive ? (
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
                                  </>
                                )}
                                {canDelete && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => handleDelete(admin)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Hapus
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onClose={() => setIsCreateOpen(false)}>
        <DialogTitle>Tambah Admin Baru</DialogTitle>
        <DialogDescription>Buat akun admin baru untuk dashboard</DialogDescription>
        <form onSubmit={handleCreate}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="create-name">Nama</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={e => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={e => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password</Label>
              <Input
                id="create-password"
                type="password"
                value={createForm.password}
                onChange={e => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Minimal 8 karakter"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(value: AdminRole) =>
                  setCreateForm(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Tambah Admin
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onClose={() => setIsEditOpen(false)}>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogDescription>Ubah informasi admin {editingAdmin?.email}</DialogDescription>
        <form onSubmit={handleEdit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value: AdminRole) =>
                  setEditForm(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="VIEWER">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={isEditing}>
              {isEditing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
