'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Categories & Subcategories</h1>
        <button
          onClick={() => setShowCategoryForm(!showCategoryForm)}
          className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg hover:brightness-90"
        >
          {showCategoryForm ? <X size={20} /> : <Plus size={20} />}
          {showCategoryForm ? 'Cancel' : 'Add Category'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-primary/10 text-primary rounded-lg flex justify-between items-center">
          <div>
            <strong>Error:</strong> {error}
          </div>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-primary text-white rounded hover:brightness-90"
          >
            Retry
          </button>
        </div>
      )}

      {/* Category Form */}
      {showCategoryForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategoryId ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category Name *</label>
              <input
                type="text"
                value={categoryFormData.name}
                onChange={e => setCategoryFormData({ name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                placeholder="e.g., Restaurant, Shopping, Travel"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:brightness-90"
              >
                {editingCategoryId ? 'Update' : 'Create'} Category
              </button>
              <button
                type="button"
                onClick={resetCategoryForm}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Subcategory Form */}
      {showSubcategoryForm && (
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg border-2 border-blue-500">
          <h2 className="text-xl font-semibold mb-4">
            {editingSubcategoryId ? 'Edit Subcategory' : 'Add New Subcategory'}
          </h2>
          <form onSubmit={handleSubcategorySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Parent Category *</label>
              <select
                value={subcategoryFormData.categoryId}
                onChange={e =>
                  setSubcategoryFormData({ ...subcategoryFormData, categoryId: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subcategory Name *</label>
              <input
                type="text"
                value={subcategoryFormData.name}
                onChange={e =>
                  setSubcategoryFormData({ ...subcategoryFormData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                required
                placeholder="e.g., Jalan-jalan, Keseharian, Pekerjaan"
              />
            </div>
            <div className="flex gap-4">
              <button
                type="submit"
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:brightness-90"
              >
                {editingSubcategoryId ? 'Update' : 'Create'} Subcategory
              </button>
              <button
                type="button"
                onClick={resetSubcategoryForm}
                className="px-6 py-2 bg-gray-300 dark:bg-gray-600 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No categories found. Create your first one!
          </div>
        ) : (
          categories.map(category => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
            >
              {/* Category Header */}
              <div className="p-6 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white dark:from-gray-800 dark:to-gray-700">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="p-1 hover:bg-secondary/10 rounded"
                  >
                    {expandedCategories.has(category.id) ? (
                      <ChevronDown size={20} />
                    ) : (
                      <ChevronRight size={20} />
                    )}
                  </button>
                  <h3 className="text-xl font-semibold">{category.name}</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ({category.subcategories?.length || 0} subcategories)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddSubcategory(category.id)}
                    className="px-3 py-1 text-sm bg-tertiary-green text-white rounded hover:brightness-90"
                    title="Add Subcategory"
                  >
                    <Plus size={16} className="inline" /> Sub
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-blue-600 hover:bg-secondary/10 rounded-lg"
                    title="Edit Category"
                  >
                    <Edit2 size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="p-2 text-red-600 hover:bg-primary/10 rounded-lg"
                    title="Delete Category"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.has(category.id) && (
                <div className="p-6 pt-0 space-y-2">
                  {category.subcategories && category.subcategories.length > 0 ? (
                    category.subcategories.map(sub => (
                      <div
                        key={sub.id}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg ml-8"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-secondary rounded-full"></div>
                          <span className="font-medium">{sub.name}</span>
                          {sub._count && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ({sub._count.tasks} tasks)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditSubcategory(sub)}
                            className="p-2 text-blue-600 hover:bg-secondary/10 rounded-lg"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteSubcategory(sub.id)}
                            className="p-2 text-red-600 hover:bg-primary/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={sub._count ? sub._count.tasks > 0 : false}
                            title={
                              sub._count && sub._count.tasks > 0
                                ? 'Cannot delete: has associated tasks'
                                : 'Delete'
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 ml-8">
                      No subcategories. Click &quot;+ Sub&quot; to add one.
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
