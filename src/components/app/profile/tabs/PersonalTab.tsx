'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { User, MapPin, Building, GraduationCap, Mail } from 'lucide-react';
import { UserProfile } from '../ProfilePage';

interface PersonalTabProps {
  user: UserProfile;
}

export function PersonalTab({ user }: PersonalTabProps) {
  const proficiencyLabels: Record<string, string> = {
    N5: 'JLPT N5',
    N4: 'JLPT N4',
    N3: 'JLPT N3',
    N2: 'JLPT N2',
    N1: 'JLPT N1',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Personal</CardTitle>
        <CardDescription>Data profil dan informasi belajar Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          {/* Nama Lengkap */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Nama Lengkap</p>
              <p className="text-base">{user.fullName || '-'}</p>
            </div>
          </div>

          {/* Nama Panggilan */}
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Nama Panggilan</p>
              <p className="text-base">{user.nickname || '-'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-base">{user.email}</p>
            </div>
          </div>

          {/* Domisili */}
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Domisili</p>
              <p className="text-base">{user.domicile || '-'}</p>
            </div>
          </div>

          {/* Institusi */}
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Institusi</p>
              <p className="text-base">{user.institution || '-'}</p>
            </div>
          </div>

          {/* Level Bahasa Jepang */}
          <div className="flex items-start gap-3">
            <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Level Bahasa Jepang</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {proficiencyLabels[user.proficiency] || user.proficiency}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
