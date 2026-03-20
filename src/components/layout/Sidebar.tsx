'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    roles: ['admin', 'sales', 'service_head', 'field_staff'],
  },
  {
    href: '/sales',
    label: 'Customers',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    roles: ['admin', 'sales'],
  },
  {
    href: '/service',
    label: 'Jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
    roles: ['admin', 'service_head', 'field_staff'],
  },
  {
    href: '/admin',
    label: 'Admin',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    roles: ['admin'],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside 
      className={`
        fixed left-0 top-0 h-full bg-[#1A1A2E] border-r border-[#3A3A5C]
        transition-all duration-300 z-40 flex flex-col
        ${collapsed ? 'w-[72px]' : 'w-[280px]'}
      `}
    >
      <div className="p-4 border-b border-[#3A3A5C]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E94560] to-[#FF6B6B] flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">FurniFlow</h1>
              <p className="text-xs text-[#A0A0B8]">Business Management</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredNavItems.map(item => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-[#E94560]/20 to-transparent text-[#E94560] border-l-2 border-[#E94560]' 
                  : 'text-[#A0A0B8] hover:bg-[#2A2A44] hover:text-white'
                }
              `}
            >
              <span className={isActive ? 'text-[#E94560]' : ''}>{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[#3A3A5C]">
        <div className={`
          flex items-center gap-3 p-2 rounded-lg bg-[#0F0F1A]
          ${collapsed ? 'justify-center' : ''}
        `}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#00D9A5] flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-[#A0A0B8] capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={logout}
              className="p-1.5 text-[#A0A0B8] hover:text-[#E94560] transition-colors"
              title="Logout"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-[#2A2A44] border border-[#3A3A5C] rounded-full flex items-center justify-center text-[#A0A0B8] hover:text-white hover:border-[#E94560] transition-all"
      >
        <svg className={`w-3 h-3 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </aside>
  );
}
