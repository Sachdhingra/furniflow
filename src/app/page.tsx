'use client';

import React, { useEffect, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { useRouter } from 'next/navigation';

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { customers, jobs, getNotificationsForUser, jobs: allJobs } = useData();
  const router = useRouter();
  const hydrated = useHydrated();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!hydrated || !user) return null;

  const notifications = getNotificationsForUser(user.id);
  const unreadCount = notifications.filter(n => !n.read).length;

  const stats = {
    totalCustomers: customers.length,
    pendingJobs: allJobs.filter(j => j.status === 'pending' || j.status === 'accepted' || j.status === 'scheduled').length,
    completedToday: allJobs.filter(j => {
      if (j.status !== 'completed' || !j.completedAt) return false;
      const today = new Date();
      const completed = new Date(j.completedAt);
      return completed.toDateString() === today.toDateString();
    }).length,
    activeLeads: customers.filter(c => c.status === 'lead' || c.status === 'prospect').length,
  };

  const recentJobs = [...allJobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const pendingFollowUps = customers.filter(c => {
    if (!c.followUpDate || c.status === 'closed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(c.followUpDate);
    followUp.setHours(0, 0, 0, 0);
    return followUp <= today;
  });

  const getJobStatusBadge = (status: string) => {
    const variants: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'accent' | 'default'> = {
      pending: 'warning',
      accepted: 'info',
      scheduled: 'default',
      out_for_delivery: 'accent',
      delivered: 'success',
      completed: 'success',
      rescheduled: 'warning',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user.name.split(' ')[0]}</h1>
            <p className="text-[#A0A0B8] mt-1">Here&apos;s what&apos;s happening today</p>
          </div>
          {unreadCount > 0 && (
            <Badge variant="accent">{unreadCount} new notifications</Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="animate-fadeIn stagger-1">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0A0B8] text-sm">Total Customers</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.totalCustomers}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#4DA8DA]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#4DA8DA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fadeIn stagger-2">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0A0B8] text-sm">Pending Jobs</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.pendingJobs}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#FFB830]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#FFB830]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fadeIn stagger-3">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0A0B8] text-sm">Completed Today</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.completedToday}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#00D9A5]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#00D9A5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fadeIn stagger-4">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#A0A0B8] text-sm">Active Leads</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.activeLeads}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#E94560]/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#E94560]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="animate-fadeIn stagger-3">
            <CardHeader>
              <CardTitle>Recent Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentJobs.map(job => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-[#0F0F1A] hover:bg-[#2A2A44] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#E94560]" />
                      <div>
                        <p className="text-white font-medium">{job.customerName}</p>
                        <p className="text-sm text-[#A0A0B8]">{job.product}</p>
                      </div>
                    </div>
                    <Badge variant={getJobStatusBadge(job.status)}>
                      {job.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {recentJobs.length === 0 && (
                  <p className="text-[#A0A0B8] text-center py-4">No recent jobs</p>
                )}
              </div>
            </CardContent>
          </Card>

          {(user.role === 'sales' || user.role === 'admin') && (
            <Card className="animate-fadeIn stagger-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#FFB830] animate-pulse" />
                  Follow-ups Due Today
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingFollowUps.map(customer => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0F0F1A] hover:bg-[#2A2A44] transition-colors"
                    >
                      <div>
                        <p className="text-white font-medium">{customer.name}</p>
                        <p className="text-sm text-[#A0A0B8]">{customer.phone}</p>
                      </div>
                      <Badge variant="warning">
                        {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'N/A'}
                      </Badge>
                    </div>
                  ))}
                  {pendingFollowUps.length === 0 && (
                    <p className="text-[#A0A0B8] text-center py-4">No follow-ups due today</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {user.role === 'service_head' && (
            <Card className="animate-fadeIn stagger-4">
              <CardHeader>
                <CardTitle>Job Actions Required</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allJobs.filter(j => j.status === 'pending').map(job => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-[#0F0F1A]"
                    >
                      <div>
                        <p className="text-white font-medium">{job.customerName}</p>
                        <p className="text-sm text-[#A0A0B8]">{job.type} - {job.product}</p>
                      </div>
                      <Badge variant="warning">Pending Accept</Badge>
                    </div>
                  ))}
                  {allJobs.filter(j => j.status === 'pending').length === 0 && (
                    <p className="text-[#A0A0B8] text-center py-4">No pending actions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
