'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreditCard, AlertTriangle, Trash2, LogOut, Zap, ChevronRight, Moon } from 'lucide-react';
import { UserProfile } from '../ProfilePage';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useSubscription } from '@/hooks/useSubscription';
import { SubscriptionTier } from '@prisma/client';

interface SettingTabProps {
  user: UserProfile;
}

export function SettingTab({ user }: SettingTabProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { balance, isLoading: isSubscriptionLoading, tier } = useSubscription();

  const handleUpgrade = () => {
    router.push('/app/upgrade');
  };

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

  const getTierBadgeVariant = ():
    | 'default'
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger' => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return 'primary';
      case SubscriptionTier.BASIC:
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getTierLabel = () => {
    switch (tier) {
      case SubscriptionTier.PRO:
        return 'Pro';
      case SubscriptionTier.BASIC:
        return 'Basic';
      default:
        return 'Free';
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('id-ID').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Langganan */}
      {isSubscriptionLoading ? (
        <Card>
          <CardContent className="py-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <CardTitle className="text-base">Langganan</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Paket</span>
              <Badge variant={getTierBadgeVariant()}>{getTierLabel()}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Saldo Kredit</span>
              <span className="text-sm font-semibold">
                {balance ? formatNumber(balance.remaining) : '—'}
              </span>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {tier !== SubscriptionTier.PRO && (
                <Button className="w-full" onClick={handleUpgrade}>
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-between"
                onClick={() => router.push('/app/subscription')}
              >
                <span>Detail Langganan</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tampilan */}
      <Card>
        <CardHeader>
          <CardTitle>Tampilan</CardTitle>
          <CardDescription>Sesuaikan tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label htmlFor="dark-mode" className="text-base font-medium">
                  Mode Gelap
                </Label>
                <p className="text-sm text-muted-foreground">
                  Gunakan tema gelap untuk tampilan yang lebih nyaman di mata
                </p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={theme === 'dark'}
              onCheckedChange={checked => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Logout</p>
                <p className="text-sm text-muted-foreground">Keluar dari sesi saat ini</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>
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
