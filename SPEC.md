# Furniture Company Business Management Application

## 1. Project Overview

**Project Name:** FurniFlow - Furniture Business Management System
**Project Type:** Web Application (Next.js)
**Core Functionality:** A workflow-driven business management application for a furniture company with role-based access for Sales Team, Service Team, and Admin, featuring automated reminders, status tracking, and notifications.
**Target Users:** Sales Representatives, Service Technicians, Service Managers, Administrators

---

## 2. UI/UX Specification

### Layout Structure

**Main Layout:**
- Collapsible sidebar navigation (280px expanded, 72px collapsed)
- Top header bar with user info, notifications, and role indicator
- Main content area with responsive grid
- Toast notification system (bottom-right)

**Page Sections:**
- Dashboard: Stats cards + recent activity feed
- Customer Management: List view with filters and search
- Job Management: Kanban-style board + list view
- Notifications: Dropdown panel with categorized alerts

**Responsive Breakpoints:**
- Mobile: < 768px (single column, bottom nav)
- Tablet: 768px - 1024px (collapsed sidebar)
- Desktop: > 1024px (full sidebar)

### Visual Design

**Color Palette:**
- Primary: `#1A1A2E` (Deep Navy)
- Secondary: `#16213E` (Dark Blue)
- Accent: `#E94560` (Coral Red)
- Success: `#00D9A5` (Mint Green)
- Warning: `#FFB830` (Amber)
- Info: `#4DA8DA` (Sky Blue)
- Background: `#0F0F1A` (Near Black)
- Surface: `#1E1E32` (Dark Surface)
- Surface Light: `#2A2A44` (Elevated Surface)
- Text Primary: `#FFFFFF`
- Text Secondary: `#A0A0B8`
- Border: `#3A3A5C`

**Typography:**
- Font Family: "DM Sans" (headings), "JetBrains Mono" (data/numbers)
- H1: 32px / 700 weight
- H2: 24px / 600 weight
- H3: 18px / 600 weight
- Body: 14px / 400 weight
- Small: 12px / 400 weight

**Spacing System:**
- Base unit: 4px
- XS: 4px, SM: 8px, MD: 16px, LG: 24px, XL: 32px, 2XL: 48px

**Visual Effects:**
- Card shadows: `0 4px 24px rgba(0, 0, 0, 0.4)`
- Hover lift: `translateY(-2px)` with shadow increase
- Glassmorphism on modals: `backdrop-filter: blur(12px)`
- Gradient accents: `linear-gradient(135deg, #E94560 0%, #FF6B6B 100%)`
- Border glow on focus: `0 0 0 2px rgba(233, 69, 96, 0.3)`

### Components

**Buttons:**
- Primary: Coral Red bg, white text, rounded-lg (8px)
- Secondary: Transparent with border, white text
- Ghost: No background, subtle hover
- States: hover (lighten 10%), active (darken 5%), disabled (50% opacity)

**Cards:**
- Background: Surface color
- Border: 1px solid Border color
- Border-radius: 12px
- Padding: 24px
- Hover: Border color transitions to Accent

**Form Inputs:**
- Background: #0F0F1A
- Border: 1px solid #3A3A5C
- Focus: Border + glow effect
- Border-radius: 8px
- Padding: 12px 16px

**Tables:**
- Striped rows (alternate Surface/Surface Light)
- Sticky header
- Row hover highlight
- Sortable columns with indicators

**Badges/Tags:**
- Status badges with color coding:
  - New: Info blue
  - Pending: Warning amber
  - In Progress: Accent coral
  - Completed: Success mint
  - Cancelled: Error red

**Modals:**
- Centered overlay with blur backdrop
- Max-width: 560px
- Slide-up animation on open

---

## 3. Functionality Specification

### User Roles & Authentication

**Roles:**
1. **Admin** - Full system access, user management, reports
2. **Sales Team** - Customer management, lead conversion, dispatch creation
3. **Service Head** - Job assignment, team management, workflow oversight
4. **Field Staff** - Job execution, status updates, completion reporting

**Authentication:**
- Login page with role selection (demo mode)
- Session-based auth with role stored in context
- Protected routes based on role

### Sales Team Features

