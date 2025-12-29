'use client';

import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getSectionMondais } from '@/config/jlpt-mondai-config';

export default function JLPTQuestionMondaiSelectionPage() {
  const router = useRouter();
  const params = useParams();
  const level = params.level as string;
  const section = params.section as string;

  // Get all mondai for this section
  const mondais = getSectionMondais(level, section);

  const sectionNames: Record<string, string> = {
    vocabulary: 'Vocabulary',
    grammar_reading: 'Grammar & Reading',
    listening: 'Listening',
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push(`/admin/jlpt/questions/${level}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sections
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <span>Questions</span>
          <span>›</span>
          <span>{level}</span>
          <span>›</span>
          <span>{sectionNames[section]}</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">
          {level} - {sectionNames[section]}
        </h1>
        <p className="text-muted-foreground">Select a mondai to manage questions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mondais.map((mondaiConfig) => {
          const totalQuestions = mondaiConfig.questionNumbers.length;

          return (
            <Card
              key={mondaiConfig.mondai}
              className="cursor-pointer transition-all hover:shadow-lg border-2 hover:border-primary"
              onClick={() =>
                router.push(`/admin/jlpt/questions/${level}/${section}/${mondaiConfig.mondai}`)
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">Mondai {mondaiConfig.mondai}</CardTitle>
                    <CardDescription className="text-xs font-medium mt-1">
                      {mondaiConfig.name}
                    </CardDescription>
                  </div>
                  {mondaiConfig.requiresPassage && (
                    <Badge variant="secondary" className="text-xs">
                      📄
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">{mondaiConfig.description}</p>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-xs text-muted-foreground">Questions:</span>
                    <span className="font-semibold text-sm">{totalQuestions}</span>
                  </div>
                  {mondaiConfig.requiresPassage && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Passages:</span>
                      <span className="font-semibold text-sm">
                        {mondaiConfig.passageCount || 1}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
