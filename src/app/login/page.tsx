'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';
import { Button } from '@/components/ui';

const roles: { value: UserRole; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'sales',
    label: 'Sales Team',
    description: 'Manage customers, leads, and create dispatch requests',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    value: 'service_head',
    label: 'Service Head',
    description: 'Manage jobs, assign staff, oversee operations',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    value: 'field_staff',
    label: 'Field Staff',
    description: 'Execute jobs, update status, complete installations',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Full system access, user management, reports',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    setTimeout(() => {
      login(selectedRole);
      router.push('/');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E94560]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#4DA8DA]/10 rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8 animate-fadeIn">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#E94560] to-[#FF6B6B] flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FurniFlow</h1>
          <p className="text-[#A0A0B8]">Business Management System</p>
        </div>

        <div className="bg-[#1E1E32] border border-[#3A3A5C] rounded-2xl p-6 shadow-2xl animate-fadeIn stagger-1">
          <h2 className="text-xl font-semibold text-white mb-2">Select Your Role</h2>
          <p className="text-[#A0A0B8] text-sm mb-6">Choose a role to access the system</p>

          <div className="space-y-3">
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`
                  w-full p-4 rounded-xl border transition-all duration-200 text-left
                  ${selectedRole === role.value
                    ? 'border-[#E94560] bg-[#E94560]/10'
                    : 'border-[#3A3A5C] hover:border-[#E94560]/50 hover:bg-[#2A2A44]'
                  }
                `}
              >
                <div className="flex items-start gap-4">
                  <div className={`
                    p-2 rounded-lg
                    ${selectedRole === role.value ? 'bg-[#E94560]' : 'bg-[#2A2A44]'}
                  `}>
                    <span className={selectedRole === role.value ? 'text-white' : 'text-[#A0A0B8]'}>
                      {role.icon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{role.label}</h3>
                    <p className="text-sm text-[#A0A0B8] mt-0.5">{role.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <Button
            onClick={handleLogin}
            disabled={!selectedRole || isLoading}
            className="w-full mt-6"
            size="lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
        </div>

        <p className="text-center text-[#6B6B80] text-sm mt-6 animate-fadeIn stagger-2">
          Demo mode - No authentication required
        </p>
      </div>
    </div>
  );
}
