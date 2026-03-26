# Active Context: FurniFlow - Furniture Business Management Application

## Current State

**Project Status**: ✅ Complete

The FurniFlow business management application has been built with all requested features. It's a Next.js 16 application with TypeScript, Tailwind CSS 4, SQLite database with Drizzle ORM for persistent data storage, and mobile PWA support.

## Recently Completed

- [x] Built FurniFlow business management application for furniture company
- [x] Implemented role-based authentication (Admin, Sales, Service Head, Field Staff)
- [x] Created Sales Team module with customer management, lead conversion, dispatch creation
- [x] Created Service Team module with job management, status workflow, completion tracking
- [x] Created Admin module with dashboard, user management, and reports
- [x] Implemented notifications system for cross-team communication
- [x] Built follow-up reminders and alerts
- [x] Added dark theme UI with custom design system
- [x] Added SQLite database with Drizzle ORM for persistent data storage
- [x] Added server actions for database CRUD operations
- [x] Added auto-seed to populate database on first load
- [x] Added mobile responsive layout with bottom navigation
- [x] Added PWA manifest for mobile app installation
- [x] Passed lint and typecheck, built successfully

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/page.tsx` | Main dashboard | ✅ Complete |
| `src/app/login/page.tsx` | Login with role selection | ✅ Complete |
| `src/app/sales/page.tsx` | Sales customer management | ✅ Complete |
| `src/app/service/page.tsx` | Service job management | ✅ Complete |
| `src/app/admin/page.tsx` | Admin dashboard & reports | ✅ Complete |
| `src/components/ui/` | Reusable UI components | ✅ Complete |
| `src/components/layout/` | App layout, sidebar, header | ✅ Complete |
| `src/contexts/` | Auth and Data providers | ✅ Complete |
| `src/types/` | TypeScript type definitions | ✅ Complete |
| `src/lib/data.ts` | Mock data | ✅ Complete |
| `src/db/` | Database schema, client, migrations | ✅ Complete |
| `SPEC.md` | Full specification | ✅ Complete |

## User Roles & Permissions

| Role | Access |
|------|--------|
| Admin | Dashboard, Users, Reports |
| Sales | Customers, Leads, Dispatch Creation |
| Service Head | Job Management, Staff Assignment |
| Field Staff | Job Execution, Status Updates |

## Quick Start Guide

### Run the application:

```bash
bun dev
```

### Access points:

- `/login` - Select role to login (demo mode)
- `/` - Dashboard (role-dependent content)
- `/sales` - Customer management (Sales/Admin)
- `/service` - Job management (Service/Admin)
- `/admin` - Admin panel (Admin only)

### Key Features:

1. **Sales Team**: Add customers, set follow-ups, convert leads to orders, create dispatch requests
2. **Service Team**: Accept jobs, reschedule, assign staff, update status, complete with images
3. **Notifications**: Real-time alerts between teams
4. **Admin**: View stats, manage users, generate reports

## Session History

| Date | Changes |
|------|---------|
| Initial | Template created with base setup |
| Latest | Built complete FurniFlow furniture business management application |
| Latest | Added SQLite database with Drizzle ORM for persistent data storage |
