import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - GengoBot',
  description: 'Terms of Service for GengoBot Japanese learning platform',
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing and using GengoBot, you accept and agree to be bound by the terms and
            provision of this agreement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
          <p className="text-muted-foreground mb-4">
            Permission is granted to temporarily use GengoBot for personal, non-commercial learning
            purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. User Account</h2>
          <p className="text-muted-foreground mb-4">
            You are responsible for maintaining the confidentiality of your account and password.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Content</h2>
          <p className="text-muted-foreground mb-4">
            Our service allows you to create, upload, and share content. You retain ownership of any
            intellectual property rights that you hold in that content.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Limitations</h2>
          <p className="text-muted-foreground mb-4">
            In no event shall GengoBot be liable for any damages arising out of the use or inability
            to use the service.
          </p>
        </section>

        <section className="mb-8">
          <p className="text-sm text-muted-foreground">Last updated: November 17, 2025</p>
        </section>
      </div>
    </div>
  );
}
