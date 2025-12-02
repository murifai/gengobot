'use client';

import { useState, useEffect } from 'react';
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

interface City {
  name: string;
  country: string;
}

interface OnboardingData {
  nickname: string;
  domicile: string;
  institution: string;
  ageRange: string;
  gender: string;
  learningDuration: string;
  currentLevel: string;
  learningGoals: string[];
  learningGoalsOther: string;
  usageOpportunities: string[];
  usageOpportunitiesOther: string;
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
    nickname: '',
    domicile: '',
    institution: '',
    ageRange: '',
    gender: '',
    learningDuration: '',
    currentLevel: '',
    learningGoals: [],
    learningGoalsOther: '',
    usageOpportunities: [],
    usageOpportunitiesOther: '',
    hasAppExperience: null,
    previousApps: '',
    conversationPracticeExp: '',
    appOpinion: '',
    hasLivedInJapan: null,
    japanStayDuration: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    fetch('/api/cities')
      .then(res => res.json())
      .then(data => setCities(data.cities))
      .catch(err => console.error('Failed to load cities:', err));
  }, []);

  const totalSteps = 8;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 0:
        if (!data.nickname.trim()) newErrors.nickname = 'Nama panggilan wajib diisi';
        if (!data.domicile) newErrors.domicile = 'Domisili wajib dipilih';
        break;
      case 1:
        if (!data.ageRange) newErrors.ageRange = 'Usia wajib dipilih';
        if (!data.gender) newErrors.gender = 'Jenis kelamin wajib dipilih';
        break;
      case 2:
        if (!data.learningDuration) newErrors.learningDuration = 'Lama belajar wajib dipilih';
        break;
      case 3:
        if (!data.currentLevel) newErrors.currentLevel = 'Level wajib dipilih';
        break;
      case 4:
        if (data.learningGoals.length === 0) newErrors.learningGoals = 'Pilih minimal satu tujuan';
        if (data.learningGoals.includes('Lainnya') && !data.learningGoalsOther.trim()) {
          newErrors.learningGoalsOther = 'Jelaskan tujuan lainnya';
        }
        break;
      case 5:
        if (data.usageOpportunities.length === 0)
          newErrors.usageOpportunities = 'Pilih minimal satu kesempatan';
        if (data.usageOpportunities.includes('Lainnya') && !data.usageOpportunitiesOther.trim()) {
          newErrors.usageOpportunitiesOther = 'Jelaskan kesempatan lainnya';
        }
        break;
      case 6:
        if (data.hasAppExperience === null) newErrors.hasAppExperience = 'Pilih salah satu';
        if (data.hasAppExperience) {
          if (!data.previousApps.trim()) newErrors.previousApps = 'Nama aplikasi wajib diisi';
          if (!data.conversationPracticeExp)
            newErrors.conversationPracticeExp = 'Pengalaman latihan wajib dipilih';
        }
        break;
      case 7:
        if (data.hasLivedInJapan === null) newErrors.hasLivedInJapan = 'Pilih salah satu';
        if (data.hasLivedInJapan && !data.japanStayDuration) {
          newErrors.japanStayDuration = 'Lama tinggal wajib dipilih';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep) && currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

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
              <CardTitle>Profil Anda</CardTitle>
              <CardDescription>Lengkapi informasi dasar Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nama Panggilan</Label>
                <Input
                  id="nickname"
                  value={data.nickname}
                  onChange={e => setData({ ...data, nickname: e.target.value })}
                  placeholder="Masukkan nama panggilan"
                />
                {errors.nickname && <p className="text-sm text-red-500">{errors.nickname}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="domicile">Domisili</Label>
                <Input
                  id="domicile"
                  value={data.domicile}
                  onChange={e => setData({ ...data, domicile: e.target.value })}
                  placeholder="Masukkan kota domisili"
                  list="cities-list"
                />
                <datalist id="cities-list">
                  {cities.map(city => (
                    <option key={city.name} value={city.name} />
                  ))}
                </datalist>
                {errors.domicile && <p className="text-sm text-red-500">{errors.domicile}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Institusi (opsional)</Label>
                <Input
                  id="institution"
                  value={data.institution}
                  onChange={e => setData({ ...data, institution: e.target.value })}
                  placeholder="Sekolah/Universitas/Tempat Kerja"
                />
              </div>
            </CardContent>
          </>
        );

      case 1:
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
                {errors.ageRange && <p className="text-sm text-red-500">{errors.ageRange}</p>}
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
                {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
              </div>
            </CardContent>
          </>
        );

      case 2:
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
                {errors.learningDuration && (
                  <p className="text-sm text-red-500">{errors.learningDuration}</p>
                )}
              </div>
            </CardContent>
          </>
        );

      case 3:
        return (
          <>
            <CardHeader>
              <CardTitle>Level Saat Ini</CardTitle>
              <CardDescription>Pilih level bahasa Jepang Anda saat ini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <RadioGroup
                  value={data.currentLevel}
                  onValueChange={v => setData({ ...data, currentLevel: v })}
                >
                  {[
                    { value: 'N5', label: 'N5 setara JFT A1' },
                    { value: 'N4', label: 'N4 setara JFT A2' },
                    { value: 'N3', label: 'N3' },
                    { value: 'N2', label: 'N2' },
                    { value: 'N1', label: 'N1' },
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
                {errors.currentLevel && (
                  <p className="text-sm text-red-500">{errors.currentLevel}</p>
                )}
              </div>
            </CardContent>
          </>
        );

      case 4:
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
                {data.learningGoals.includes('Lainnya') && (
                  <div className="ml-6 mt-2">
                    <Input
                      value={data.learningGoalsOther}
                      onChange={e => setData({ ...data, learningGoalsOther: e.target.value })}
                      placeholder="Jelaskan tujuan lainnya..."
                    />
                    {errors.learningGoalsOther && (
                      <p className="text-sm text-red-500 mt-1">{errors.learningGoalsOther}</p>
                    )}
                  </div>
                )}
                {errors.learningGoals && (
                  <p className="text-sm text-red-500">{errors.learningGoals}</p>
                )}
              </div>
            </CardContent>
          </>
        );

      case 5:
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
                {data.usageOpportunities.includes('Lainnya') && (
                  <div className="ml-6 mt-2">
                    <Input
                      value={data.usageOpportunitiesOther}
                      onChange={e => setData({ ...data, usageOpportunitiesOther: e.target.value })}
                      placeholder="Jelaskan kesempatan lainnya..."
                    />
                    {errors.usageOpportunitiesOther && (
                      <p className="text-sm text-red-500 mt-1">{errors.usageOpportunitiesOther}</p>
                    )}
                  </div>
                )}
                {errors.usageOpportunities && (
                  <p className="text-sm text-red-500">{errors.usageOpportunities}</p>
                )}
              </div>
            </CardContent>
          </>
        );

      case 6:
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
                {errors.hasAppExperience && (
                  <p className="text-sm text-red-500">{errors.hasAppExperience}</p>
                )}
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
                    {errors.previousApps && (
                      <p className="text-sm text-red-500">{errors.previousApps}</p>
                    )}
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
                    {errors.conversationPracticeExp && (
                      <p className="text-sm text-red-500">{errors.conversationPracticeExp}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="appOpinion">
                      Pendapat tentang latihan percakapan di aplikasi tersebut (opsional)
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

      case 7:
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
                {errors.hasLivedInJapan && (
                  <p className="text-sm text-red-500">{errors.hasLivedInJapan}</p>
                )}
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
                  {errors.japanStayDuration && (
                    <p className="text-sm text-red-500">{errors.japanStayDuration}</p>
                  )}
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
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
          <div className="p-6 pt-4 flex gap-3">
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
