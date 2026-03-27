'use client';

import React, { useState, useEffect, useMemo, useSyncExternalStore } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, Button, Input, Textarea, Select, Modal, Badge } from '@/components/ui';
import { Job, JobStatus, JobType } from '@/types';
import { useRouter } from 'next/navigation';

function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function ServicePage() {
  const { user, isAuthenticated } = useAuth();
  const { jobs, addJob, updateJob, addNotification, users, customers } = useData();
  const router = useRouter();
  const hydrated = useHydrated();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    address: '',
    product: '',
    type: 'service' as JobType,
    scheduledDate: '',
    assignedTo: '',
  });

  const [rescheduleData, setRescheduleData] = useState({
    reason: '',
    newDate: '',
  });

  const [completionData, setCompletionData] = useState({
    remarks: '',
    images: '',
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else if (user && !['service_head', 'field_staff', 'admin'].includes(user.role)) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
      const matchesType = typeFilter === 'all' || j.type === typeFilter;
      return matchesStatus && matchesType;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [jobs, statusFilter, typeFilter]);

  const fieldStaff = users.filter(u => u.role === 'field_staff');

  const getStatusBadge = (status: JobStatus) => {
    const variants: Record<JobStatus, 'info' | 'warning' | 'success' | 'danger' | 'accent' | 'default'> = {
      pending: 'warning',
      accepted: 'info',
      scheduled: 'default',
      out_for_delivery: 'accent',
      delivered: 'success',
      completed: 'success',
      rescheduled: 'warning',
      cancelled: 'danger',
    };
    return variants[status];
  };

  const getTypeBadge = (type: JobType) => {
    const variants: Record<JobType, 'info' | 'success' | 'warning'> = {
      service: 'info',
      delivery: 'success',
      installation: 'warning',
    };
    return variants[type];
  };

  const handleAddJob = () => {
    if (!user || !formData.customerName || !formData.customerPhone || !formData.address) return;

    addJob({
      customerId: `manual-${Date.now()}`,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      address: formData.address,
      product: formData.product,
      type: formData.type,
      status: 'pending',
      source: 'manual',
      scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate) : null,
      assignedTo: formData.assignedTo || null,
      rescheduleReason: null,
      images: [],
      remarks: '',
      completedAt: null,
      createdBy: user.id,
    });

    setFormData({
      customerName: '',
      customerPhone: '',
      address: '',
      product: '',
      type: 'service',
      scheduledDate: '',
      assignedTo: '',
    });
    setShowAddModal(false);
  };

  const handleAcceptJob = (job: Job) => {
    updateJob(job.id, { status: 'accepted' });
    
    const salesUsers = users.filter(u => u.role === 'sales');
    salesUsers.forEach(sales => {
      addNotification({
        userId: sales.id,
        type: 'success',
        title: 'Job Accepted',
        message: `Job for ${job.customerName} has been accepted`,
        read: false,
      });
    });
  };

  const handleRescheduleJob = () => {
    if (!selectedJob || !rescheduleData.newDate) return;

    updateJob(selectedJob.id, {
      status: 'scheduled',
      scheduledDate: new Date(rescheduleData.newDate),
      rescheduleReason: rescheduleData.reason,
    });

    const salesUsers = users.filter(u => u.role === 'sales');
    salesUsers.forEach(sales => {
      addNotification({
        userId: sales.id,
        type: 'warning',
        title: 'Job Rescheduled',
        message: `Job for ${selectedJob.customerName} has been rescheduled to ${new Date(rescheduleData.newDate).toLocaleDateString()}`,
        read: false,
      });
    });

    setRescheduleData({ reason: '', newDate: '' });
    setShowDetailModal(false);
  };

  const handleAssignManpower = (jobId: string, staffId: string) => {
    updateJob(jobId, { 
      assignedTo: staffId,
      status: jobId === 'accepted' ? 'scheduled' : undefined,
    });
  };

  const handleUpdateStatus = (job: Job, newStatus: JobStatus) => {
    updateJob(job.id, { status: newStatus });

    if (newStatus === 'completed') {
      updateJob(job.id, { completedAt: new Date() });
      
      const salesUsers = users.filter(u => u.role === 'sales');
      salesUsers.forEach(sales => {
        addNotification({
          userId: sales.id,
          type: 'success',
          title: 'Job Completed',
          message: `Installation at ${job.customerName}'s place is complete`,
          read: false,
        });
      });
    }
  };

  const handleCompleteJob = () => {
    if (!selectedJob) return;

    updateJob(selectedJob.id, {
      status: 'completed',
      completedAt: new Date(),
      remarks: completionData.remarks,
      images: completionData.images ? completionData.images.split(',').map(i => i.trim()) : [],
    });

    const salesUsers = users.filter(u => u.role === 'sales');
    salesUsers.forEach(sales => {
      addNotification({
        userId: sales.id,
        type: 'success',
        title: 'Job Completed',
        message: `Job for ${selectedJob.customerName} has been completed`,
        read: false,
      });
    });

    setCompletionData({ remarks: '', images: '' });
    setShowCompleteModal(false);
  };

  const openDetailModal = (job: Job) => {
    setSelectedJob(job);
    setShowDetailModal(true);
  };

  const openCompleteModal = (job: Job) => {
    setSelectedJob(job);
    setCompletionData({ remarks: '', images: '' });
    setShowCompleteModal(true);
  };

  const getNextStatus = (currentStatus: JobStatus): JobStatus | null => {
    const workflow: Record<JobStatus, JobStatus | null> = {
      pending: 'accepted',
      accepted: 'scheduled',
      scheduled: 'out_for_delivery',
      out_for_delivery: 'delivered',
      delivered: 'completed',
      completed: null,
      rescheduled: 'accepted',
      cancelled: null,
    };
    return workflow[currentStatus];
  };

  const getStatusLabel = (status: JobStatus): string => {
    const labels: Record<JobStatus, string> = {
      pending: 'Pending',
      accepted: 'Accepted',
      scheduled: 'Scheduled',
      out_for_delivery: 'Out for Delivery',
      delivered: 'Delivered',
      completed: 'Completed',
      rescheduled: 'Rescheduled',
      cancelled: 'Cancelled',
    };
    return labels[status];
  };

  if (!hydrated || !user || !['service_head', 'field_staff', 'admin'].includes(user.role)) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Job Management</h1>
            <p className="text-[#A0A0B8] mt-1">Manage and track all service jobs</p>
          </div>
          {user.role === 'service_head' && (
            <Button onClick={() => setShowAddModal(true)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Job
            </Button>
          )}
        </div>

        <div className="flex gap-4">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'pending', label: 'Pending' },
              { value: 'accepted', label: 'Accepted' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'out_for_delivery', label: 'Out for Delivery' },
              { value: 'delivered', label: 'Delivered' },
              { value: 'completed', label: 'Completed' },
            ]}
            className="w-48"
          />
          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'service', label: 'Service' },
              { value: 'delivery', label: 'Delivery' },
              { value: 'installation', label: 'Installation' },
            ]}
            className="w-40"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job, idx) => (
            <Card 
              key={job.id} 
              className="animate-fadeIn"
              style={{ animationDelay: `${idx * 0.05}s` }}
              hover
              onClick={() => openDetailModal(job)}
            >
              <CardContent>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <Badge variant={getTypeBadge(job.type)}>{job.type}</Badge>
                    <Badge variant={getStatusBadge(job.status)}>{getStatusLabel(job.status)}</Badge>
                  </div>
                  <span className="text-xs text-[#6B6B80] font-mono">
                    #{job.id.slice(-4)}
                  </span>
                </div>
                
                <h3 className="text-white font-semibold mb-1">{job.customerName}</h3>
                <p className="text-sm text-[#A0A0B8] mb-2">{job.product}</p>
                
                <div className="space-y-1 text-sm text-[#A0A0B8]">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {job.customerPhone}
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="truncate">{job.address}</span>
                  </div>
                  {job.scheduledDate && (
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(job.scheduledDate).toLocaleDateString()}
                    </div>
                  )}
                </div>

                {job.assignedTo && (
                  <div className="mt-3 pt-3 border-t border-[#3A3A5C]">
                    <p className="text-xs text-[#6B6B80]">Assigned to</p>
                    <p className="text-sm text-white">{users.find(u => u.id === job.assignedTo)?.name}</p>
                  </div>
                )}

                {user.role === 'service_head' && job.status === 'pending' && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptJob(job);
                    }}
                  >
                    Accept Job
                  </Button>
                )}

                {job.status === 'delivered' && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      openCompleteModal(job);
                    }}
                  >
                    Complete Installation
                  </Button>
                )}

                {getNextStatus(job.status) && job.status !== 'pending' && job.status !== 'completed' && job.status !== 'cancelled' && (
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdateStatus(job, getNextStatus(job.status)!);
                    }}
                  >
                    Mark as {getStatusLabel(getNextStatus(job.status)!)}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <Card>
            <CardContent>
              <p className="text-center text-[#A0A0B8] py-8">No jobs found</p>
            </CardContent>
          </Card>
        )}

        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Job" size="lg">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Customer Name *"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              />
              <Input
                label="Phone Number *"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              />
            </div>
            <Input
              label="Address *"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Input
              label="Product"
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Job Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as JobType })}
                options={[
                  { value: 'service', label: 'Service' },
                  { value: 'delivery', label: 'Delivery' },
                  { value: 'installation', label: 'Installation' },
                ]}
              />
              <Input
                label="Scheduled Date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              />
            </div>
            <Select
              label="Assign To"
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              options={[
                { value: '', label: 'Unassigned' },
                ...fieldStaff.map(s => ({ value: s.id, label: s.name })),
              ]}
            />
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddJob} className="flex-1">
                Create Job
              </Button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Job Details" size="lg">
          {selectedJob && (
            <div className="space-y-4">
              <div className="p-4 bg-[#0F0F1A] rounded-lg">
                <div className="flex gap-2 mb-3">
                  <Badge variant={getTypeBadge(selectedJob.type)}>{selectedJob.type}</Badge>
                  <Badge variant={getStatusBadge(selectedJob.status)}>{getStatusLabel(selectedJob.status)}</Badge>
                </div>
                <h3 className="text-white font-semibold text-lg">{selectedJob.customerName}</h3>
                <p className="text-[#A0A0B8]">{selectedJob.product}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[#A0A0B8]">Phone</p>
                  <p className="text-white">{selectedJob.customerPhone}</p>
                </div>
                <div>
                  <p className="text-sm text-[#A0A0B8]">Source</p>
                  <p className="text-white capitalize">{selectedJob.source}</p>
                </div>
                <div>
                  <p className="text-sm text-[#A0A0B8]">Scheduled</p>
                  <p className="text-white">
                    {selectedJob.scheduledDate ? new Date(selectedJob.scheduledDate).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-[#A0A0B8]">Assigned To</p>
                  <p className="text-white">
                    {selectedJob.assignedTo ? users.find(u => u.id === selectedJob.assignedTo)?.name : 'Unassigned'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-[#A0A0B8]">Address</p>
                <p className="text-white">{selectedJob.address}</p>
              </div>

              {selectedJob.rescheduleReason && (
                <div className="p-3 bg-[#FFB830]/10 rounded-lg border border-[#FFB830]/30">
                  <p className="text-sm text-[#FFB830]">Reschedule Reason: {selectedJob.rescheduleReason}</p>
                </div>
              )}

              {selectedJob.remarks && (
                <div>
                  <p className="text-sm text-[#A0A0B8]">Remarks</p>
                  <p className="text-white">{selectedJob.remarks}</p>
                </div>
              )}

              {selectedJob.completedAt && (
                <div className="p-3 bg-[#00D9A5]/10 rounded-lg border border-[#00D9A5]/30">
                  <p className="text-sm text-[#00D9A5]">Completed: {new Date(selectedJob.completedAt).toLocaleString()}</p>
                </div>
              )}

              {user.role === 'service_head' && selectedJob.status === 'pending' && (
                <Button onClick={() => handleAcceptJob(selectedJob)} className="w-full">
                  Accept Job
                </Button>
              )}

              {user.role === 'service_head' && selectedJob.status === 'accepted' && (
                <div className="space-y-3">
                  <Select
                    label="Assign Manpower"
                    value={selectedJob.assignedTo || ''}
                    onChange={(e) => handleAssignManpower(selectedJob.id, e.target.value)}
                    options={[
                      { value: '', label: 'Unassigned' },
                      ...fieldStaff.map(s => ({ value: s.id, label: s.name })),
                    ]}
                  />
                  <div className="flex gap-3">
                    <Input
                      label="Reschedule Reason"
                      value={rescheduleData.reason}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                      placeholder="Reason for reschedule"
                    />
                    <Input
                      label="New Date"
                      type="date"
                      value={rescheduleData.newDate}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleRescheduleJob} variant="secondary" className="w-full">
                    Reschedule Job
                  </Button>
                </div>
              )}

              {selectedJob.status === 'delivered' && (
                <Button onClick={() => openCompleteModal(selectedJob)} className="w-full">
                  Complete Installation
                </Button>
              )}
            </div>
          )}
        </Modal>

        <Modal isOpen={showCompleteModal} onClose={() => setShowCompleteModal(false)} title="Complete Job">
          <div className="space-y-4">
            <p className="text-[#A0A0B8]">Complete the job for <span className="text-white font-medium">{selectedJob?.customerName}</span></p>
            
            <Textarea
              label="Site Images (comma-separated URLs)"
              value={completionData.images}
              onChange={(e) => setCompletionData({ ...completionData, images: e.target.value })}
              placeholder="image1.jpg, image2.jpg"
              rows={2}
            />
            
            <Textarea
              label="Completion Remarks"
              value={completionData.remarks}
              onChange={(e) => setCompletionData({ ...completionData, remarks: e.target.value })}
              placeholder="Describe the completed work..."
              rows={3}
            />

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCompleteModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCompleteJob} className="flex-1">
                Complete Job
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}
