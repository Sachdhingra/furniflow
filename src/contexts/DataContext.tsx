'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Customer, Job, Notification, CustomerStatus, JobStatus, JobType, JobSource } from '@/types';
import { mockCustomers, mockJobs, mockNotifications, mockUsers } from '@/lib/data';

interface DataContextType {
  customers: Customer[];
  jobs: Job[];
  notifications: Notification[];
  users: typeof mockUsers;
  
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  getJobsByStatus: (status: JobStatus) => Job[];
  getCustomersByStatus: (status: CustomerStatus) => Customer[];
  getNotificationsForUser: (userId: string) => Notification[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);

  const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addCustomer = useCallback((customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCustomers(prev => [...prev, newCustomer]);
  }, []);

  const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    ));
  }, []);

  const deleteCustomer = useCallback((id: string) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  }, []);

  const addJob = useCallback((job: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newJob: Job = {
      ...job,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setJobs(prev => [...prev, newJob]);
  }, []);

  const updateJob = useCallback((id: string, updates: Partial<Job>) => {
    setJobs(prev => prev.map(j => 
      j.id === id ? { ...j, ...updates, updatedAt: new Date() } : j
    ));
  }, []);

  const deleteJob = useCallback((id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      createdAt: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
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
