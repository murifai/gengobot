'use client';

import TaskEditorForm from '@/components/admin/TaskEditorForm';
import { Card, CardContent } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

export default function NewTaskPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Buat Task Baru</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TaskEditorForm />
        </CardContent>
      </Card>
    </div>
  );
}
