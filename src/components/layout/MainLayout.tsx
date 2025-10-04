import { ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

export interface MainLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showHeader?: boolean;
}

export default function MainLayout({
  children,
  showSidebar = true,
  showHeader = true,
}: MainLayoutProps) {
  return (
    <div className="flex h-screen flex-col">
      {showHeader && <Header />}

      <div className="flex flex-1 overflow-hidden">
        {showSidebar && <Sidebar />}

        <main className="flex-1 overflow-y-auto bg-background">
          <div className="mx-auto max-w-7xl p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
