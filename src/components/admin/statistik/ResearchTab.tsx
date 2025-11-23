'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { ClipboardList, FileText, BarChart3, Users } from 'lucide-react';

export function ResearchTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hasil Survey Riset</CardTitle>
          <CardDescription>Placeholder untuk data hasil survey riset tesis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Survey Data Coming Soon</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Data hasil survey untuk riset tesis akan ditampilkan di sini. Fitur ini sedang dalam
              pengembangan.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rencana Fitur Riset</CardTitle>
          <CardDescription>Fitur-fitur yang akan tersedia untuk analisis riset</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Hasil Kuesioner</h4>
                <p className="text-xs text-muted-foreground">
                  Tampilan hasil kuesioner dari responden
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <BarChart3 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Analisis Statistik</h4>
                <p className="text-xs text-muted-foreground">Grafik dan visualisasi data survey</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <Users className="h-5 w-5 text-purple-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Demografi Responden</h4>
                <p className="text-xs text-muted-foreground">Profil dan karakteristik responden</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-lg border">
              <ClipboardList className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm">Ringkasan Temuan</h4>
                <p className="text-xs text-muted-foreground">
                  Ringkasan hasil dan kesimpulan riset
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
