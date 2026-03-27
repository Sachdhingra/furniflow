export type UserRole = 'admin' | 'sales' | 'service_head' | 'field_staff';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  active: boolean;
  createdAt: Date;
}

export type CustomerStatus = 'lead' | 'prospect' | 'confirmed' | 'closed';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  inquiryDate: Date;
  expectedClosingDate: Date | null;
  notes: string;
  status: CustomerStatus;
  followUpDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JobType = 'service' | 'delivery' | 'installation';
export type JobStatus = 'pending' | 'accepted' | 'scheduled' | 'out_for_delivery' | 'delivered' | 'completed' | 'rescheduled' | 'cancelled';
export type JobSource = 'manual' | 'dispatch';

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  product: string;
  type: JobType;
  status: JobStatus;
  source: JobSource;
  scheduledDate: Date | null;
  assignedTo: string | null;
  rescheduleReason: string | null;
  images: string[];
  remarks: string;
  completedAt: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'alert';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}
