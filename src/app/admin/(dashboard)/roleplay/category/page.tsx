'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Loader2,
  FolderTree,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const dynamic = 'force-dynamic';

interface TaskSubcategory {
  id: string;
  name: string;
  categoryId: string;
  _count?: {
    tasks: number;
  };
}

interface TaskCategory {
  id: string;
  name: string;
  subcategories?: TaskSubcategory[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Category form
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });

  // Subcategory form
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<string | null>(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState({ name: '', categoryId: '' });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/categories?includeSubcategories=true');

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch categories (${response.status})`);
      }

      const data = await response.json();
      setCategories(data.categories);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Category CRUD
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCategoryId ? `/api/categories/${editingCategoryId}` : '/api/categories';
      const method = editingCategoryId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      await fetchCategories();
      resetCategoryForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleEditCategory = (category: TaskCategory) => {
    setEditingCategoryId(category.id);
    setCategoryFormData({ name: category.name });
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will delete all subcategories under this category.')) return;

    try {
      const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({ name: '' });
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  // Subcategory CRUD
  const handleSubcategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSubcategoryId
        ? `/api/subcategories/${editingSubcategoryId}`
        : '/api/subcategories';
      const method = editingSubcategoryId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subcategoryFormData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save subcategory');
      }

      await fetchCategories();
      resetSubcategoryForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleAddSubcategory = (categoryId: string) => {
    setSubcategoryFormData({ name: '', categoryId });
    setShowSubcategoryForm(true);
    if (!expandedCategories.has(categoryId)) {
      toggleCategory(categoryId);
    }
  };

  const handleEditSubcategory = (subcategory: TaskSubcategory) => {
    setEditingSubcategoryId(subcategory.id);
    setSubcategoryFormData({ name: subcategory.name, categoryId: subcategory.categoryId });
    setShowSubcategoryForm(true);
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const response = await fetch(`/api/subcategories/${id}`, { method: 'DELETE' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete subcategory');
      }
      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const resetSubcategoryForm = () => {
    setSubcategoryFormData({ name: '', categoryId: '' });
    setEditingSubcategoryId(null);
    setShowSubcategoryForm(false);
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground">Kelola kategori dan subkategori task</p>
        </div>
        <Button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          variant={showCategoryForm ? 'outline' : 'default'}
          size="sm"
        >
          {showCategoryForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          {showCategoryForm ? 'Batal' : 'Tambah Kategori'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg flex justify-between items-center">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <Button onClick={fetchCategories} variant="destructive" size="sm">
            Coba Lagi
          </Button>
        </div>
      )}

      {/* Category Form */}
      {showCategoryForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCategoryId ? 'Edit Kategori' : 'Tambah Kategori Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nama Kategori *</label>
                <Input
                  type="text"
                  value={categoryFormData.name}
                  onChange={e => setCategoryFormData({ name: e.target.value })}
                  required
                  placeholder="e.g., Restaurant, Shopping, Travel"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">{editingCategoryId ? 'Perbarui' : 'Buat'} Kategori</Button>
                <Button type="button" variant="outline" onClick={resetCategoryForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Subcategory Form */}
      {showSubcategoryForm && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>
              {editingSubcategoryId ? 'Edit Subkategori' : 'Tambah Subkategori Baru'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubcategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kategori Induk *</label>
                <Select
                  value={subcategoryFormData.categoryId}
                  onValueChange={value =>
                    setSubcategoryFormData({ ...subcategoryFormData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nama Subkategori *</label>
                <Input
                  type="text"
                  value={subcategoryFormData.name}
                  onChange={e =>
                    setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })
                  }
                  required
                  placeholder="e.g., Jalan-jalan, Keseharian, Pekerjaan"
                />
              </div>
              <div className="flex gap-4">
                <Button type="submit">
                  {editingSubcategoryId ? 'Perbarui' : 'Buat'} Subkategori
                </Button>
                <Button type="button" variant="outline" onClick={resetSubcategoryForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Daftar Kategori ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <FolderTree className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Belum ada kategori. Buat yang pertama!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {categories.map(category => (
                <div key={category.id} className="border rounded-lg overflow-hidden">
                  {/* Category Header */}
                  <div className="p-4 flex justify-between items-center bg-muted/50">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleCategory(category.id)}
                      >
                        {expandedCategories.has(category.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <h3 className="font-semibold">{category.name}</h3>
                      <span className="text-sm text-muted-foreground">
                        ({category.subcategories?.length || 0} subkategori)
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSubcategory(category.id)}
                        title="Tambah Subkategori"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Sub
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditCategory(category)}
                        title="Edit Kategori"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeleteCategory(category.id)}
                        title="Hapus Kategori"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>

                  {/* Subcategories */}
                  {expandedCategories.has(category.id) && (
                    <div className="p-4 pt-2 space-y-2">
                      {category.subcategories && category.subcategories.length > 0 ? (
                        category.subcategories.map(sub => (
                          <div
                            key={sub.id}
                            className="flex justify-between items-center p-3 bg-muted/30 rounded-lg ml-6"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 bg-primary rounded-full"></div>
                              <span className="font-medium">{sub.name}</span>
                              {sub._count && (
                                <span className="text-sm text-muted-foreground">
                                  ({sub._count.tasks} tasks)
                                </span>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleEditSubcategory(sub)}
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                disabled={sub._count ? sub._count.tasks > 0 : false}
                                title={
                                  sub._count && sub._count.tasks > 0
                                    ? 'Tidak bisa dihapus: ada task terkait'
                                    : 'Hapus'
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground ml-6">
                          Belum ada subkategori. Klik &quot;+ Sub&quot; untuk menambah.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
