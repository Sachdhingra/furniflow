'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Customer, Job, Notification, CustomerStatus, JobStatus } from '@/types';
import { getInitialData, getUserNotifications } from '@/app/actions/data';
import { createCustomer, updateCustomer as dbUpdateCustomer, deleteCustomer as dbDeleteCustomer, createJob, updateJob as dbUpdateJob, deleteJob as dbDeleteJob, createNotification, markNotificationRead as dbMarkNotificationRead } from '@/app/actions/db';
import { mockUsers } from '@/lib/data';

interface DbUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  createdAt: Date | null;
}

interface DbCustomer {
  id: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  inquiryDate: Date | null;
  expectedClosingDate: Date | null;
  notes: string | null;
  status: string;
  followUpDate: Date | null;
  createdBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface DbJob {
  id: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  address: string;
  product: string;
  type: string;
  status: string;
  source: string;
  scheduledDate: Date | null;
  assignedTo: string | null;
  rescheduleReason: string | null;
  images: string | null;
  remarks: string | null;
  completedAt: Date | null;
  createdBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface DataContextType {
  customers: Customer[];
  jobs: Job[];
  notifications: Notification[];
  users: typeof mockUsers;
  loading: boolean;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCustomer: (id: string, updates: Partial<Customer>) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateJob: (id: string, updates: Partial<Job>) => Promise<void>;
  deleteJob: (id: string) => Promise<void>;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearNotifications: () => void;
  
  getJobsByStatus: (status: JobStatus) => Job[];
  getCustomersByStatus: (status: CustomerStatus) => Customer[];
  getNotificationsForUser: (userId: string) => Notification[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function convertDbCustomer(c: DbCustomer): Customer {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    address: c.address,
    product: c.product,
    inquiryDate: c.inquiryDate ? new Date(c.inquiryDate) : new Date(),
    expectedClosingDate: c.expectedClosingDate ? new Date(c.expectedClosingDate) : null,
    notes: c.notes || '',
    status: c.status as CustomerStatus,
    followUpDate: c.followUpDate ? new Date(c.followUpDate) : null,
    createdBy: c.createdBy || '',
    createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
    updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
  };
}

function convertDbJob(j: DbJob): Job {
  return {
    id: j.id,
    customerId: j.customerId || '',
    customerName: j.customerName,
    customerPhone: j.customerPhone,
    address: j.address,
    product: j.product,
    type: j.type as Job['type'],
    status: j.status as Job['status'],
    source: j.source as Job['source'],
    scheduledDate: j.scheduledDate ? new Date(j.scheduledDate) : null,
    assignedTo: j.assignedTo,
    rescheduleReason: j.rescheduleReason,
    images: j.images ? j.images.split(',').filter(Boolean) : [],
    remarks: j.remarks || '',
    completedAt: j.completedAt ? new Date(j.completedAt) : null,
    createdBy: j.createdBy || '',
    createdAt: j.createdAt ? new Date(j.createdAt) : new Date(),
    updatedAt: j.updatedAt ? new Date(j.updatedAt) : new Date(),
  };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const refreshData = useCallback(async () => {
    try {
      const data = await getInitialData();
      setCustomers(data.customers.map(convertDbCustomer));
      setJobs(data.jobs.map(convertDbJob));
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }, []);

  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!initialized) {
      refreshData().then(() => setInitialized(true)); // eslint-disable-line react-hooks/set-state-in-effect
    }
  }, [refreshData, initialized]);

  const loading = !initialized;

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    await createCustomer({
      id,
      ...customer,
    });
    await refreshData();
  }, [refreshData]);

  const updateCustomer = useCallback(async (id: string, updates: Partial<Customer>) => {
    await dbUpdateCustomer(id, {
      name: updates.name,
      phone: updates.phone,
      address: updates.address,
      product: updates.product,
      inquiryDate: updates.inquiryDate,
      expectedClosingDate: updates.expectedClosingDate,
      notes: updates.notes,
      status: updates.status,
      followUpDate: updates.followUpDate,
    });
    await refreshData();
  }, [refreshData]);

  const deleteCustomer = useCallback(async (id: string) => {
    await dbDeleteCustomer(id);
    await refreshData();
  }, [refreshData]);

  const addJob = useCallback(async (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = generateId();
    await createJob({
      id,
      ...job,
    });
    await refreshData();
  }, [refreshData]);

  const updateJob = useCallback(async (id: string, updates: Partial<Job>) => {
    await dbUpdateJob(id, {
      customerId: updates.customerId,
      customerName: updates.customerName,
      customerPhone: updates.customerPhone,
      address: updates.address,
      product: updates.product,
      type: updates.type,
      status: updates.status,
      source: updates.source,
      scheduledDate: updates.scheduledDate,
      assignedTo: updates.assignedTo,
      rescheduleReason: updates.rescheduleReason,
      images: Array.isArray(updates.images) ? updates.images.join(',') : updates.images,
      remarks: updates.remarks,
      completedAt: updates.completedAt,
    });
    await refreshData();
  }, [refreshData]);

  const deleteJob = useCallback(async (id: string) => {
    await dbDeleteJob(id);
    await refreshData();
  }, [refreshData]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const id = generateId();
    await createNotification({
      id,
      ...notification,
    });
    await refreshData();
  }, [refreshData]);

  const markNotificationRead = useCallback(async (id: string) => {
    await dbMarkNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const getJobsByStatus = useCallback((status: JobStatus) => {
    return jobs.filter(j => j.status === status);
  }, [jobs]);

  const getCustomersByStatus = useCallback((status: CustomerStatus) => {
    return customers.filter(c => c.status === status);
  }, [customers]);

  const getNotificationsForUser = useCallback((userId: string) => {
    return notifications.filter(n => n.userId === userId);
  }, [notifications]);

  return (
    <DataContext.Provider value={{
      customers,
      jobs,
      notifications,
      users: mockUsers,
      loading,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addJob,
      updateJob,
      deleteJob,
      addNotification,
      markNotificationRead,
      clearNotifications,
      getJobsByStatus,
      getCustomersByStatus,
      getNotificationsForUser,
      refreshData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
