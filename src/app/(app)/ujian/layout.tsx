'use client';

import { FeatureGuard } from '@/components/guards/FeatureGuard';

export default function UjianLayout({ children }: { children: React.ReactNode }) {
  return <FeatureGuard>{children}</FeatureGuard>;
}
