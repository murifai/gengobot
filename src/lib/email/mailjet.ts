/**
 * Mailjet Email Service
 * Handles sending transactional emails via Mailjet API
 */

import Mailjet from 'node-mailjet';

// Validate environment variables
const apiKey = process.env.MAILJET_API_PUBLIC_KEY;
const apiSecret = process.env.MAILJET_API_PRIVATE_KEY;
const fromEmail = process.env.MAILJET_FROM_EMAIL || 'noreply@gengobot.com';
const fromName = process.env.MAILJET_FROM_NAME || 'Gengobot';

if (!apiKey || !apiSecret) {
  throw new Error(
    'Mailjet credentials are not configured. Please set MAILJET_API_PUBLIC_KEY and MAILJET_API_PRIVATE_KEY environment variables.'
  );
}

// Initialize Mailjet client
const mailjet = new Mailjet({
  apiKey,
  apiSecret,
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Mailjet
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: fromEmail,
            Name: fromName,
          },
          To: [
            {
              Email: options.to,
            },
          ],
          Subject: options.subject,
          TextPart: options.text || '',
          HTMLPart: options.html,
        },
      ],
    });

    await request;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, verificationUrl: string): Promise<void> {
  const subject = 'Verify your email - Gengobot';
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to Gengobot!</h1>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Thank you for signing up. Please verify your email address to activate your account.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Email
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #2563eb; word-break: break-all;">
            ${verificationUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to Gengobot!

Thank you for signing up. Please verify your email address to activate your account.

Verification Link: ${verificationUrl}

This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
  `.trim();

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send welcome email (after verification)
 */
export async function sendWelcomeEmail(email: string, name?: string): Promise<void> {
  const subject = 'Welcome to Gengobot - Start Your Japanese Learning Journey!';
  const displayName = name || 'there';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Gengobot</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Welcome to Gengobot, ${displayName}! 🎌</h1>

          <p style="font-size: 16px; margin-bottom: 20px;">
            Your email has been verified successfully! You're all set to start your Japanese learning journey.
          </p>

          <h2 style="color: #1e40af; font-size: 18px; margin-top: 30px;">What's Next?</h2>

          <ul style="font-size: 15px; line-height: 1.8;">
            <li><strong>Complete your profile:</strong> Set your proficiency level (N5-N1)</li>
            <li><strong>Explore tasks:</strong> Practice real-world Japanese scenarios</li>
            <li><strong>Study flashcards:</strong> Build your vocabulary with spaced repetition</li>
            <li><strong>Chat with AI:</strong> Practice conversations in Japanese</li>
          </ul>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999;">
            Need help? Reply to this email or visit our help center.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Welcome to Gengobot, ${displayName}! 🎌

Your email has been verified successfully! You're all set to start your Japanese learning journey.

What's Next?
- Complete your profile: Set your proficiency level (N5-N1)
- Explore tasks: Practice real-world Japanese scenarios
- Study flashcards: Build your vocabulary with spaced repetition
- Chat with AI: Practice conversations in Japanese

Get started: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard

Need help? Reply to this email or visit our help center.
  `.trim();

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  const subject = 'Reset Your Password - Gengobot';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Reset Your Password</h1>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We received a request to reset your password. Click the button below to create a new password.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            If the button doesn't work, copy and paste this link into your browser:
          </p>
          <p style="font-size: 12px; color: #2563eb; word-break: break-all;">
            ${resetUrl}
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 12px; color: #999;">
            This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
          </p>
        </div>
      </body>
    </html>
  `;

  const text = `
Reset Your Password

We received a request to reset your password. Click the link below to create a new password.

Reset Link: ${resetUrl}

This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
  `.trim();

  await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
