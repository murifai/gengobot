'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TaskFormData {
  title: string;
  description: string;
  category: string;
  difficulty: string;
  scenario: string;
  learningObjectives: string[];
  successCriteria: string[];
  estimatedDuration: number;
  prerequisites: string[];
  characterId?: string;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData>;
  taskId?: string;
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export default function TaskForm({ initialData, taskId, onSubmit, onCancel }: TaskFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'Restaurant',
    difficulty: initialData?.difficulty || 'N5',
    scenario: initialData?.scenario || '',
    learningObjectives: initialData?.learningObjectives || [''],
    successCriteria: initialData?.successCriteria || [''],
    estimatedDuration: initialData?.estimatedDuration || 15,
    prerequisites: initialData?.prerequisites || [],
    characterId: initialData?.characterId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Restaurant',
    'Shopping',
    'Travel',
    'Business',
    'Healthcare',
    'Education',
    'Daily Life',
    'Emergency',
    'Social Events',
    'Technology',
  ];

  const difficulties = ['N5', 'N4', 'N3', 'N2', 'N1'];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.scenario.trim()) newErrors.scenario = 'Scenario is required';
    if (formData.learningObjectives.filter(obj => obj.trim()).length === 0) {
      newErrors.learningObjectives = 'At least one learning objective is required';
    }
    if (formData.successCriteria.filter(crit => crit.trim()).length === 0) {
      newErrors.successCriteria = 'At least one success criterion is required';
    }
    if (formData.estimatedDuration < 5 || formData.estimatedDuration > 60) {
      newErrors.estimatedDuration = 'Duration must be between 5 and 60 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Filter out empty objectives and criteria
      const cleanedData = {
        ...formData,
        learningObjectives: formData.learningObjectives.filter(obj => obj.trim()),
        successCriteria: formData.successCriteria.filter(crit => crit.trim()),
        prerequisites: formData.prerequisites.filter(pre => pre.trim()),
      };

      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Failed to save task:', error);
      setErrors({ submit: 'Failed to save task. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const addArrayItem = (field: 'learningObjectives' | 'successCriteria' | 'prerequisites') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'learningObjectives' | 'successCriteria' | 'prerequisites', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const updateArrayItem = (
    field: 'learningObjectives' | 'successCriteria' | 'prerequisites',
    index: number,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? value : item)),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-white font-medium mb-2">
          Task Title <span className="text-primary">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
          placeholder="e.g., Order Ramen at a Restaurant"
        />
        {errors.title && <p className="text-primary text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-white font-medium mb-2">
          Description <span className="text-primary">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary min-h-[80px]"
          placeholder="Brief description of the task..."
        />
        {errors.description && <p className="text-primary text-sm mt-1">{errors.description}</p>}
      </div>

      {/* Category and Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-white font-medium mb-2">Category</label>
          <select
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">JLPT Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
          >
            {difficulties.map(diff => (
              <option key={diff} value={diff}>
                {diff}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario */}
      <div>
        <label className="block text-white font-medium mb-2">
          Scenario <span className="text-primary">*</span>
        </label>
        <textarea
          value={formData.scenario}
          onChange={e => setFormData({ ...formData, scenario: e.target.value })}
          className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary min-h-[120px]"
          placeholder="Detailed scenario description for the learner..."
        />
        {errors.scenario && <p className="text-primary text-sm mt-1">{errors.scenario}</p>}
      </div>

      {/* Learning Objectives */}
      <div>
        <label className="block text-white font-medium mb-2">
          Learning Objectives <span className="text-primary">*</span>
        </label>
        <div className="space-y-2">
          {formData.learningObjectives.map((obj, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={obj}
                onChange={e => updateArrayItem('learningObjectives', index, e.target.value)}
                className="flex-1 bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="e.g., Learn food vocabulary"
              />
              {formData.learningObjectives.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('learningObjectives', index)}
                  className="px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem('learningObjectives')}
          className="mt-2 text-secondary hover:text-secondary/80 text-sm"
        >
          + Add Learning Objective
        </button>
        {errors.learningObjectives && <p className="text-primary text-sm mt-1">{errors.learningObjectives}</p>}
      </div>

      {/* Success Criteria */}
      <div>
        <label className="block text-white font-medium mb-2">
          Success Criteria <span className="text-primary">*</span>
        </label>
        <div className="space-y-2">
          {formData.successCriteria.map((crit, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={crit}
                onChange={e => updateArrayItem('successCriteria', index, e.target.value)}
                className="flex-1 bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="e.g., Successfully order a meal"
              />
              {formData.successCriteria.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem('successCriteria', index)}
                  className="px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem('successCriteria')}
          className="mt-2 text-secondary hover:text-secondary/80 text-sm"
        >
          + Add Success Criterion
        </button>
        {errors.successCriteria && <p className="text-primary text-sm mt-1">{errors.successCriteria}</p>}
      </div>

      {/* Estimated Duration */}
      <div>
        <label className="block text-white font-medium mb-2">
          Estimated Duration (minutes) <span className="text-primary">*</span>
        </label>
        <input
          type="number"
          value={formData.estimatedDuration}
          onChange={e => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 15 })}
          className="w-full bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
          min="5"
          max="60"
        />
        {errors.estimatedDuration && <p className="text-primary text-sm mt-1">{errors.estimatedDuration}</p>}
      </div>

      {/* Prerequisites (Optional) */}
      <div>
        <label className="block text-white font-medium mb-2">Prerequisites (Optional)</label>
        <div className="space-y-2">
          {formData.prerequisites.map((pre, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={pre}
                onChange={e => updateArrayItem('prerequisites', index, e.target.value)}
                className="flex-1 bg-dark text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="e.g., Complete basic greetings task"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('prerequisites', index)}
                className="px-3 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem('prerequisites')}
          className="mt-2 text-secondary hover:text-secondary/80 text-sm"
        >
          + Add Prerequisite
        </button>
      </div>

      {/* Submit Error */}
      {errors.submit && (
        <div className="bg-primary/20 border border-primary rounded p-3 text-white text-sm">{errors.submit}</div>
      )}

      {/* Form Actions */}
      <div className="flex gap-4 pt-4 border-t border-gray-700">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 px-6 rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {loading ? 'Saving...' : taskId ? 'Update Task' : 'Create Task'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 bg-tertiary-purple text-white rounded hover:bg-tertiary-purple/90 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
