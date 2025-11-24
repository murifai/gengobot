'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { Loader2 } from 'lucide-react';
import TaskEditorForm from '@/components/admin/TaskEditorForm';
import { Card, CardContent } from '@/components/ui/Card';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategoryId: string | null;
  difficulty: string;
  scenario: string;
  learningObjectives: string[];
  conversationExample: string;
  estimatedDuration: number;
  studyDeckIds: string[];
  // Voice settings
  prompt: string;
  voice: string;
  speakingSpeed: number;
  audioExample: string | null;
  isActive: boolean;
}

export default function EditTaskPage({ params }: { params: Promise<{ taskId: string }> }) {
  const resolvedParams = use(params);
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTask();
  }, []);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/tasks/${resolvedParams.taskId}`);
      if (response.ok) {
        const data = await response.json();
        setTask(data);
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-destructive">Task tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
        <p className="text-muted-foreground">Perbarui detail dan pengaturan task</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TaskEditorForm taskId={resolvedParams.taskId} initialData={task} />
        </CardContent>
      </Card>
    </div>
  );
}
