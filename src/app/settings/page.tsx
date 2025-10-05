'use client';

import React, { useState } from 'react';

interface UserSettings {
  name: string;
  email: string;
  proficiency: string;
  preferredCategories: string[];
  voiceEnabled: boolean;
  language: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    name: 'User Name',
    email: 'user@example.com',
    proficiency: 'N4',
    preferredCategories: ['Restaurant', 'Shopping'],
    voiceEnabled: true,
    language: 'en',
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Settings saved:', settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (category: string) => {
    setSettings(prev => ({
      ...prev,
      preferredCategories: prev.preferredCategories.includes(category)
        ? prev.preferredCategories.filter(c => c !== category)
        : [...prev.preferredCategories, category],
    }));
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <div className="bg-tertiary-purple rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Name</label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={e => setSettings({ ...settings, name: e.target.value })}
                  className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={e => setSettings({ ...settings, email: e.target.value })}
                  className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Learning Preferences */}
          <div className="bg-tertiary-purple rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Learning Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Current Proficiency Level
                </label>
                <select
                  value={settings.proficiency}
                  onChange={e => setSettings({ ...settings, proficiency: e.target.value })}
                  className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="N5">N5 - Beginner</option>
                  <option value="N4">N4 - Elementary</option>
                  <option value="N3">N3 - Intermediate</option>
                  <option value="N2">N2 - Upper Intermediate</option>
                  <option value="N1">N1 - Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">
                  Preferred Task Categories
                </label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {['Restaurant', 'Shopping', 'Travel', 'Business', 'Healthcare'].map(category => (
                    <button
                      key={category}
                      onClick={() => toggleCategory(category)}
                      className={`p-3 rounded-lg transition-all ${
                        settings.preferredCategories.includes(category)
                          ? 'bg-primary text-white'
                          : 'bg-dark text-gray-400 hover:bg-dark/80'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm mb-2">Interface Language</label>
                <select
                  value={settings.language}
                  onChange={e => setSettings({ ...settings, language: e.target.value })}
                  className="w-full bg-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="en">English</option>
                  <option value="ja">日本語 (Japanese)</option>
                  <option value="es">Español (Spanish)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Voice Settings */}
          <div className="bg-tertiary-purple rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Voice Settings</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Voice Interaction</p>
                <p className="text-gray-400 text-sm">Enable voice input and output</p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
                className={`relative w-14 h-8 rounded-full transition-all ${
                  settings.voiceEnabled ? 'bg-primary' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    settings.voiceEnabled ? 'transform translate-x-6' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
