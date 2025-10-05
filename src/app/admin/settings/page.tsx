'use client';

import { useState } from 'react';
import { Save, Key, ToggleLeft, ToggleRight, Mail, Shield, Globe } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SystemSettings {
  apiKeys: {
    openai: string;
    supabase: string;
  };
  features: {
    taskBasedChat: boolean;
    freeChat: boolean;
    voiceInteraction: boolean;
    userRegistration: boolean;
    adminApproval: boolean;
  };
  email: {
    provider: string;
    fromAddress: string;
    enabled: boolean;
  };
  security: {
    sessionTimeout: number;
    maxLoginAttempts: number;
    requireEmailVerification: boolean;
    twoFactorEnabled: boolean;
  };
  application: {
    appName: string;
    defaultLanguage: string;
    defaultProficiency: string;
    maxTaskAttempts: number;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    apiKeys: {
      openai: 'sk-proj-...',
      supabase: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    features: {
      taskBasedChat: true,
      freeChat: true,
      voiceInteraction: true,
      userRegistration: true,
      adminApproval: false,
    },
    email: {
      provider: 'smtp',
      fromAddress: 'noreply@gengobot.com',
      enabled: true,
    },
    security: {
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      requireEmailVerification: true,
      twoFactorEnabled: false,
    },
    application: {
      appName: 'Gengotalk',
      defaultLanguage: 'en',
      defaultProficiency: 'N5',
      maxTaskAttempts: 3,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    // Save settings logic
    console.log('Saving settings:', settings);
    setHasChanges(false);
  };

  const toggleFeature = (feature: keyof SystemSettings['features']) => {
    setSettings({
      ...settings,
      features: {
        ...settings.features,
        [feature]: !settings.features[feature],
      },
    });
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              System Configuration
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage system settings, API keys, and feature flags
            </p>
          </div>
          {hasChanges && (
            <Button variant="primary" onClick={handleSave} className="gap-2">
              <Save size={20} />
              Save Changes
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* API Keys */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Key className="text-primary" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">API Keys</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OpenAI API Key
                </label>
                <Input
                  type="password"
                  value={settings.apiKeys.openai}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, openai: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                  placeholder="sk-proj-..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Used for GPT and Whisper API
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supabase Anon Key
                </label>
                <Input
                  type="password"
                  value={settings.apiKeys.supabase}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      apiKeys: { ...settings.apiKeys, supabase: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Used for authentication and database
                </p>
              </div>
            </div>
          </div>

          {/* Feature Flags */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <ToggleLeft className="text-secondary" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Feature Flags</h2>
            </div>
            <div className="space-y-4">
              {Object.entries(settings.features).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {key === 'taskBasedChat' && 'Enable task-based learning mode'}
                      {key === 'freeChat' && 'Enable free conversation mode'}
                      {key === 'voiceInteraction' && 'Enable voice input/output'}
                      {key === 'userRegistration' && 'Allow new user signups'}
                      {key === 'adminApproval' && 'Require admin approval for new users'}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleFeature(key as keyof SystemSettings['features'])}
                    className="relative"
                  >
                    {value ? (
                      <ToggleRight size={32} className="text-tertiary-green" />
                    ) : (
                      <ToggleLeft size={32} className="text-gray-400" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Email Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-tertiary-yellow/10 rounded-lg">
                <Mail className="text-tertiary-purple" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Email Configuration
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Provider
                </label>
                <select
                  value={settings.email.provider}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      email: { ...settings.email, provider: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="smtp">SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  From Address
                </label>
                <Input
                  type="email"
                  value={settings.email.fromAddress}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      email: { ...settings.email, fromAddress: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                  placeholder="noreply@gengobot.com"
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  Email Enabled
                </div>
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      email: { ...settings.email, enabled: !settings.email.enabled },
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.email.enabled ? (
                    <ToggleRight size={32} className="text-tertiary-green" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-tertiary-green/10 rounded-lg">
                <Shield className="text-tertiary-green" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Security Settings
              </h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Session Timeout (minutes)
                </label>
                <Input
                  type="number"
                  value={settings.security.sessionTimeout}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      security: { ...settings.security, sessionTimeout: parseInt(e.target.value) },
                    });
                    setHasChanges(true);
                  }}
                  min={5}
                  max={1440}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Login Attempts
                </label>
                <Input
                  type="number"
                  value={settings.security.maxLoginAttempts}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        maxLoginAttempts: parseInt(e.target.value),
                      },
                    });
                    setHasChanges(true);
                  }}
                  min={3}
                  max={10}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Email Verification Required
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Require users to verify email
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        requireEmailVerification: !settings.security.requireEmailVerification,
                      },
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.security.requireEmailVerification ? (
                    <ToggleRight size={32} className="text-tertiary-green" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-400" />
                  )}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    Two-Factor Authentication
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Enable 2FA for all users
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSettings({
                      ...settings,
                      security: {
                        ...settings.security,
                        twoFactorEnabled: !settings.security.twoFactorEnabled,
                      },
                    });
                    setHasChanges(true);
                  }}
                >
                  {settings.security.twoFactorEnabled ? (
                    <ToggleRight size={32} className="text-tertiary-green" />
                  ) : (
                    <ToggleLeft size={32} className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Globe className="text-primary" size={24} />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Application Settings
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Application Name
                </label>
                <Input
                  type="text"
                  value={settings.application.appName}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      application: { ...settings.application, appName: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                  placeholder="Gengotalk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Language
                </label>
                <select
                  value={settings.application.defaultLanguage}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      application: { ...settings.application, defaultLanguage: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="ja">Japanese</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Proficiency Level
                </label>
                <select
                  value={settings.application.defaultProficiency}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      application: { ...settings.application, defaultProficiency: e.target.value },
                    });
                    setHasChanges(true);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="N5">N5 (Beginner)</option>
                  <option value="N4">N4 (Elementary)</option>
                  <option value="N3">N3 (Intermediate)</option>
                  <option value="N2">N2 (Advanced)</option>
                  <option value="N1">N1 (Expert)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Task Retry Attempts
                </label>
                <Input
                  type="number"
                  value={settings.application.maxTaskAttempts}
                  onChange={e => {
                    setSettings({
                      ...settings,
                      application: {
                        ...settings.application,
                        maxTaskAttempts: parseInt(e.target.value),
                      },
                    });
                    setHasChanges(true);
                  }}
                  min={1}
                  max={10}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
