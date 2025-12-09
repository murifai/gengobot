'use client';

import { FeatureGuard } from '@/components/guards/FeatureGuard';

export default function KaiwaLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard>{children}</FeatureGuard>;
}
