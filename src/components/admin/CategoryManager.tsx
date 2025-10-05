'use client';

import React, { useState } from 'react';

interface TaskCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  sortOrder: number;
  taskCount: number;
}

interface CategoryManagerProps {
  categories: TaskCategory[];
  onUpdate: (categoryId: string, data: Partial<TaskCategory>) => Promise<void>;
  onCreate: (data: Omit<TaskCategory, 'id' | 'taskCount'>) => Promise<void>;
  onDelete: (categoryId: string) => Promise<void>;
  onReorder: (categories: TaskCategory[]) => Promise<void>;
}

export default function CategoryManager({
  categories,
  onUpdate,
  onCreate,
  onDelete,
  onReorder,
}: CategoryManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.description.trim()) return;

    await onCreate({
      name: formData.name,
      description: formData.description,
      icon: formData.icon || '📁',
      sortOrder: categories.length,
    });

    setFormData({ name: '', description: '', icon: '' });
    setIsCreating(false);
  };

  const handleUpdate = async (categoryId: string) => {
    await onUpdate(categoryId, formData);
    setEditingId(null);
    setFormData({ name: '', description: '', icon: '' });
  };

  const startEdit = (category: TaskCategory) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', icon: '' });
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === categories.length - 1)
    ) {
      return;
    }

    const newCategories = [...categories];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newCategories[index], newCategories[targetIndex]] = [newCategories[targetIndex], newCategories[index]];

    // Update sortOrder for all affected categories
    newCategories.forEach((cat, idx) => {
      cat.sortOrder = idx;
    });

    await onReorder(newCategories);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold text-xl">Task Categories</h2>
        <button
          onClick={() => setIsCreating(true)}
          disabled={isCreating}
          className="bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2 px-6 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          + Add Category
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
          <h3 className="text-white font-medium mb-4">Create New Category</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-white text-sm mb-2">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                  placeholder="e.g., Restaurant"
                />
              </div>
              <div>
                <label className="block text-white text-sm mb-2">Icon (Emoji)</label>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={e => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-center text-2xl"
                  placeholder="🍜"
                  maxLength={2}
                />
              </div>
            </div>
            <div>
              <label className="block text-white text-sm mb-2">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="e.g., Food ordering and dining scenarios"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="px-6 py-2 bg-secondary text-white rounded hover:bg-secondary/90"
              >
                Create
              </button>
              <button
                onClick={cancelEdit}
                className="px-6 py-2 bg-dark text-white rounded hover:bg-dark/90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={category.id} className="bg-tertiary-purple rounded-lg shadow-lg p-6">
            {editingId === category.id ? (
              /* Edit Form */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm mb-2">Category Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={e => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary text-center text-2xl"
                      maxLength={2}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white text-sm mb-2">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(category.id)}
                    className="px-6 py-2 bg-secondary text-white rounded hover:bg-secondary/90"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-6 py-2 bg-dark text-white rounded hover:bg-dark/90"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Mode */
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-4xl">{category.icon || '📁'}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-lg">{category.name}</h3>
                    <p className="text-gray-400 text-sm">{category.description}</p>
                    <p className="text-gray-500 text-xs mt-1">{category.taskCount} tasks</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveCategory(index, 'up')}
                    disabled={index === 0}
                    className="p-2 bg-dark text-white rounded hover:bg-dark/90 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveCategory(index, 'down')}
                    disabled={index === categories.length - 1}
                    className="p-2 bg-dark text-white rounded hover:bg-dark/90 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => startEdit(category)}
                    className="px-4 py-2 bg-secondary text-white rounded hover:bg-secondary/90 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (category.taskCount > 0) {
                        alert(`Cannot delete category "${category.name}" because it has ${category.taskCount} tasks.`);
                      } else if (confirm(`Are you sure you want to delete "${category.name}"?`)) {
                        onDelete(category.id);
                      }
                    }}
                    disabled={category.taskCount > 0}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categories.length === 0 && !isCreating && (
        <div className="bg-tertiary-purple rounded-lg shadow-lg p-12 text-center">
          <p className="text-gray-400 text-lg">No categories yet. Create your first category to get started!</p>
        </div>
      )}
    </div>
  );
}