**Customer Management:**
- Create/Edit/Delete customer records
- Fields:
  - Customer Name (required)
  - Phone Number (required)
  - Address (required)
  - Product Interested/Purchased
  - Inquiry Date (auto-set)
  - Expected Closing Date
  - Notes (textarea)
  - Status (Lead/Prospect/Confirmed/Closed)
  - Follow-up Date

**Lead Workflow:**
- Set follow-up dates with date picker
- Automatic daily reminder system (simulated with client-side check)
- Convert lead to confirmed order (one-click)
- Create Dispatch Request → triggers Service Team notification

**Notifications Received:**
- When Service accepts/reschedules delivery job
- When installation is completed

### Service Team Features

**Job Creation:**
- Manual entry: Incoming service calls
- Auto-generated: Dispatch requests from Sales

**Job Dashboard:**
- List view with filters:
  - Status (Pending/Accepted/Scheduled/In Progress/Delivered/Completed)
  - Type (Service/Delivery/Installation)
  - Date range
- Job Card shows:
  - Customer name + phone
  - Product details
  - Location/Address
  - Job type
  - Scheduled date/time
  - Assigned staff
  - Current status

**Job Actions:**
- Accept Job (for Service Head)
- Reschedule Job (with reason dropdown + new date picker)
- Assign Manpower (dropdown of available staff)

**Dispatch Workflow:**
- Status progression: Pending → Accepted → Scheduled → Out for Delivery → Delivered → Installed & Completed
- Each status change timestamps automatically

**Completion Requirements:**
- Upload site images (minimum 1 required) - simulated with file input
- Add completion remarks
- Auto-timestamp on completion

**Notifications Sent:**
- To Sales when job accepted
- To Sales when job rescheduled
- To Sales when job completed

### Admin Features

**Dashboard:**
- Overview stats: Total customers, pending jobs, completed today, revenue
- Activity feed
- Quick actions

**User Management:**
- View all users
- Role assignment
- Deactivate/Activate users

**Reports:**
- Sales performance
- Service completion rates
- Job status distribution

---

## 4. Data Models

### Customer
```
{
  id: string
  name: string
  phone: string
  address: string
  product: string
  inquiryDate: Date
  expectedClosingDate: Date | null
  notes: string
  status: 'lead' | 'prospect' | 'confirmed' | 'closed'
  followUpDate: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

### Job
```
{
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  address: string
  product: string
  type: 'service' | 'delivery' | 'installation'
  status: 'pending' | 'accepted' | 'scheduled' | 'out_for_delivery' | 'delivered' | 'completed' | 'rescheduled' | 'cancelled'
  source: 'manual' | 'dispatch'
  scheduledDate: Date | null
  assignedTo: string | null
  rescheduleReason: string | null
  images: string[]
  remarks: string
  completedAt: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

### Notification
```
{
  id: string
  userId: string
  type: 'info' | 'success' | 'warning' | 'alert'
  title: string
  message: string
  read: boolean
  createdAt: Date
}
```

### User
```
{
  id: string
  name: string
  role: 'admin' | 'sales' | 'service_head' | 'field_staff'
  email: string
  phone: string
  active: boolean
  createdAt: Date
}
```

---

## 5. Acceptance Criteria

### Authentication
- [ ] User can log in and select role
- [ ] Dashboard shows role-appropriate content
- [ ] Navigation changes based on role

### Sales Team
- [ ] Can create new customer with all required fields
- [ ] Can edit existing customer
- [ ] Can set follow-up date
- [ ] Sees reminder for overdue follow-ups
- [ ] Can convert lead to confirmed order
- [ ] Can create dispatch request from confirmed order
- [ ] Receives notifications from Service team

### Service Team
- [ ] Can view all pending jobs
- [ ] Can create manual service job
- [ ] Can accept job
- [ ] Can reschedule with reason
- [ ] Can assign manpower
- [ ] Can update status through workflow
- [ ] Can complete job with images and remarks
- [ ] Completion is timestamped
- [ ] Notifications sent to Sales

### Admin
- [ ] Can view dashboard with stats
- [ ] Can manage users
- [ ] Can view reports

### General
- [ ] Responsive on mobile/tablet/desktop
- [ ] Dark theme consistently applied
- [ ] Smooth animations and transitions
- [ ] No console errors
