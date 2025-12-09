'use client';

import { User } from '@/types/user';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ChevronLeft, ChevronDown } from 'lucide-react';

interface Subcategory {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: Subcategory | null;
  difficulty: string;
  estimatedDuration: number;
}

interface TasksClientProps {
  user: User;
}

// Helper to display filter values
const displayValue = (value: string) => (value === 'Semua' ? 'Semua' : value);

export default function TasksClient({}: TasksClientProps) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('Semua');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Semua');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isSubcategoryOpen, setIsSubcategoryOpen] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    filterTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, selectedDifficulty, selectedCategory, selectedSubcategory]);

  // Reset subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory('Semua');
  }, [selectedCategory]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks?limit=100&isActive=true');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      // API returns { tasks: [...], pagination: {...} }
      setTasks(data.tasks || []);
      setFilteredTasks(data.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    if (selectedDifficulty !== 'Semua') {
      filtered = filtered.filter(task => task.difficulty === selectedDifficulty);
    }

    if (selectedCategory !== 'Semua') {
      filtered = filtered.filter(task => task.category === selectedCategory);
    }

    if (selectedSubcategory !== 'Semua') {
      filtered = filtered.filter(task => task.subcategory?.name === selectedSubcategory);
    }

    setFilteredTasks(filtered);
  };

  const startTask = (taskId: string) => {
    // Navigate to pre-task study page (route is directly at [taskId])
    router.push(`/app/kaiwa/roleplay/${taskId}`);
  };

  // Get unique difficulties and categories from tasks
  const difficulties = ['Semua', ...Array.from(new Set(tasks.map(task => task.difficulty))).sort()];
  const categories = ['Semua', ...Array.from(new Set(tasks.map(task => task.category))).sort()];

  // Get subcategories filtered by selected category
  const subcategories = [
    'Semua',
    ...Array.from(
      new Set(
        tasks
          .filter(task => selectedCategory === 'Semua' || task.category === selectedCategory)
          .map(task => task.subcategory?.name)
          .filter((name): name is string => !!name)
      )
    ).sort(),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b-2 border-border px-4 py-4 flex items-center gap-4">
        <button
          onClick={() => router.push('/kaiwa')}
          className="p-2 hover:bg-accent rounded-base transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-7 h-7 text-foreground" />
        </button>
        <h1 className="text-2xl font-bold">Roleplay</h1>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filter Section - Neo Brutalism Style */}
        <div className="mb-6 bg-card border-2 border-border rounded-base p-4 shadow-shadow">
          <h2 className="text-lg font-bold text-foreground mb-4">Filter</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Level</label>
              <div className="flex flex-wrap gap-2">
                {difficulties.map(difficulty => (
                  <button
                    key={difficulty}
                    onClick={() => setSelectedDifficulty(difficulty)}
                    className={`px-4 py-2 rounded-base text-sm font-bold border-2 border-border transition-all ${
                      selectedDifficulty === difficulty
                        ? 'bg-primary text-primary-foreground shadow-shadow translate-x-boxShadowX translate-y-boxShadowY'
                        : 'bg-card text-foreground hover:bg-muted shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none'
                    }`}
                  >
                    {displayValue(difficulty)}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter - Dropdown */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Kategori</label>
              <div className="relative">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`w-full px-4 py-2 rounded-base text-sm font-bold border-2 border-border transition-all flex items-center justify-between ${
                    selectedCategory !== 'Semua'
                      ? 'bg-primary text-primary-foreground shadow-shadow translate-x-boxShadowX translate-y-boxShadowY'
                      : 'bg-card text-foreground hover:bg-muted shadow-shadow'
                  }`}
                >
                  <span>{displayValue(selectedCategory)}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isCategoryOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-card border-2 border-border rounded-base shadow-shadow max-h-60 overflow-auto">
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm font-bold text-left transition-colors border-b border-border last:border-b-0 ${
                          selectedCategory === category
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {displayValue(category)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Subcategory Filter - Dropdown */}
            <div>
              <label className="block text-sm font-bold text-foreground mb-2">Subkategori</label>
              <div className="relative">
                <button
                  onClick={() => setIsSubcategoryOpen(!isSubcategoryOpen)}
                  className={`w-full px-4 py-2 rounded-base text-sm font-bold border-2 border-border transition-all flex items-center justify-between ${
                    selectedSubcategory !== 'Semua'
                      ? 'bg-primary text-primary-foreground shadow-shadow translate-x-boxShadowX translate-y-boxShadowY'
                      : 'bg-card text-foreground hover:bg-muted shadow-shadow'
                  }`}
                >
                  <span>{displayValue(selectedSubcategory)}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isSubcategoryOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isSubcategoryOpen && (
                  <div className="absolute z-10 mt-2 w-full bg-card border-2 border-border rounded-base shadow-shadow max-h-60 overflow-auto">
                    {subcategories.map(subcategory => (
                      <button
                        key={subcategory}
                        onClick={() => {
                          setSelectedSubcategory(subcategory);
                          setIsSubcategoryOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-sm font-bold text-left transition-colors border-b border-border last:border-b-0 ${
                          selectedSubcategory === subcategory
                            ? 'bg-primary text-primary-foreground'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        {displayValue(subcategory)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {(selectedDifficulty !== 'Semua' ||
            selectedCategory !== 'Semua' ||
            selectedSubcategory !== 'Semua') && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredTasks.length} dari {tasks.length} task
              </p>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Memuat task...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchTasks} className="mt-4">
              Coba Lagi
            </Button>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada task tersedia.</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Tidak ada task yang sesuai dengan filter. Coba ubah pilihan filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <Card key={task.id} className="p-6 flex flex-col gap-2">
                <h3 className="text-lg font-bold text-foreground">{task.title}</h3>
                <div className="flex flex-wrap gap-1">
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-base border border-border bg-primary text-primary-foreground">
                    {task.category}
                  </span>
                  {task.subcategory && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-base border border-border bg-chart-3 text-foreground">
                      {task.subcategory.name}
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-base border border-border bg-secondary text-secondary-foreground">
                    {task.difficulty}
                  </span>
                </div>
                <p className="text-muted-foreground line-clamp-2">{task.description}</p>
                <div className="flex justify-end mt-auto">
                  <Button onClick={() => startTask(task.id)}>Mulai</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
