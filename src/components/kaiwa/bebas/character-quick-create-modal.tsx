'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogDescription, DialogTitle } from '@/components/ui/Dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CharacterQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated: (character: {
    id: string;
    name: string;
    description: string | null;
    voice: string | null;
    speakingStyle: string | null;
    relationshipType: string | null;
  }) => void;
  userId: string;
}

export function CharacterQuickCreateModal({
  isOpen,
  onClose,
  onCharacterCreated,
  userId,
}: CharacterQuickCreateModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [relationshipType, setRelationshipType] = useState('友達 / Friend');
  const [speakingStyle, setSpeakingStyle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          name: name.trim(),
          description: description.trim() || null,
          relationshipType,
          speakingStyle: speakingStyle.trim() || null,
          voice: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create character');
      }

      const character = await response.json();
      onCharacterCreated(character);
      handleClose();
    } catch (err) {
      console.error('Error creating character:', err);
      setError(err instanceof Error ? err.message : 'Failed to create character');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setRelationshipType('友達 / Friend');
    setSpeakingStyle('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} size="lg">
      <DialogTitle>キャラクターをクイック作成 / Quick Create Character</DialogTitle>
      <DialogDescription>
        基本情報を入力して、すぐに会話を始めましょう！
        <br />
        Fill in basic info and start chatting right away!
      </DialogDescription>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4 py-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">名前 / Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="例: たなか / Tanaka"
              required
              maxLength={50}
            />
          </div>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label htmlFor="relationshipType">関係性 / Relationship</Label>
            <Select value={relationshipType} onValueChange={setRelationshipType}>
              <SelectTrigger id="relationshipType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="友達 / Friend">友達 / Friend</SelectItem>
                <SelectItem value="先生 / Teacher">先生 / Teacher</SelectItem>
                <SelectItem value="同僚 / Colleague">同僚 / Colleague</SelectItem>
                <SelectItem value="先輩 / Senior">先輩 / Senior</SelectItem>
                <SelectItem value="後輩 / Junior">後輩 / Junior</SelectItem>
                <SelectItem value="家族 / Family">家族 / Family</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">説明 / Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="例: 日本語の先生で、優しくて面白い人です / A Japanese teacher who is kind and funny"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Speaking Style */}
          <div className="space-y-2">
            <Label htmlFor="speakingStyle">話し方 / Speaking Style (Optional)</Label>
            <Input
              id="speakingStyle"
              value={speakingStyle}
              onChange={e => setSpeakingStyle(e.target.value)}
              placeholder="例: フレンドリーでカジュアルな話し方 / Friendly and casual"
              maxLength={200}
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            キャンセル / Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? (
              <>
                <div className="inline-block h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                作成中... / Creating...
              </>
            ) : (
              <>作成して会話開始 / Create & Start</>
            )}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
