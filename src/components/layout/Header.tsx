'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Notification } from '@/types';

export default function Header() {
  const { user } = useAuth();
  const { getNotificationsForUser, markNotificationRead, clearNotifications } = useData();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const notifications = user ? getNotificationsForUser(user.id) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getNotifIcon = (type: Notification['type']) => {
    const icons = {
      info: <svg className="w-4 h-4 text-[#4DA8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      success: <svg className="w-4 h-4 text-[#00D9A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      warning: <svg className="w-4 h-4 text-[#FFB830]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
      alert: <svg className="w-4 h-4 text-[#E94560]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    };
    return icons[type];
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-[#1A1A2E] border-b border-[#3A3A5C] px-6 flex items-center justify-between">
      <div>
        <h2 className="text-white text-lg font-semibold capitalize">
          {user.role.replace('_', ' ')} Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#A0A0B8] hover:text-white hover:bg-[#2A2A44] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#E94560] text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1E1E32] border border-[#3A3A5C] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-[#3A3A5C] flex items-center justify-between">
                <h3 className="text-white font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={clearNotifications}
                    className="text-xs text-[#4DA8DA] hover:text-white"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-[#A0A0B8]">
                    No notifications
                  </div>
                ) : (
                  notifications.slice(0, 10).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`
                        px-4 py-3 border-b border-[#3A3A5C]/50 cursor-pointer
                        hover:bg-[#2A2A44] transition-colors
                        ${!notif.read ? 'bg-[#E94560]/5' : ''}
                      `}
                    >
                      <div className="flex gap-3">
                        {getNotifIcon(notif.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white">{notif.title}</p>
                          <p className="text-xs text-[#A0A0B8] mt-0.5 truncate">{notif.message}</p>
                          <p className="text-xs text-[#6B6B80] mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-[#3A3A5C]">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#00D9A5] flex items-center justify-center">
            <span className="text-sm font-bold text-white">{user.name.charAt(0)}</span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-[#A0A0B8] capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
