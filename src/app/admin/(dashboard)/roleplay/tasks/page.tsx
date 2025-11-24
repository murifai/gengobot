'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Download,
  Upload,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  isActive: boolean;
  usageCount: number;
  averageScore: number | null;
  createdAt: string;
  character?: {
    id: string;
    name: string;
  };
  _count?: {
    taskAttempts: number;
    conversations: number;
  };
}

export default function AdminTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    total: number;
    success: number;
    failed: number;
    errors: Array<{ row: number; error: string }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks?limit=100');
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId: string, taskTitle: string) => {
    const choice = window.confirm(
      `Do you want to permanently delete "${taskTitle}"?\n\nOK = Permanently Delete (cannot be undone)\nCancel = Keep task`
    );

    if (!choice) return;

    // Show second confirmation for permanent deletion
    const confirmHardDelete = window.confirm(
      '⚠️ WARNING: This will PERMANENTLY delete:\n\n' +
        '• The task\n' +
        '• All task attempts by users\n' +
        '• All related conversations\n\n' +
        'This action CANNOT be undone!\n\n' +
        'Click OK to confirm permanent deletion.'
    );

    if (!confirmHardDelete) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}?deletedBy=admin&hard=true`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Task permanently deleted successfully');
        fetchTasks();
      } else {
        const data = await response.json();
        alert(`Failed to delete task: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/tasks/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task_import_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template');
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('importedBy', 'admin');

      const response = await fetch('/api/tasks/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportResults(data.results);
        fetchTasks();
      } else {
        alert(`Import failed: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Error importing tasks:', error);
      alert('Failed to import tasks');
    } finally {
      setImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || task.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = Array.from(new Set(tasks.map(t => t.category)));
  const difficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-muted-foreground">Manage conversation tasks for task-based chat mode</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktif</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Attempts</p>
                <p className="text-2xl font-bold">
                  {tasks.reduce((sum, t) => sum + (t._count?.taskAttempts || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <MessageSquare className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg Score</p>
                <p className="text-2xl font-bold">
                  {tasks.length > 0
                    ? (
                        tasks.reduce((sum, t) => sum + (t.averageScore || 0), 0) / tasks.length
                      ).toFixed(1)
                    : '0'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari task..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Template
              </Button>
              <Button variant="outline" size="sm" onClick={handleImportClick} disabled={importing}>
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importing...' : 'Import'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button size="sm" onClick={() => router.push('/admin/roleplay/tasks/new')}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Task
              </Button>
            </div>
          </div>

          {/* Import Results */}
          {importResults && (
            <div className="mb-4 p-4 bg-secondary/10 rounded-lg border border-secondary/30">
              <h3 className="font-semibold text-secondary mb-2">Import Results</h3>
              <div className="text-sm text-foreground space-y-1">
                <p>Total rows: {importResults.total}</p>
                <p className="text-tertiary-green">
                  Successfully imported: {importResults.success}
                </p>
                {importResults.failed > 0 && (
                  <>
                    <p className="text-primary">Failed: {importResults.failed}</p>
                    <div className="mt-2 max-h-40 overflow-y-auto">
                      <p className="font-semibold mb-1">Errors:</p>
                      {importResults.errors.map((err, idx) => (
                        <p key={idx} className="text-xs">
                          Row {err.row}: {err.error}
                        </p>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setImportResults(null)}
                className="mt-2 text-xs text-secondary hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground self-center">Level:</span>
              <Button
                variant={filterDifficulty === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterDifficulty('all')}
              >
                Semua
              </Button>
              {difficulties.map(diff => (
                <Button
                  key={diff}
                  variant={filterDifficulty === diff ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterDifficulty(diff)}
                >
                  {diff}
                </Button>
              ))}
            </div>

            {categories.length > 0 && (
              <div className="flex flex-wrap gap-2 ml-4">
                <span className="text-sm text-muted-foreground self-center">Kategori:</span>
                <Button
                  variant={filterCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterCategory('all')}
                >
                  Semua
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={filterCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Daftar Tasks ({filteredTasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Tidak ada task ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Task</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden sm:table-cell">
                      Kategori
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium">Level</th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden md:table-cell">
                      Attempts
                    </th>
                    <th className="text-left py-3 px-2 sm:px-4 font-medium hidden lg:table-cell">
                      Status
                    </th>
                    <th className="text-right py-3 px-2 sm:px-4 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map(task => (
                    <tr key={task.id} className="border-b last:border-0">
                      <td className="py-3 px-2 sm:px-4">
                        <div>
                          <p className="font-medium truncate max-w-[150px] sm:max-w-none">
                            {task.title}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {task.description}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden sm:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {task.category}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4">
                        <Badge
                          className={`text-xs ${
                            task.difficulty === 'N5' || task.difficulty === 'N4'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : task.difficulty === 'N3'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}
                        >
                          {task.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden md:table-cell">
                        {task._count?.taskAttempts || 0}
                      </td>
                      <td className="py-3 px-2 sm:px-4 hidden lg:table-cell">
                        <Badge
                          variant={task.isActive ? 'success' : 'secondary'}
                          className="text-xs"
                        >
                          {task.isActive ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/admin/roleplay/tasks/${task.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => router.push(`/admin/roleplay/tasks/${task.id}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(task.id, task.title)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
