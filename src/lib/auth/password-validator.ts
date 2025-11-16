export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
  score: number; // 0-4
}

// Common weak passwords (top 100 most common)
const COMMON_PASSWORDS = [
  'password',
  '12345678',
  'qwerty',
  'abc123',
  'monkey',
  'letmein',
  'trustno1',
  'dragon',
  'baseball',
  'iloveyou',
  'master',
  'sunshine',
  'ashley',
  'bailey',
  'passw0rd',
  'shadow',
  '123123',
  '654321',
  'superman',
  'qazwsx',
  'michael',
  'football',
  'password1',
  'Password1',
  'welcome',
  'login',
  'admin',
  'princess',
  'starwars',
  'password123',
];

/**
 * Validate password strength and security requirements
 * @param password - Password to validate
 * @returns Validation result with errors and strength score
 */
export function validatePassword(password: string): PasswordValidationResult {
  const errors: string[] = [];
  let score = 0;

  // Length check (8 minimum)
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  } else {
    score++;
    if (password.length >= 12) score++; // Bonus for 12+
    if (password.length >= 16) score++; // Bonus for 16+
  }

  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  } else {
    score++;
  }

  // Lowercase check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  } else {
    score++;
  }

  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  } else {
    score++;
  }

  // Special character check (optional, gives bonus points)
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    score++;
  }

  // Common password check
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password.');
    score = Math.max(0, score - 2);
  }

  // Calculate strength
  let strength: PasswordValidationResult['strength'];
  if (score <= 2) strength = 'weak';
  else if (score === 3) strength = 'medium';
  else if (score === 4) strength = 'strong';
  else strength = 'very-strong';

  return {
    isValid: errors.length === 0,
    errors,
    strength,
    score: Math.min(4, score),
  };
}

/**
 * Optional: Check if password has been exposed in data breaches using HaveIBeenPwned API
 * @param password - Password to check
 * @returns true if password found in breach database, false otherwise
 */
export async function checkPasswordBreach(password: string): Promise<boolean> {
  try {
    const crypto = await import('crypto');
    const sha1 = crypto.createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = sha1.substring(0, 5);
    const suffix = sha1.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
    const text = await response.text();

    // Check if password hash suffix appears in breached list
    return text.includes(suffix);
  } catch (error) {
    console.error('[AUTH] Password breach check failed:', error);
    return false; // Fail open (don't block registration if API is down)
  }
}
