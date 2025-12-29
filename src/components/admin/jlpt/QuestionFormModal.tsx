'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
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

interface Question {
  id?: string;
  questionText: string;
  questionType?: string;
  difficulty?: string;
  correctAnswer?: number;
  passageId?: string;
  passage?: {
    id: string;
    contentType?: string;
    contentText?: string;
    title?: string;
    mediaUrl?: string;
  };
  answerChoices?: Array<{
    choiceNumber: number;
    choiceText?: string;
  }>;
}

interface QuestionFormModalProps {
  level: string;
  section: string;
  mondai: number;
  mondaiConfig: MondaiConfig;
  question?: Question;
  onClose: () => void;
  onSuccess: () => void;
}

interface PassageFormData {
  passage_title: string;
  passage_content: string;
  passage_media_url: string;
}

interface QuestionFormData {
  question_text: string;
  choices: Array<{ choice_number: number; choice_text: string }>;
  correct_answer: number;
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

  // Helper to get mondai type info
  const getMondaiTypeInfo = () => {
    const passageType = mondaiConfig.passageType || 'text';
    const needsMultiplePassages = mondaiConfig.mondaiType === 'ab_comparison';
    const questionsPerPassage = mondaiConfig.questionsPerPassage || 1;

    // Listening section
    if (section === 'listening') {
      return {
        label: 'Listening Comprehension',
        needsPassage: mondaiConfig.requiresPassage,
        needsMultiplePassages: false,
        questionsPerPassage,
        passageLabel: 'Audio File',
        isAudio: true,
        isImage: false,
      };
    }

    // Reading sections
    switch (mondaiConfig.mondaiType) {
      case 'short_reading':
      case 'medium_reading':
      case 'long_reading':
        return {
          label: 'Reading Comprehension',
          needsPassage: true,
          needsMultiplePassages: false,
          questionsPerPassage,
          passageLabel: 'Reading Passage',
          isAudio: passageType === 'audio',
          isImage: passageType === 'image',
        };
      case 'cloze_test':
        return {
          label: 'Cloze Test',
          needsPassage: true,
          needsMultiplePassages: false,
          questionsPerPassage,
          passageLabel: 'Passage with Blanks',
          isAudio: passageType === 'audio',
          isImage: passageType === 'image',
        };
      case 'ab_comparison':
        return {
          label: 'A-B Comparison',
          needsPassage: true,
          needsMultiplePassages: true,
          questionsPerPassage,
          passageLabel: 'Comparison Passages',
          isAudio: passageType === 'audio',
          isImage: passageType === 'image',
        };
      default:
        return {
          label: 'Standard',
          needsPassage: false,
          needsMultiplePassages: false,
          questionsPerPassage: 1,
          passageLabel: '',
          isAudio: false,
          isImage: false,
        };
    }
  };

  const typeInfo = getMondaiTypeInfo();

  // Normalize answer choices from database format to form format
  const normalizeChoices = (choices?: Array<{ choiceNumber: number; choiceText?: string }>) => {
    if (!choices || choices.length === 0) {
      return [
        { choice_number: 1, choice_text: '' },
        { choice_number: 2, choice_text: '' },
        { choice_number: 3, choice_text: '' },
        { choice_number: 4, choice_text: '' },
      ];
    }
    return choices.map(c => ({
      choice_number: c.choiceNumber,
      choice_text: c.choiceText || '',
    }));
  };

  // Passage data
  const [passageA, setPassageA] = useState<PassageFormData>({
    passage_title: question?.passage?.title || '',
    passage_content: question?.passage?.contentText || '',
    passage_media_url: question?.passage?.mediaUrl || '',
  });

  const [passageB, setPassageB] = useState<PassageFormData>({
    passage_title: '',
    passage_content: '',
    passage_media_url: '',
  });

  // Multiple questions data for multi-question mondai
  const [questions, setQuestions] = useState<QuestionFormData[]>(
    typeInfo.questionsPerPassage > 1
      ? Array.from({ length: typeInfo.questionsPerPassage }, () => ({
          question_text: '',
          choices: normalizeChoices(),
          correct_answer: 1,
        }))
      : [
          {
            question_text: question?.questionText || '',
            choices: normalizeChoices(question?.answerChoices),
            correct_answer: question?.correctAnswer || 1,
          },
        ]
  );

