'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/Badge';
import { getMondaiConfig } from '@/config/jlpt-mondai-config';
import { QuestionFormModal } from '@/components/admin/jlpt/QuestionFormModal';
import { BulkImportModal } from '@/components/admin/jlpt/BulkImportModal';

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  correctAnswer: number;
  difficulty: string;
  passage?: {
    id: string;
    title?: string;
  };
  answerChoices: {
    choiceNumber: number;
    choiceText?: string;
  }[];
}

export default function JLPTQuestionManagementPage() {
  const router = useRouter();
  const params = useParams();
  const level = params?.level as string;
  const section = params?.section as string;
  const mondai = parseInt((params?.mondai as string) || '0');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const mondaiConfig = getMondaiConfig(level, section, mondai);

  useEffect(() => {
    fetchQuestions();
  }, [level, section, mondai]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/jlpt/questions?level=${level}&section=${section}&mondai=${mondai}`
      );
      const data = await response.json();
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/jlpt/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchQuestions();
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        `/api/jlpt/questions/template?level=${level}&section=${section}&mondai=${mondai}`
      );
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `jlpt_${level}_${section}_mondai${mondai}_template.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  const sectionNames: Record<string, string> = {
    vocabulary: 'Vocabulary',
    grammar_reading: 'Grammar & Reading',
    listening: 'Listening',
  };

  if (!mondaiConfig) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Invalid mondai configuration</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push(`/admin/jlpt/questions/${level}/${section}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Mondai List
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Questions</span>
          <span>›</span>
          <span>{level}</span>
          <span>›</span>
          <span>{sectionNames[section]}</span>
          <span>›</span>
          <span>Mondai {mondai}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {level} - {sectionNames[section]} - Mondai {mondai}
            </h1>
            <p className="text-muted-foreground mb-2">{mondaiConfig.name}</p>
            <p className="text-sm text-muted-foreground">{mondaiConfig.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Template
            </Button>
            <Button variant="outline" onClick={() => setShowBulkImport(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Bulk Import
            </Button>
            <Button
              onClick={() => {
                setEditingQuestion(null);
                setShowQuestionForm(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>
      </div>

      {/* Question Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Questions</CardDescription>
            <CardTitle className="text-2xl">
              {questions.length} / {mondaiConfig.questionNumbers.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Completion</CardDescription>
            <CardTitle className="text-2xl">
              {Math.round((questions.length / mondaiConfig.questionNumbers.length) * 100)}%
            </CardTitle>
          </CardHeader>
        </Card>
        {mondaiConfig.requiresPassage && (
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Passages Required</CardDescription>
              <CardTitle className="text-2xl">{mondaiConfig.passageCount || 1}</CardTitle>
            </CardHeader>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Question Type</CardDescription>
            <CardTitle className="text-lg">{mondaiConfig.mondaiType}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Questions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading questions...</div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No questions yet. Add your first question to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Question</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead>Correct</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {questions.map((question, index) => (
                  <TableRow key={question.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="max-w-md">
                      <div className="truncate" title={question.questionText}>
                        {question.questionText}
                      </div>
                      {question.passage && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Has Passage
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{question.questionType}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          question.difficulty === 'easy'
                            ? 'secondary'
                            : question.difficulty === 'hard'
                              ? 'destructive'
                              : 'default'
                        }
                      >
                        {question.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>Choice {question.correctAnswer}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingQuestion(question);
                            setShowQuestionForm(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {showQuestionForm && (
        <QuestionFormModal
          level={level}
          section={section}
          mondai={mondai}
          mondaiConfig={mondaiConfig}
          question={editingQuestion || undefined}
          onClose={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onSuccess={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
            fetchQuestions();
          }}
        />
      )}

      {showBulkImport && (
        <BulkImportModal
          level={level}
          section={section}
          mondai={mondai}
          mondaiConfig={mondaiConfig}
          onClose={() => setShowBulkImport(false)}
          onSuccess={() => {
            setShowBulkImport(false);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}
