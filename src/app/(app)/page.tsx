import AppDashboard from '@/components/app/dashboard/AppDashboard';

export const dynamic = 'force-dynamic';

// Note: Authentication and onboarding checks are handled by the layout
// See: src/app/app/layout.tsx

export default function AppPage() {
  return <AppDashboard />;
}
