'use client';

import { LazyMotion, domAnimation } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * LazyMotion provider for reduced bundle size
 * Uses domAnimation features (~15KB) instead of full bundle (~108KB)
 *
 * Wrap components that use framer-motion with this provider
 * and use `m` instead of `motion` for tree-shaking
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
