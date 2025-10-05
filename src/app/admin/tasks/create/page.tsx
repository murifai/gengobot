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
}

export default function CreateTaskPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'Restaurant',
    difficulty: 'N5',
    scenario: '',
    learningObjectives: [''],
    successCriteria: [''],
    estimatedDuration: 15,
    prerequisites: [],
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // TODO: API call to create task
      console.log('Creating task:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/admin/tasks');
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setSaving(false);
    }
  };

  const addObjective = () => {
    setFormData({
      ...formData,
      learningObjectives: [...formData.learningObjectives, ''],
    });
  };

  const removeObjective = (index: number) => {
    setFormData({
      ...formData,
      learningObjectives: formData.learningObjectives.filter((_, i) => i !== index),
    });
  };

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...formData.learningObjectives];
    newObjectives[index] = value;
    setFormData({ ...formData, learningObjectives: newObjectives });
  };

  const addCriteria = () => {
    setFormData({
      ...formData,
      successCriteria: [...formData.successCriteria, ''],
    });
  };

  const removeCriteria = (index: number) => {
    setFormData({
      ...formData,
      successCriteria: formData.successCriteria.filter((_, i) => i !== index),
    });
  };

  const updateCriteria = (index: number, value: string) => {
    const newCriteria = [...formData.successCriteria];
    newCriteria[index] = value;
    setFormData({ ...formData, successCriteria: newCriteria });
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/tasks')}
            className="text-gray-400 hover:text-white mb-4"
          >
            ← Back to Tasks
          </button>
          <h1 className="text-3xl font-bold text-white mb-2">Create New Task</h1>
          <p className="text-gray-400">Design a new learning task for students</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-tertiary-purple rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g., Order Ramen at a Restaurant"
                />
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Description *</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                  placeholder="Brief description of the task"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Category *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Shopping">Shopping</option>
                    <option value="Travel">Travel</option>
                    <option value="Business">Business</option>
                    <option value="Healthcare">Healthcare</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Difficulty *</label>
                  <select
                    required
                    value={formData.difficulty}
                    onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="N5">N5 - Beginner</option>
                    <option value="N4">N4 - Elementary</option>
                    <option value="N3">N3 - Intermediate</option>
                    <option value="N2">N2 - Upper Intermediate</option>
                    <option value="N1">N1 - Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Estimated Duration (minutes) *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  max="60"
                  value={formData.estimatedDuration}
                  onChange={e =>
                    setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) })
                  }
                  className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Scenario */}
          <div className="bg-tertiary-purple rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Task Scenario</h2>
            <textarea
              required
              value={formData.scenario}
              onChange={e => setFormData({ ...formData, scenario: e.target.value })}
              className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={5}
              placeholder="Describe the scenario in detail. What situation will the student be in?"
            />
          </div>

          {/* Learning Objectives */}
          <div className="bg-tertiary-purple rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Learning Objectives</h2>
            <div className="space-y-3">
              {formData.learningObjectives.map((objective, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={objective}
                    onChange={e => updateObjective(index, e.target.value)}
                    className="flex-1 bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Food vocabulary"
                  />
                  {formData.learningObjectives.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
                      className="text-primary hover:text-primary/80"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addObjective}
                className="text-secondary hover:text-secondary/80 text-sm"
              >
                + Add Objective
              </button>
            </div>
          </div>

          {/* Success Criteria */}
          <div className="bg-tertiary-purple rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Success Criteria</h2>
            <div className="space-y-3">
              {formData.successCriteria.map((criteria, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={criteria}
                    onChange={e => updateCriteria(index, e.target.value)}
                    className="flex-1 bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="e.g., Successfully order a meal"
                  />
                  {formData.successCriteria.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriteria(index)}
                      className="text-primary hover:text-primary/80"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addCriteria}
                className="text-secondary hover:text-secondary/80 text-sm"
              >
                + Add Criteria
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/tasks')}
              className="px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
