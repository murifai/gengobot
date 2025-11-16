import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - GengoBot',
  description: 'Privacy Policy for GengoBot Japanese learning platform',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>

      <div className="prose prose-slate dark:prose-invert max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            We collect information that you provide directly to us, including your name, email
            address, and learning progress data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We use the information we collect to provide, maintain, and improve our services, and to
            personalize your learning experience.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="text-muted-foreground mb-4">
            We do not share your personal information with third parties except as described in this
            privacy policy.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We take reasonable measures to help protect your personal information from loss, theft,
            misuse, and unauthorized access.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="text-muted-foreground mb-4">
            You have the right to access, update, or delete your personal information at any time.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Cookies</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies and similar tracking technologies to track activity on our service and
            hold certain information.
          </p>
        </section>

        <section className="mb-8">
          <p className="text-sm text-muted-foreground">Last updated: November 17, 2025</p>
        </section>
      </div>
    </div>
  );
}
