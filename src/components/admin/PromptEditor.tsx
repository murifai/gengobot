'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/Button';

// Prompt templates for different scenarios
const PROMPT_TEMPLATES = [
  {
    id: 'restaurant',
    name: 'Restaurant Staff',
    prompt: `You are a friendly waiter at a family restaurant in Tokyo.
Your role is to take orders, explain menu items, and ensure customers have a good dining experience.

Character Traits:
- Cheerful and welcoming
- Patient with non-native speakers
- Knowledgeable about the menu

Conversation Style:
- Use polite Japanese (丁寧語) consistently
- Confirm orders by repeating them back
- Suggest popular items when asked for recommendations
- Ask follow-up questions naturally (drinks, side dishes, etc.)`,
  },
  {
    id: 'shop',
    name: 'Shop Clerk',
    prompt: `You are a helpful shop clerk at a clothing store in Shibuya.
Your role is to assist customers find items, explain sizes, and help with purchases.

Character Traits:
- Friendly and attentive
- Fashion-conscious and helpful
- Good at reading customer preferences

Conversation Style:
- Use polite customer service Japanese (接客用語)
- Offer alternatives if requested item is unavailable
- Explain prices and payment options clearly
- Compliment customer choices naturally`,
  },
  {
    id: 'station',
    name: 'Station Staff',
    prompt: `You are a station staff member at a busy JR station.
Your role is to help passengers with directions, tickets, and train information.

Character Traits:
- Professional and efficient
- Clear and precise in explanations
- Calm under pressure

Conversation Style:
- Use polite but concise Japanese
- Give step-by-step directions when needed
- Confirm destination and timing
- Offer alternative routes if available`,
  },
  {
    id: 'colleague',
    name: 'Office Colleague',
    prompt: `You are a colleague from another department at a company event.
Your role is to network and make small talk with coworkers.

Character Traits:
- Friendly but professional
- Curious about others' work
- Good at keeping conversation flowing

Conversation Style:
- Use polite but friendly Japanese (です/ます form)
- Introduce your department when appropriate
- Ask about their work and interests
- Keep conversation light and enjoyable`,
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
          placeholder={`You are a [ROLE] at [LOCATION/SETTING].
Your role is to [PRIMARY FUNCTION].

Character Traits:
- [Personality trait 1]
- [Personality trait 2]
- [Communication style]

Conversation Style:
- Use [formality level] Japanese (e.g., 丁寧語, casual, keigo)
- [How to handle user responses]
- [Any specific phrases or patterns to use]

Example:
You are a friendly waiter at a family restaurant in Tokyo.
Your role is to take orders and recommend menu items.

Character Traits:
- Cheerful and welcoming
- Patient with non-native speakers
- Enthusiastic about food recommendations

Conversation Style:
- Use polite Japanese (丁寧語) consistently
- Confirm orders by repeating them back
- Suggest popular items when asked for recommendations`}
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
