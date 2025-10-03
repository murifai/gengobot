/* eslint-disable @typescript-eslint/no-require-imports */
import { describe, it, expect } from '@jest/globals';

describe('Konfigurasi Proyek', () => {
  it('harus memiliki konfigurasi Next.js yang valid', () => {
    const nextConfig = require('../../next.config.ts');
    expect(nextConfig).toBeDefined();
  });

  it('harus memiliki dependencies yang diperlukan', () => {
    const pkg = require('../../package.json');
    expect(pkg.dependencies).toHaveProperty('next');
    expect(pkg.dependencies).toHaveProperty('react');
    expect(pkg.dependencies).toHaveProperty('prisma');
    expect(pkg.dependencies).toHaveProperty('openai');
    expect(pkg.dependencies).toHaveProperty('@supabase/supabase-js');
  });

  it('harus memiliki scripts yang diperlukan', () => {
    const pkg = require('../../package.json');
    expect(pkg.scripts).toHaveProperty('dev');
    expect(pkg.scripts).toHaveProperty('build');
    expect(pkg.scripts).toHaveProperty('test');
    expect(pkg.scripts).toHaveProperty('lint');
    expect(pkg.scripts).toHaveProperty('type-check');
  });

  it('harus memiliki devDependencies untuk testing', () => {
    const pkg = require('../../package.json');
    expect(pkg.devDependencies).toHaveProperty('jest');
    expect(pkg.devDependencies).toHaveProperty('@testing-library/react');
    expect(pkg.devDependencies).toHaveProperty('@playwright/test');
  });
});
