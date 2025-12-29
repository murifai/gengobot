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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MondaiConfig } from '@/config/jlpt-mondai-config';
import { AudioUpload } from '@/components/upload/AudioUpload';
import { ImageUpload } from '@/components/upload/ImageUpload';
import { RichTextEditor } from '@/components/ui/RichTextEditor';

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
    choiceMediaUrl?: string;
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
  choices: Array<{ choice_number: number; choice_text: string; choice_image_url?: string }>;
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
  const normalizeChoices = (
    choices?: Array<{ choiceNumber: number; choiceText?: string; choiceMediaUrl?: string }>
  ) => {
    if (!choices || choices.length === 0) {
      return [
        { choice_number: 1, choice_text: '', choice_image_url: '' },
        { choice_number: 2, choice_text: '', choice_image_url: '' },
        { choice_number: 3, choice_text: '', choice_image_url: '' },
        { choice_number: 4, choice_text: '', choice_image_url: '' },
      ];
    }
    return choices.map(c => ({
      choice_number: c.choiceNumber,
      choice_text: c.choiceText || '',
      choice_image_url: c.choiceMediaUrl || '',
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
            choice_media_url?: string;
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
            choice_media_url: c.choice_image_url || undefined,
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
            // For reading passages, also include media_url if provided
            if (passageA.passage_media_url.trim()) {
              passageAData.media_url = passageA.passage_media_url;
            }
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
              // For reading passages, also include media_url if provided
              if (passageB.passage_media_url.trim()) {
                passageBData.media_url = passageB.passage_media_url;
              }
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

  const updateChoiceImage = (questionIndex: number, choiceIndex: number, imageUrl: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].choices[choiceIndex] = {
      ...newQuestions[questionIndex].choices[choiceIndex],
      choice_image_url: imageUrl,
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
    <Dialog open={true} onClose={onClose} size="2xl">
      <DialogContent className="max-h-[90vh] overflow-y-auto">
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

                {typeInfo.isAudio ? (
                  <div className="space-y-2">
                    <Label>Audio File *</Label>
                    <AudioUpload
                      currentUrl={passageA.passage_media_url}
                      onUploadComplete={url => setPassageA({ ...passageA, passage_media_url: url })}
                    />
                  </div>
                ) : typeInfo.isImage ? (
                  <div className="space-y-2">
                    <Label>Image File *</Label>
                    <ImageUpload
                      currentUrl={passageA.passage_media_url}
                      onUploadComplete={url => setPassageA({ ...passageA, passage_media_url: url })}
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="passage_a_content">
                        Passage Content *
                        {mondaiConfig.mondaiType === 'cloze_test' && (
                          <span className="ml-2 text-sm text-gray-600">(Use _____ for blanks)</span>
                        )}
                      </Label>
                      <RichTextEditor
                        id="passage_a_content"
                        value={passageA.passage_content}
                        onChange={value => setPassageA({ ...passageA, passage_content: value })}
                        placeholder={
                          mondaiConfig.mondaiType === 'cloze_test'
                            ? 'Enter passage with _____ marking blank positions...'
                            : 'Enter the reading passage...'
                        }
                        rows={8}
                        required={typeInfo.needsPassage}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Passage Image (optional)</Label>
                      <p className="text-xs text-gray-600">
                        Upload an image if the passage includes charts, diagrams, or visual elements
                      </p>
                      <ImageUpload
                        currentUrl={passageA.passage_media_url}
                        onUploadComplete={url =>
                          setPassageA({ ...passageA, passage_media_url: url })
                        }
                      />
                    </div>
                  </>
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

                  {typeInfo.isAudio ? (
                    <div className="space-y-2">
                      <Label>Audio File *</Label>
                      <AudioUpload
                        currentUrl={passageB.passage_media_url}
                        onUploadComplete={url =>
                          setPassageB({ ...passageB, passage_media_url: url })
                        }
                      />
                    </div>
                  ) : typeInfo.isImage ? (
                    <div className="space-y-2">
                      <Label>Image File *</Label>
                      <ImageUpload
                        currentUrl={passageB.passage_media_url}
                        onUploadComplete={url =>
                          setPassageB({ ...passageB, passage_media_url: url })
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="passage_b_content">Passage B Content *</Label>
                        <RichTextEditor
                          id="passage_b_content"
                          value={passageB.passage_content}
                          onChange={value => setPassageB({ ...passageB, passage_content: value })}
                          placeholder="Enter the second passage for comparison..."
                          rows={8}
                          required={typeInfo.needsMultiplePassages}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Passage B Image (optional)</Label>
                        <p className="text-xs text-gray-600">
                          Upload an image if passage B includes charts, diagrams, or visual elements
                        </p>
                        <ImageUpload
                          currentUrl={passageB.passage_media_url}
                          onUploadComplete={url =>
                            setPassageB({ ...passageB, passage_media_url: url })
                          }
                        />
                      </div>
                    </>
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
                  <RichTextEditor
                    id={`question_text_${qIndex}`}
                    value={q.question_text}
                    onChange={value => updateQuestionText(qIndex, value)}
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
                <div className="space-y-4">
                  <Label>Answer Choices *</Label>
                  {q.choices.map((choice, cIndex) => (
                    <div
                      key={cIndex}
                      className="space-y-2 p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-8">{cIndex + 1}.</span>
                        <Input
                          value={choice.choice_text}
                          onChange={e => updateChoice(qIndex, cIndex, e.target.value)}
                          placeholder={`Choice ${cIndex + 1} text`}
                        />
                      </div>
                      {/* Image upload only for Chokai (listening) section */}
                      {section === 'listening' && (
                        <div className="ml-8">
                          <Label className="text-xs text-gray-600">
                            Image for choice {cIndex + 1} (optional - replaces text)
                          </Label>
                          <ImageUpload
                            currentUrl={choice.choice_image_url}
                            onUploadComplete={url => updateChoiceImage(qIndex, cIndex, url)}
                            maxSizeMB={5}
                          />
                        </div>
                      )}
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
