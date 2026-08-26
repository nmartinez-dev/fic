'use client';

import { Header } from '@/components/layout/header';
import { Nav } from '@/components/layout/nav';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="border-b">
        <Nav />
      </div>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        <div className="animate-page-enter">{children}</div>
      </main>
    </div>
  );
}
