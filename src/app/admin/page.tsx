'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Select } from '@/components/ui';
import { useRouter } from 'next/navigation';

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function AdminPage() {
  const { user, isAuthenticated } = useAuth();
  const { users, customers, jobs } = useData();
  const router = useRouter();
  const hydrated = useHydrated();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'reports'>('dashboard');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(j => j.status === 'completed').length;
    const pendingJobs = jobs.filter(j => ['pending', 'accepted', 'scheduled'].includes(j.status)).length;
    const confirmedOrders = customers.filter(c => c.status === 'confirmed').length;
    const conversionRate = totalCustomers > 0 ? ((confirmedOrders / totalCustomers) * 100).toFixed(1) : '0';
    const completionRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '0';

    return {
      totalCustomers,
      totalJobs,
      completedJobs,
      pendingJobs,
      confirmedOrders,
      conversionRate,
      completionRate,
    };
  }, [customers, jobs]);

  const jobStatusDistribution = useMemo(() => {
    const distribution = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([status, count]) => ({
      status,
      count,
      percentage: jobs.length > 0 ? ((count / jobs.length) * 100).toFixed(1) : '0',
    }));
  }, [jobs]);

  const salesPerformance = useMemo(() => {
    const salesUsers = users.filter(u => u.role === 'sales');
    return salesUsers.map(sales => {
      const customerCount = customers.filter(c => c.createdBy === sales.id).length;
      const dispatchCount = jobs.filter(j => j.createdBy === sales.id).length;
      return {
        name: sales.name,
        customers: customerCount,
        dispatches: dispatchCount,
      };
    });
  }, [users, customers, jobs]);

  const getRoleBadge = (role: string) => {
    const variants: Record<string, 'info' | 'success' | 'warning' | 'danger'> = {
      admin: 'danger',
      sales: 'info',
      service_head: 'warning',
      field_staff: 'success',
    };
    return variants[role] || 'info';
  };

  if (!hydrated || !user || user.role !== 'admin') {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-[#A0A0B8] mt-1">System overview and management</p>
          </div>
        </div>

        <div className="flex gap-2 border-b border-[#3A3A5C] pb-2">
          {[
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'users', label: 'Users' },
            { id: 'reports', label: 'Reports' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                px-4 py-2 text-sm font-medium rounded-lg transition-colors
                ${activeTab === tab.id 
                  ? 'bg-[#E94560] text-white' 
                  : 'text-[#A0A0B8] hover:bg-[#2A2A44] hover:text-white'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="animate-fadeIn stagger-1">
                <CardContent>
                  <p className="text-[#A0A0B8] text-sm">Total Customers</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.totalCustomers}</p>
                </CardContent>
              </Card>
              <Card className="animate-fadeIn stagger-2">
                <CardContent>
                  <p className="text-[#A0A0B8] text-sm">Total Jobs</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.totalJobs}</p>
                </CardContent>
              </Card>
              <Card className="animate-fadeIn stagger-3">
                <CardContent>
                  <p className="text-[#A0A0B8] text-sm">Conversion Rate</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.conversionRate}%</p>
                </CardContent>
              </Card>
              <Card className="animate-fadeIn stagger-4">
                <CardContent>
                  <p className="text-[#A0A0B8] text-sm">Completion Rate</p>
                  <p className="text-3xl font-bold text-white mt-1 font-mono">{stats.completionRate}%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="animate-fadeIn stagger-3">
                <CardHeader>
                  <CardTitle>Job Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {jobStatusDistribution.map(item => (
                      <div key={item.status} className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-white capitalize">{item.status.replace('_', ' ')}</span>
                            <span className="text-[#A0A0B8] text-sm">{item.count} ({item.percentage}%)</span>
                          </div>
                          <div className="h-2 bg-[#0F0F1A] rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-[#E94560] to-[#FF6B6B] rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-fadeIn stagger-4">
                <CardHeader>
                  <CardTitle>Sales Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {salesPerformance.map(sales => (
                      <div key={sales.name} className="flex items-center justify-between p-3 bg-[#0F0F1A] rounded-lg">
                        <div>
                          <p className="text-white font-medium">{sales.name}</p>
                          <p className="text-sm text-[#A0A0B8]">{sales.customers} customers</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-mono">{sales.dispatches}</p>
                          <p className="text-xs text-[#A0A0B8]">dispatches</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <Card className="animate-fadeIn">
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#3A3A5C]">
                      <th className="text-left p-3 text-sm font-medium text-[#A0A0B8]">User</th>
                      <th className="text-left p-3 text-sm font-medium text-[#A0A0B8]">Role</th>
                      <th className="text-left p-3 text-sm font-medium text-[#A0A0B8]">Email</th>
                      <th className="text-left p-3 text-sm font-medium text-[#A0A0B8]">Phone</th>
                      <th className="text-left p-3 text-sm font-medium text-[#A0A0B8]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b border-[#3A3A5C]/50 table-row-hover">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4DA8DA] to-[#00D9A5] flex items-center justify-center">
                              <span className="text-xs font-bold text-white">{u.name.charAt(0)}</span>
                            </div>
                            <span className="text-white font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getRoleBadge(u.role)}>{u.role.replace('_', ' ')}</Badge>
                        </td>
                        <td className="p-3 text-[#A0A0B8]">{u.email}</td>
                        <td className="p-3 text-[#A0A0B8]">{u.phone}</td>
                        <td className="p-3">
                          <Badge variant={u.active ? 'success' : 'danger'}>
                            {u.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-6">
            <Card className="animate-fadeIn">
              <CardHeader>
                <CardTitle>Sales Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0F0F1A] rounded-lg">
                    <p className="text-[#A0A0B8] text-sm">Total Customers</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalCustomers}</p>
                  </div>
                  <div className="p-4 bg-[#0F0F1A] rounded-lg">
                    <p className="text-[#A0A0B8] text-sm">Confirmed Orders</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{stats.confirmedOrders}</p>
                  </div>
                  <div className="p-4 bg-[#0F0F1A] rounded-lg">
                    <p className="text-[#A0A0B8] text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{stats.conversionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fadeIn stagger-1">
              <CardHeader>
                <CardTitle>Service Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-[#0F0F1A] rounded-lg">
                    <p className="text-[#A0A0B8] text-sm">Total Jobs</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{stats.totalJobs}</p>
                  </div>
                  <div className="p-4 bg-[#0F0F1A] rounded-lg">
                    <p className="text-[#A0A0B8] text-sm">Pending Jobs</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{stats.pendingJobs}</p>
                  </div>
                  <div className="p-4 bg-[#0F0F1A] rounded-lg">
                    <p className="text-[#A0A0B8] text-sm">Completion Rate</p>
                    <p className="text-2xl font-bold text-white mt-1 font-mono">{stats.completionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fadeIn stagger-2">
              <CardHeader>
                <CardTitle>Job Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobStatusDistribution.map(item => (
                    <div key={item.status} className="flex items-center gap-4">
                      <div className="w-32">
                        <span className="text-white capitalize">{item.status.replace('_', ' ')}</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-6 bg-[#0F0F1A] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[#4DA8DA] to-[#00D9A5] rounded-full"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-20 text-right">
                        <span className="text-white font-mono">{item.count}</span>
                        <span className="text-[#A0A0B8] text-sm ml-1">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
