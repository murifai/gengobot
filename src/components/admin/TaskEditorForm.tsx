'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import DeckSelector from '@/components/admin/DeckSelector';

interface TaskFormData {
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
  characterId: string | null;
  isActive: boolean;
}

interface Character {
  id: string;
  name: string;
}

interface TaskSubcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface TaskCategory {
  id: string;
  name: string;
}

interface TaskEditorFormProps {
  taskId?: string;
  initialData?: Partial<TaskFormData>;
}

export default function TaskEditorForm({ taskId, initialData }: TaskEditorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [categories, setCategories] = useState<TaskCategory[]>([]);
  const [subcategories, setSubcategories] = useState<TaskSubcategory[]>([]);
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    subcategoryId: initialData?.subcategoryId || null,
    difficulty: initialData?.difficulty || 'N5',
    scenario: initialData?.scenario || '',
    learningObjectives: initialData?.learningObjectives || [''],
    conversationExample: initialData?.conversationExample || '',
    estimatedDuration: initialData?.estimatedDuration || 10,
    studyDeckIds: initialData?.studyDeckIds || [],
    characterId: initialData?.characterId || null,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCharacters();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await fetch('/api/subcategories');
      if (response.ok) {
        const data = await response.json();
        setSubcategories(data.subcategories);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.scenario.trim()) {
      newErrors.scenario = 'Scenario is required';
    }

    const validObjectives = formData.learningObjectives.filter(obj => obj.trim());
    if (validObjectives.length === 0) {
      newErrors.learningObjectives = 'At least one learning objective is required';
    }

    if (!formData.conversationExample.trim()) {
      newErrors.conversationExample = 'Conversation example is required';
    }

    if (formData.estimatedDuration < 1) {
      newErrors.estimatedDuration = 'Duration must be at least 1 minute';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      // Clean up arrays
      const cleanedData = {
        ...formData,
        learningObjectives: formData.learningObjectives.filter(obj => obj.trim()),
        conversationExample: formData.conversationExample.trim(),
        // Note: updatedBy is omitted - admin logging will be handled server-side
      };

      const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks';
      const method = taskId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData),
      });

      if (response.ok) {
        router.push('/admin/tasks');
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || 'Failed to save task'}`);
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: 'learningObjectives') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'learningObjectives', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (field: 'learningObjectives', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Task Title *
        </label>
        <Input
          type="text"
          value={formData.title}
          onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="e.g., Ordering at a Restaurant"
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Brief description of the task"
          rows={3}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Category & Subcategory */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.category ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subcategory
          </label>
          <select
            value={formData.subcategoryId || ''}
            onChange={e =>
              setFormData(prev => ({ ...prev, subcategoryId: e.target.value || null }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            disabled={!formData.category}
          >
            <option value="">{formData.category ? 'None' : 'Select a category first'}</option>
            {subcategories
              .filter(sub => {
                // Find the category by name to get its ID
                const selectedCategory = categories.find(cat => cat.name === formData.category);
                return selectedCategory ? sub.categoryId === selectedCategory.id : false;
              })
              .map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Difficulty */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Difficulty Level *
        </label>
        <select
          value={formData.difficulty}
          onChange={e => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="N5">N5 (Beginner)</option>
          <option value="N4">N4 (Elementary)</option>
          <option value="N3">N3 (Intermediate)</option>
          <option value="N2">N2 (Upper-Intermediate)</option>
          <option value="N1">N1 (Advanced)</option>
        </select>
      </div>

      {/* Scenario */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Scenario *
        </label>
        <textarea
          value={formData.scenario}
          onChange={e => setFormData(prev => ({ ...prev, scenario: e.target.value }))}
          placeholder="Detailed scenario description for the conversation"
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.scenario ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.scenario && <p className="text-red-500 text-sm mt-1">{errors.scenario}</p>}
      </div>

      {/* Learning Objectives */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Learning Objectives *
        </label>
        {formData.learningObjectives.map((objective, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <Input
              type="text"
              value={objective}
              onChange={e => updateArrayItem('learningObjectives', index, e.target.value)}
              placeholder={`Objective ${index + 1}`}
              className="flex-1"
            />
            {formData.learningObjectives.length > 1 && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => removeArrayItem('learningObjectives', index)}
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => addArrayItem('learningObjectives')}
          className="mt-2"
        >
          + Add Objective
        </Button>
        {errors.learningObjectives && (
          <p className="text-red-500 text-sm mt-1">{errors.learningObjectives}</p>
        )}
      </div>

      {/* Conversation Example */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Conversation Example * (Dialog format: T: teacher, G: student)
        </label>
        <textarea
          value={formData.conversationExample}
          onChange={e => setFormData(prev => ({ ...prev, conversationExample: e.target.value }))}
          placeholder="T: 〇〇さん、今の作業の進み具合はどうですか？&#10;G: はい、今は半分くらい終わっています。&#10;T: 次はどんな作業をする予定ですか？&#10;G: 部品の検品をする予定です。"
          rows={8}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
        />
        {errors.conversationExample && (
          <p className="text-red-500 text-sm mt-1">{errors.conversationExample}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">
          Enter conversation dialog with line breaks. Use T: for teacher and G: for student/learner.
        </p>
      </div>

      {/* Estimated Duration & Character */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estimated Duration (minutes) *
          </label>
          <Input
            type="number"
            value={formData.estimatedDuration}
            onChange={e =>
              setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))
            }
            min="1"
            className={errors.estimatedDuration ? 'border-red-500' : ''}
          />
          {errors.estimatedDuration && (
            <p className="text-red-500 text-sm mt-1">{errors.estimatedDuration}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Character
          </label>
          <select
            value={formData.characterId || ''}
            onChange={e => setFormData(prev => ({ ...prev, characterId: e.target.value || null }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">None</option>
            {characters.map(char => (
              <option key={char.id} value={char.id}>
                {char.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Study Decks */}
      <DeckSelector
        selectedDeckIds={formData.studyDeckIds}
        onChange={deckIds => setFormData(prev => ({ ...prev, studyDeckIds: deckIds }))}
      />

      {/* Is Active */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
        />
        <label
          htmlFor="isActive"
          className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Active (visible to users)
        </label>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" variant="default" disabled={loading}>
          {loading ? 'Saving...' : taskId ? 'Update Task' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
}
