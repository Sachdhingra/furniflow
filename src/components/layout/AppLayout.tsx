'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!hydrated || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] pb-16 lg:pb-0">
      <Sidebar />
      <div className="lg:ml-[280px] transition-all duration-300">
        <Header />
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