  const [difficulty, setDifficulty] = useState(question?.difficulty || 'medium');
  const [questionType] = useState(question?.questionType || mondaiConfig.mondaiType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      interface PayloadType {
        mondai: {
          level: string;
          section_type: string;
          mondai_number: number;
          question_type: string;
          difficulty: string;
        };
        passages?: Array<{
          id?: string;
          content_text?: string;
          title?: string;
          content_type: string;
          media_url?: string;
        }>;
        questions: Array<{
          question_text: string;
          correct_answer: number;
          answer_choices: Array<{
            choice_number: number;
            choice_text: string;
          }>;
        }>;
      }

      const payload: PayloadType = {
        mondai: {
          level,
          section_type: section,
          mondai_number: mondai,
          question_type: questionType,
          difficulty,
        },
        questions: questions.map(q => ({
          question_text: q.question_text,
          correct_answer: q.correct_answer,
          answer_choices: q.choices.map((c, idx) => ({
            choice_number: idx + 1,
            choice_text: c.choice_text,
          })),
        })),
      };

      // Include passage data if needed
      if (typeInfo.needsPassage) {
        const contentType = mondaiConfig.passageType || 'text';
        payload.passages = [];

        // Add Passage A
        const hasContentA =
          contentType === 'text'
            ? passageA.passage_content.trim()
            : passageA.passage_media_url.trim();

        if (hasContentA) {
          const passageAData: {
            id?: string;
            content_text?: string;
            title?: string;
            content_type: string;
            media_url?: string;
          } = {
            content_type: contentType,
            title: passageA.passage_title || undefined,
          };

          if (contentType === 'text') {
            passageAData.content_text = passageA.passage_content;
          } else {
            passageAData.media_url = passageA.passage_media_url;
          }

          if (question?.passageId) {
            passageAData.id = question.passageId;
          }

          payload.passages.push(passageAData);
        }

        // Add Passage B for A-B comparison
        if (typeInfo.needsMultiplePassages) {
          const hasContentB =
            contentType === 'text'
              ? passageB.passage_content.trim()
              : passageB.passage_media_url.trim();

          if (hasContentB) {
            const passageBData: {
              id?: string;
              content_text?: string;
              title?: string;
              content_type: string;
              media_url?: string;
            } = {
              content_type: contentType,
              title: passageB.passage_title || undefined,
            };

            if (contentType === 'text') {
              passageBData.content_text = passageB.passage_content;
            } else {
              passageBData.media_url = passageB.passage_media_url;
            }

            payload.passages.push(passageBData);
          }
        }
      }

      const url = question ? `/api/jlpt/questions/${question.id}` : `/api/jlpt/questions`;
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

  const updateChoice = (questionIndex: number, choiceIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices[choiceIndex] = {
      ...newQuestions[questionIndex].choices[choiceIndex],
      choice_text: text,
    };
    setQuestions(newQuestions);
  };

  const updateQuestionText = (questionIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].question_text = text;
    setQuestions(newQuestions);
  };

