import { describe, it, expect } from '@jest/globals';
import path from 'path';
import fs from 'fs';

describe('Konfigurasi Environment', () => {
  it('harus memiliki file .env.example', () => {
    const envExamplePath = path.join(process.cwd(), '.env.example');
    expect(fs.existsSync(envExamplePath)).toBe(true);
  });

  it('harus memiliki semua variabel environment yang diperlukan di template', () => {
    const envExample = fs.readFileSync('.env.example', 'utf-8');
    const requiredVars = ['OPENAI_API_KEY', 'DATABASE_URL', 'AUTH_SECRET', 'NEXTAUTH_URL'];

    requiredVars.forEach(varName => {
      expect(envExample).toContain(varName);
    });
  });

  it('tidak boleh commit file .env.local', () => {
    const gitignore = fs.readFileSync('.gitignore', 'utf-8');
    expect(gitignore).toContain('.env');
  });

  it('harus memiliki file Prettier configuration', () => {
    expect(fs.existsSync('.prettierrc')).toBe(true);
  });

  it('harus memiliki file Docker configuration', () => {
    expect(fs.existsSync('Dockerfile')).toBe(true);
    expect(fs.existsSync('docker-compose.yml')).toBe(true);
  });
});
