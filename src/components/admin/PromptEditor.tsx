'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/Button';

// Prompt templates for different scenarios
const PROMPT_TEMPLATES = [
  {
    id: 'restaurant',
    name: 'Restaurant Staff',
    prompt: `You are a friendly Japanese restaurant staff member.
Your role is to help customers order food and answer questions about the menu.

Guidelines:
- Use polite Japanese (丁寧語/keigo)
- Be patient and helpful with learners
- Naturally correct any mistakes
- Suggest popular dishes when asked
- Ask clarifying questions if needed`,
  },
  {
    id: 'shop',
    name: 'Shop Clerk',
    prompt: `You are a helpful shop clerk in Japan.
Your role is to assist customers with purchases and provide information about products.

Guidelines:
- Use polite customer service Japanese
- Explain product features clearly
- Help with sizes, colors, and prices
- Process simple transactions
- Be friendly and welcoming`,
  },
  {
    id: 'station',
    name: 'Station Staff',
    prompt: `You are a station staff member helping travelers.
Your role is to provide directions and transportation information.

Guidelines:
- Give clear directions
- Explain ticket options and prices
- Help with train schedules
- Use simple, clear Japanese
- Be patient with confused travelers`,
  },
  {
    id: 'custom',
    name: 'Custom',
    prompt: '',
  },
];

interface PromptEditorProps {
  prompt: string;
  onChange: (prompt: string) => void;
}

export default function PromptEditor({ prompt, onChange }: PromptEditorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('custom');
  const [showTemplates, setShowTemplates] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      if (template.prompt) {
        onChange(template.prompt);
      }
      setShowTemplates(false);
    }
  };

  const characterCount = prompt.length;
  const wordCount = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            AI System Prompt <span className="text-primary">*</span>
          </label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setShowTemplates(!showTemplates)}
          >
            {showTemplates ? 'Hide Templates' : 'Use Template'}
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Define the AI&apos;s personality, role, and behavior for this task
        </p>

        {/* Template selector */}
        {showTemplates && (
          <div className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select a Template
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PROMPT_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleTemplateSelect(template.id)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    selectedTemplate === template.id
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-gray-200 dark:border-gray-600 hover:border-secondary/50'
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Prompt textarea */}
        <Textarea
          value={prompt}
          onChange={e => {
            onChange(e.target.value);
            setSelectedTemplate('custom');
          }}
          placeholder={`Enter the AI system prompt...

Example:
You are a friendly Japanese restaurant staff member.
Your role is to help customers order food.

Guidelines:
- Use polite Japanese (丁寧語)
- Be patient and helpful
- Correct mistakes naturally`}
          className="min-h-[200px] font-mono text-sm"
          required
        />

        {/* Character/word count */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>
            {characterCount} characters • {wordCount} words
          </span>
          {characterCount > 2000 && (
            <span className="text-yellow-600 dark:text-yellow-400">
              Consider shortening for better performance
            </span>
          )}
        </div>
      </div>

      {/* Tips section */}
      <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
        <h4 className="text-sm font-medium text-secondary mb-2">Tips for Writing Prompts</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-disc list-inside">
          <li>Define a clear role and personality</li>
          <li>Specify the language level (casual/polite/formal)</li>
          <li>Include guidelines for handling mistakes</li>
          <li>Keep it concise but comprehensive</li>
          <li>Test with different conversation scenarios</li>
        </ul>
      </div>
    </div>
  );
}
