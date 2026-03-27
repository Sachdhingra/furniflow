'use server';

import { db } from '@/db';
import { users, customers, jobs, notifications } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getUsers() {
  return await db.select().from(users).all();
}

export async function getUserById(id: string) {
  return await db.select().from(users).where(eq(users.id, id)).get();
}

export async function getUserByEmail(email: string) {
  return await db.select().from(users).where(eq(users.email, email)).get();
}

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  active?: boolean;
  passwordHash?: string;
}) {
  return await db.insert(users).values({
    ...data,
    active: data.active ?? true,
  }).run();
}

export async function updateUser(id: string, data: Partial<{
  name: string;
  email: string;
  phone: string;
  role: string;
  active: boolean;
  passwordHash: string;
}>) {
  return await db.update(users).set(data).where(eq(users.id, id)).run();
}

export async function deleteUser(id: string) {
  return await db.delete(users).where(eq(users.id, id)).run();
}

export async function getCustomers() {
  return await db.select().from(customers).orderBy(desc(customers.createdAt)).all();
}

export async function getCustomerById(id: string) {
  return await db.select().from(customers).where(eq(customers.id, id)).get();
}

export async function createCustomer(data: {
  id: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  inquiryDate: Date;
  expectedClosingDate?: Date | null;
  notes?: string;
  status?: string;
  followUpDate?: Date | null;
  createdBy: string;
}) {
  return await db.insert(customers).values({
    ...data,
    status: data.status ?? 'lead',
    notes: data.notes ?? '',
  }).run();
}

export async function updateCustomer(id: string, data: Partial<{
  name: string;
  phone: string;
  address: string;
  product: string;
  inquiryDate: Date;
  expectedClosingDate: Date | null;
  notes: string;
  status: string;
  followUpDate: Date | null;
}>) {
  return await db.update(customers).set({ ...data, updatedAt: new Date() }).where(eq(customers.id, id)).run();
}

export async function deleteCustomer(id: string) {
  return await db.delete(customers).where(eq(customers.id, id)).run();
}

export async function getJobs() {
  return await db.select().from(jobs).orderBy(desc(jobs.createdAt)).all();
}

export async function getJobById(id: string) {
  return await db.select().from(jobs).where(eq(jobs.id, id)).get();
}

export async function createJob(data: {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  product: string;
  type: string;
  status?: string;
  source: string;
  scheduledDate?: Date | null;
  assignedTo?: string | null;
  createdBy: string;
}) {
  return await db.insert(jobs).values({
    ...data,
    status: data.status ?? 'pending',
    images: '',
    remarks: '',
  }).run();
}

export async function updateJob(id: string, data: Partial<{
  customerId: string;
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
  images: string;
  remarks: string;
  completedAt: Date | null;
}>) {
  return await db.update(jobs).set({ ...data, updatedAt: new Date() }).where(eq(jobs.id, id)).run();
}

export async function deleteJob(id: string) {
  return await db.delete(jobs).where(eq(jobs.id, id)).run();
}

export async function getNotifications(userId: string) {
  return await db.select().from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .all();
}

export async function createNotification(data: {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
}) {
  return await db.insert(notifications).values(data).run();
}

export async function markNotificationRead(id: string) {
  return await db.update(notifications).set({ read: true }).where(eq(notifications.id, id)).run();
}
