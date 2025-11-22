'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface OnboardingData {
  ageRange: string;
  gender: string;
  learningDuration: string;
  currentLevel: string;
  learningGoals: string[];
  usageOpportunities: string[];
  hasAppExperience: boolean | null;
  previousApps: string;
  conversationPracticeExp: string;
  appOpinion: string;
  hasLivedInJapan: boolean | null;
  japanStayDuration: string;
}

interface OnboardingFlowProps {
  userId: string;
}

export function OnboardingFlow({ userId }: OnboardingFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [data, setData] = useState<OnboardingData>({
    ageRange: '',
    gender: '',
    learningDuration: '',
    currentLevel: '',
    learningGoals: [],
    usageOpportunities: [],
    hasAppExperience: null,
    previousApps: '',
    conversationPracticeExp: '',
    appOpinion: '',
    hasLivedInJapan: null,
    japanStayDuration: '',
  });

  const totalSteps = 7;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...data }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding data');
      }

      router.push('/app');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Gagal menyimpan data. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoalToggle = (goal: string) => {
    setData(prev => ({
      ...prev,
      learningGoals: prev.learningGoals.includes(goal)
        ? prev.learningGoals.filter(g => g !== goal)
        : [...prev.learningGoals, goal],
    }));
  };

  const handleUsageToggle = (usage: string) => {
    setData(prev => ({
      ...prev,
      usageOpportunities: prev.usageOpportunities.includes(usage)
        ? prev.usageOpportunities.filter(u => u !== usage)
        : [...prev.usageOpportunities, usage],
    }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <CardHeader>
              <CardTitle>Data Diri</CardTitle>
              <CardDescription>Bantu kami mengenal Anda lebih baik</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Usia</Label>
                <RadioGroup
                  value={data.ageRange}
                  onValueChange={v => setData({ ...data, ageRange: v })}
                >
                  {[
                    '10-19 tahun',
                    '20-29 tahun',
                    '30-39 tahun',
                    '40-49 tahun',
                    '50 tahun ke atas',
                  ].map(age => (
                    <div key={age} className="flex items-center space-x-2">
                      <RadioGroupItem value={age} id={age} />
                      <Label htmlFor={age} className="cursor-pointer">
                        {age}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-medium">Jenis Kelamin</Label>
                <RadioGroup
                  value={data.gender}
                  onValueChange={v => setData({ ...data, gender: v })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male" className="cursor-pointer">
                      Laki-laki
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female" className="cursor-pointer">
                      Perempuan
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </>
        );

      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Pengalaman Belajar</CardTitle>
              <CardDescription>Ceritakan lama belajar bahasa Jepang Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Lama belajar bahasa Jepang</Label>
                <RadioGroup
                  value={data.learningDuration}
                  onValueChange={v => setData({ ...data, learningDuration: v })}
                >
                  {[
                    'Kurang dari 6 bulan',
                    '6 bulan sampai 1 tahun',
                    '1 sampai 2 tahun',
                    '2 sampai 3 tahun',
                    'Lebih dari 3 tahun',
                  ].map(duration => (
                    <div key={duration} className="flex items-center space-x-2">
                      <RadioGroupItem value={duration} id={duration} />
                      <Label htmlFor={duration} className="cursor-pointer">
                        {duration}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </>
        );

      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Level Saat Ini</CardTitle>
              <CardDescription>Pilih level bahasa Jepang Anda saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={data.currentLevel}
                onValueChange={v => setData({ ...data, currentLevel: v })}
              >
                {[
                  { value: 'N5', label: 'N5 setara JFT A1' },
                  { value: 'N4', label: 'N4 setara JFT A2' },
                  { value: 'N3', label: 'N3' },
                  { value: 'N2', label: 'N2 ke atas' },
                  { value: 'unknown', label: 'Tidak tahu' },
                ].map(level => (
                  <div key={level.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <Label htmlFor={level.value} className="cursor-pointer">
                      {level.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </>
        );

      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Tujuan Belajar</CardTitle>
              <CardDescription>Pilih tujuan belajar Anda (boleh lebih dari satu)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Pekerjaan',
                  'Studi',
                  'Ginou jisshu atau Tokutei Ginou',
                  'Kebutuhan hidup sehari-hari',
                  'Hobi',
                  'Lainnya',
                ].map(goal => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={data.learningGoals.includes(goal)}
                      onCheckedChange={() => handleGoalToggle(goal)}
                    />
                    <Label htmlFor={goal} className="cursor-pointer">
                      {goal}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        );

      case 4:
        return (
          <>
            <CardHeader>
              <CardTitle>Kesempatan Menggunakan</CardTitle>
              <CardDescription>
                Di mana Anda menggunakan bahasa Jepang? (boleh lebih dari satu)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Kelas',
                  'Tempat kerja',
                  'Rumah',
                  'Percakapan dengan teman',
                  'Lainnya',
                  'Tidak pernah menggunakan',
                ].map(usage => (
                  <div key={usage} className="flex items-center space-x-2">
                    <Checkbox
                      id={usage}
                      checked={data.usageOpportunities.includes(usage)}
                      onCheckedChange={() => handleUsageToggle(usage)}
                    />
                    <Label htmlFor={usage} className="cursor-pointer">
                      {usage}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </>
        );

      case 5:
        return (
          <>
            <CardHeader>
              <CardTitle>Pengalaman Aplikasi</CardTitle>
              <CardDescription>
                Ceritakan pengalaman Anda dengan aplikasi belajar bahasa Jepang
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">
                  Pernah menggunakan aplikasi belajar bahasa Jepang?
                </Label>
                <RadioGroup
                  value={data.hasAppExperience === null ? '' : data.hasAppExperience ? 'yes' : 'no'}
                  onValueChange={v => setData({ ...data, hasAppExperience: v === 'yes' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="app-yes" />
                    <Label htmlFor="app-yes" className="cursor-pointer">
                      Pernah
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="app-no" />
                    <Label htmlFor="app-no" className="cursor-pointer">
                      Tidak pernah
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {data.hasAppExperience && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="previousApps">Nama aplikasi yang pernah digunakan</Label>
                    <Input
                      id="previousApps"
                      value={data.previousApps}
                      onChange={e => setData({ ...data, previousApps: e.target.value })}
                      placeholder="Contoh: Duolingo, Bunpo, dll"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">
                      Pengalaman latihan percakapan di aplikasi
                    </Label>
                    <RadioGroup
                      value={data.conversationPracticeExp}
                      onValueChange={v => setData({ ...data, conversationPracticeExp: v })}
                    >
                      {['Sering', 'Kadang-kadang', 'Hampir tidak pernah', 'Tidak pernah'].map(
                        exp => (
                          <div key={exp} className="flex items-center space-x-2">
                            <RadioGroupItem value={exp} id={exp} />
                            <Label htmlFor={exp} className="cursor-pointer">
                              {exp}
                            </Label>
                          </div>
                        )
                      )}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appOpinion">
                      Pendapat tentang latihan percakapan di aplikasi tersebut
                    </Label>
                    <Textarea
                      id="appOpinion"
                      value={data.appOpinion}
                      onChange={e => setData({ ...data, appOpinion: e.target.value })}
                      placeholder="Bagikan pendapat Anda..."
                      rows={3}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </>
        );

      case 6:
        return (
          <>
            <CardHeader>
              <CardTitle>Pengalaman di Jepang</CardTitle>
              <CardDescription>Apakah Anda pernah tinggal di Jepang?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-base font-medium">Pengalaman tinggal di Jepang</Label>
                <RadioGroup
                  value={data.hasLivedInJapan === null ? '' : data.hasLivedInJapan ? 'yes' : 'no'}
                  onValueChange={v => setData({ ...data, hasLivedInJapan: v === 'yes' })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="yes" id="japan-yes" />
                    <Label htmlFor="japan-yes" className="cursor-pointer">
                      Pernah
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="no" id="japan-no" />
                    <Label htmlFor="japan-no" className="cursor-pointer">
                      Tidak pernah
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {data.hasLivedInJapan && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Lama tinggal di Jepang</Label>
                  <RadioGroup
                    value={data.japanStayDuration}
                    onValueChange={v => setData({ ...data, japanStayDuration: v })}
                  >
                    {[
                      'Kurang dari 3 bulan',
                      '3 bulan sampai 1 tahun',
                      '1 sampai 3 tahun',
                      'Lebih dari 3 tahun',
                    ].map(duration => (
                      <div key={duration} className="flex items-center space-x-2">
                        <RadioGroupItem value={duration} id={`japan-${duration}`} />
                        <Label htmlFor={`japan-${duration}`} className="cursor-pointer">
                          {duration}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Langkah {currentStep + 1} dari {totalSteps}
            </span>
            <span className="text-sm font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card>
          {renderStep()}
          <div className="p-6 pt-0 flex gap-3">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Kembali
              </Button>
            )}
            <div className="flex-1" />
            {currentStep < totalSteps - 1 ? (
              <Button onClick={handleNext} className="gap-2">
                Lanjut
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? 'Menyimpan...' : 'Selesai'}
                <Check className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
