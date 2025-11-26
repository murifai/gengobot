'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { CreditCard, AlertTriangle, Trash2, LogOut } from 'lucide-react';
import { UserProfile } from '../ProfilePage';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface AccountSecurityTabProps {
  user: UserProfile;
}

export function AccountSecurityTab({ user }: AccountSecurityTabProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/login');
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Gagal menghapus akun. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription Plan
          </CardTitle>
          <CardDescription>Kelola paket langganan Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">
                  {user.subscriptionPlan === 'premium' ? 'Premium Plan' : 'Free Plan'}
                </span>
                <Badge variant={user.subscriptionPlan === 'premium' ? 'default' : 'secondary'}>
                  {user.subscriptionPlan === 'premium' ? 'Active' : 'Free'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {user.subscriptionPlan === 'premium'
                  ? 'Akses ke semua fitur premium'
                  : 'Akses terbatas ke fitur dasar'}
              </p>
            </div>
            <Button variant="outline">
              {user.subscriptionPlan === 'premium' ? 'Kelola Langganan' : 'Upgrade ke Premium'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Keluar
          </CardTitle>
          <CardDescription>Keluar dari akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Logout</p>
              <p className="text-sm text-muted-foreground">Anda akan keluar dari sesi saat ini</p>
            </div>
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Tindakan yang tidak dapat dibatalkan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Hapus Akun</p>
              <p className="text-sm text-muted-foreground">
                Hapus akun dan semua data Anda secara permanen
              </p>
            </div>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Hapus Akun
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Hapus Akun</DialogTitle>
        <DialogDescription>
          Apakah Anda yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan dan semua
          data Anda akan dihapus secara permanen.
        </DialogDescription>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeleting}>
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
