'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MondaiConfig } from '@/config/jlpt-mondai-config';

interface QuestionFormModalProps {
  level: string;
  section: string;
  mondai: number;
  mondaiConfig: MondaiConfig;
  question?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuestionFormModal({
  level,
  section,
  mondai,
  mondaiConfig,
  question,
  onClose,
  onSuccess,
}: QuestionFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_number: question?.questionNumber || mondaiConfig.questionNumbers[0],
    question_text: question?.questionText || '',
    question_type: question?.questionType || 'standard',
    difficulty: question?.difficulty || 'medium',
    correct_answer: question?.correctAnswer || 1,
    choices: question?.answerChoices || [
      { choice_number: 1, choice_text: '' },
      { choice_number: 2, choice_text: '' },
      { choice_number: 3, choice_text: '' },
      { choice_number: 4, choice_text: '' },
    ],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        question: {
          level,
          section_type: section,
          mondai_number: mondai,
          question_number: formData.question_number,
          question_text: formData.question_text,
          question_type: formData.question_type,
          difficulty: formData.difficulty,
          correct_answer: formData.correct_answer,
          answer_choices: formData.choices.map((c, idx) => ({
            choice_number: idx + 1,
            choice_text: c.choice_text,
          })),
        },
      };

      const url = question
        ? `/api/jlpt/questions/${question.id}`
        : `/api/jlpt/questions`;
      const method = question ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    } finally {
      setLoading(false);
    }
  };

  const updateChoice = (index: number, text: string) => {
    const newChoices = [...formData.choices];
    newChoices[index] = { ...newChoices[index], choice_text: text };
    setFormData({ ...formData, choices: newChoices });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit Question' : 'Add Question'} - {level} / Mondai {mondai}
          </DialogTitle>
          <DialogDescription>
            {mondaiConfig.name} - {mondaiConfig.description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Number */}
          <div className="space-y-2">
            <Label htmlFor="question_number">Question Number</Label>
            <Select
              value={formData.question_number.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, question_number: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {mondaiConfig.questionNumbers.map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    Question {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <Label htmlFor="question_text">Question Text *</Label>
            <Textarea
              id="question_text"
              value={formData.question_text}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              placeholder="Enter question text..."
              rows={3}
              required
            />
          </div>

          {/* Question Type & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question_type">Question Type</Label>
              <Select
                value={formData.question_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, question_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="cloze">Cloze</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="graphic">Graphic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) =>
                  setFormData({ ...formData, difficulty: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Answer Choices */}
          <div className="space-y-3">
            <Label>Answer Choices *</Label>
            {formData.choices.map((choice, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium w-8">{index + 1}.</span>
                <Input
                  value={choice.choice_text}
                  onChange={(e) => updateChoice(index, e.target.value)}
                  placeholder={`Choice ${index + 1}`}
                  required
                />
              </div>
            ))}
          </div>

          {/* Correct Answer */}
          <div className="space-y-2">
            <Label htmlFor="correct_answer">Correct Answer *</Label>
            <Select
              value={formData.correct_answer.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, correct_answer: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {formData.choices.map((_, index) => (
                  <SelectItem key={index + 1} value={(index + 1).toString()}>
                    Choice {index + 1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : question ? 'Update Question' : 'Add Question'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