  const updateCorrectAnswer = (questionIndex: number, answer: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correct_answer = answer;
    setQuestions(newQuestions);
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? 'Edit Question' : 'Add Questions'} - {level} / Mondai {mondai}
          </DialogTitle>
          <DialogDescription>
            {mondaiConfig.name} - {mondaiConfig.description}
            <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
              {typeInfo.label}
            </span>
            {typeInfo.questionsPerPassage > 1 && (
              <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                {typeInfo.questionsPerPassage} questions per passage
              </span>
            )}
            {typeInfo.needsMultiplePassages && (
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                A-B Comparison
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Passage Section */}
          {typeInfo.needsPassage && (
            <div className="space-y-6">
              {/* Passage A */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  {typeInfo.isAudio ? (
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    </svg>
                  ) : typeInfo.isImage ? (
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                  <h3 className="font-semibold text-blue-900">
                    {typeInfo.needsMultiplePassages ? 'Passage A' : typeInfo.passageLabel}
                  </h3>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passage_a_title">
                    {typeInfo.isAudio ? 'Audio' : typeInfo.isImage ? 'Image' : 'Passage'} Title
                    (Optional)
                  </Label>
                  <Input
                    id="passage_a_title"
                    value={passageA.passage_title}
                    onChange={e => setPassageA({ ...passageA, passage_title: e.target.value })}
                    placeholder={
                      typeInfo.isAudio
                        ? 'e.g., Dialog 1, Announcement, etc.'
                        : typeInfo.isImage
                          ? 'e.g., Chart 1, Diagram, etc.'
                          : 'e.g., お知らせ、メール、etc.'
                    }
                  />
                </div>

                {typeInfo.isAudio || typeInfo.isImage ? (
                  <div className="space-y-2">
                    <Label htmlFor="passage_a_media_url">
                      {typeInfo.isAudio ? 'Audio' : 'Image'} URL *
                    </Label>
                    <Input
                      id="passage_a_media_url"
                      type="url"
                      value={passageA.passage_media_url}
                      onChange={e =>
                        setPassageA({ ...passageA, passage_media_url: e.target.value })
                      }
                      placeholder={
                        typeInfo.isAudio
                          ? 'https://example.com/audio/listening-n5-mondai1.mp3'
                          : 'https://example.com/images/chart-n5-mondai1.jpg'
                      }
                      required={typeInfo.needsPassage}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="passage_a_content">
                      Passage Content *
                      {mondaiConfig.mondaiType === 'cloze_test' && (
                        <span className="ml-2 text-sm text-gray-600">(Use _____ for blanks)</span>
                      )}
                    </Label>
                    <Textarea
                      id="passage_a_content"
                      value={passageA.passage_content}
                      onChange={e => setPassageA({ ...passageA, passage_content: e.target.value })}
                      placeholder={
                        mondaiConfig.mondaiType === 'cloze_test'
                          ? 'Enter passage with _____ marking blank positions...'
                          : 'Enter the reading passage...'
                      }
                      rows={8}
                      required={typeInfo.needsPassage}
                      className="font-mono text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Passage B for A-B Comparison */}
              {typeInfo.needsMultiplePassages && (
                <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    {typeInfo.isAudio ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                        />
                      </svg>
                    ) : typeInfo.isImage ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                    <h3 className="font-semibold text-green-900">Passage B</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passage_b_title">
                      {typeInfo.isAudio ? 'Audio' : typeInfo.isImage ? 'Image' : 'Passage'} Title
                      (Optional)
                    </Label>
                    <Input
                      id="passage_b_title"
                      value={passageB.passage_title}
                      onChange={e => setPassageB({ ...passageB, passage_title: e.target.value })}
                      placeholder={
                        typeInfo.isAudio
                          ? 'e.g., Dialog 2, Response, etc.'
                          : typeInfo.isImage
                            ? 'e.g., Chart 2, Comparison diagram, etc.'
                            : 'e.g., 返信メール、etc.'
                      }
                    />
                  </div>

                  {typeInfo.isAudio || typeInfo.isImage ? (
                    <div className="space-y-2">
                      <Label htmlFor="passage_b_media_url">
                        {typeInfo.isAudio ? 'Audio' : 'Image'} URL *
                      </Label>
                      <Input
                        id="passage_b_media_url"
                        type="url"
                        value={passageB.passage_media_url}
                        onChange={e =>
                          setPassageB({ ...passageB, passage_media_url: e.target.value })
                        }
                        placeholder={
                          typeInfo.isAudio
                            ? 'https://example.com/audio/listening-passage-b.mp3'
                            : 'https://example.com/images/chart-b.jpg'
                        }
                        required={typeInfo.needsMultiplePassages}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="passage_b_content">Passage B Content *</Label>
                      <Textarea
                        id="passage_b_content"
                        value={passageB.passage_content}
                        onChange={e =>
                          setPassageB({ ...passageB, passage_content: e.target.value })
                        }
                        placeholder="Enter the second passage for comparison..."
                        rows={8}
                        required={typeInfo.needsMultiplePassages}
                        className="font-mono text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Difficulty (Global for all questions) */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty (applies to all questions)</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
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

          {/* Questions Section */}
          <div className="space-y-6">
            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900">
                  Question {qIndex + 1}
                  {typeInfo.questionsPerPassage > 1 && ` of ${typeInfo.questionsPerPassage}`}
                </h3>

                {/* Question Text */}
                <div className="space-y-2">
                  <Label htmlFor={`question_text_${qIndex}`}>
                    Question Text *
                    {typeInfo.needsPassage && (
                      <span className="ml-2 text-sm text-gray-600">
                        (Related to the passage above)
                      </span>
                    )}
                  </Label>
                  <Textarea
                    id={`question_text_${qIndex}`}
                    value={q.question_text}
                    onChange={e => updateQuestionText(qIndex, e.target.value)}
                    placeholder={
                      typeInfo.needsPassage
                        ? 'e.g., このお知らせによると、どうしなければなりませんか。'
                        : 'Enter question text...'
                    }
                    rows={3}
                    required
                  />
                </div>

                {/* Answer Choices */}
                <div className="space-y-3">
                  <Label>Answer Choices *</Label>
                  {q.choices.map((choice, cIndex) => (
                    <div key={cIndex} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-8">{cIndex + 1}.</span>
                      <Input
                        value={choice.choice_text}
                        onChange={e => updateChoice(qIndex, cIndex, e.target.value)}
                        placeholder={`Choice ${cIndex + 1}`}
                        required
                      />
                    </div>
                  ))}
                </div>

                {/* Correct Answer */}
                <div className="space-y-2">
                  <Label htmlFor={`correct_answer_${qIndex}`}>Correct Answer *</Label>
                  <Select
                    value={q.correct_answer.toString()}
                    onValueChange={value => updateCorrectAnswer(qIndex, parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {q.choices.map((_, cIndex) => (
                        <SelectItem key={cIndex + 1} value={(cIndex + 1).toString()}>
                          Choice {cIndex + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : question ? 'Update Questions' : 'Add Questions'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
