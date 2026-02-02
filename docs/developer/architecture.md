# System Architecture - AIExplorer

Comprehensive overview of AIExplorer's system architecture with diagrams and explanations.

## Table of Contents

1. [High-Level Architecture](#high-level-architecture)
2. [Data Flow](#data-flow)
3. [Component Architecture](#component-architecture)
4. [API Architecture](#api-architecture)
5. [Database Design](#database-design)
6. [Authentication & Security](#authentication--security)
7. [Deployment Architecture](#deployment-architecture)

## High-Level Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                   │
│              (Next.js Client Components)                │
│    - React Components                                   │
│    - User Interface                                     │
│    - Client-side State Management                       │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/JSON
                   │
┌──────────────────▼──────────────────────────────────────┐
│                   Application Layer                     │
│              (Next.js API Routes)                       │
│    - Business Logic                                     │
│    - Request Processing                                │
│    - Error Handling                                     │
│    - Authentication                                    │
└──────────────────┬──────────────────────────────────────┘
                   │ SQL
                   │
┌──────────────────▼──────────────────────────────────────┐
│                     Data Layer                          │
│            (Azure SQL Database)                         │
│    - Tables                                            │
│    - Stored Procedures                                 │
│    - Views                                             │
│    - Relationships                                     │
└─────────────────────────────────────────────────────────┘
```

### Technology Mapping

```
┌──────────────────┐
│   Azure AD       │ (Authentication)
│   MSAL           │
└────────┬─────────┘
         │
┌────────▼──────────────────────────────────────┐
│        Browser / Client Device                │
│  ┌────────────────────────────────────────┐   │
│  │  Next.js Application                  │   │
│  │  ├─ React Components                  │   │
│  │  ├─ Tailwind CSS Styling              │   │
│  │  └─ Shadcn UI Components              │   │
│  └────────────────────────────────────────┘   │
└────────┬───────────────────────────────────────┘
         │ HTTPS
         │
┌────────▼──────────────────────────────────────┐
│    Next.js Server (Node.js Runtime)           │
│  ┌────────────────────────────────────────┐   │
│  │  API Routes (/api/*)                  │   │
│  │  ├─ Business Logic                    │   │
│  │  ├─ Database Operations               │   │
│  │  └─ Error Handling                    │   │
│  └────────────────────────────────────────┘   │
└────────┬───────────────────────────────────────┘
         │ TLS
         │
┌────────▼──────────────────────────────────────┐
│     Azure SQL Database                        │
│  ├─ Data Storage                             │
│  ├─ Business Rules                           │
│  └─ Transactional Integrity                  │
└──────────────────────────────────────────────┘
```

## Data Flow

### Typical Request Flow

```
1. User Action
   └─> Click button / Submit form
       │
2. Client-side Handler
   └─> React event handler
       │
3. API Request
   └─> axios.post("/api/usecases", data)
       │
4. Next.js Route Handler
   └─> /app/api/usecases/route.ts
       │
5. Validation
   └─> Check inputs, authentication
       │
6. Business Logic
   └─> Process request, apply rules
       │
7. Database Query
   └─> Execute stored procedure
       │
8. Database Response
   └─> Return data or confirm action
       │
9. API Response
   └─> Return JSON to client
       │
10. Client Update
    └─> Update state, UI re-renders
```

### Use Case Submission Flow

```
User Submits Form
    │
    ▼
Client-side Validation
    │
    ├─ Check required fields
    ├─ Validate email format
    └─ Validate file sizes
    │
    ▼
POST /api/usecases
    │
    ▼
Server Validation
    │
    ├─ Re-validate all inputs
    ├─ Sanitize strings
    └─ Check file integrity
    │
    ▼
Authentication Check
    │
    └─ Verify user logged in
    │
    ▼
Permission Check
    │
    └─ Verify user can submit
    │
    ▼
Database Insert
    │
    └─> INSERT INTO UseCases (...)
    │
    ▼
Success Response
    │
    ├─ Return created use case ID
    ├─ Send confirmation email
    └─ Update client UI
```

## Component Architecture

### Component Hierarchy

```
App Layout
  ├─ Header
  │  ├─ Logo
  │  ├─ Search Bar
  │  ├─ Notifications
  │  └─ User Menu
  │
  ├─ Sidebar
  │  ├─ Navigation Links
  │  ├─ Dashboard
  │  ├─ Gallery
  │  ├─ Projects
  │  └─ Reports
  │
  └─ Main Content
     ├─ Dashboard Page
     │  ├─ Welcome Banner
     │  ├─ Projects Widget
     │  ├─ Activity Feed
     │  └─ Metrics Panel
     │
     ├─ Gallery Page
     │  ├─ Search & Filter
     │  ├─ Use Case Cards
     │  └─ Pagination
     │
     ├─ Projects Page
     │  ├─ Project List
     │  ├─ Project Details
     │  ├─ Team Panel
     │  └─ Timeline View
     │
     └─ Submit Page
        ├─ Form Section
        ├─ Preview
        └─ Submit Button
```

### Smart vs Presentational Components

**Smart Components** (Container)
- Connected to state/API
- Handle business logic
- Manage data fetching
- Pass data to presentational components

Example:
```typescript
// features/gallery/GalleryPage.tsx
export function GalleryPage() {
  const { useCases, loading } = useUseCases();
  return <GalleryView useCases={useCases} loading={loading} />;
}
```

**Presentational Components** (Dumb)
- Receive all data via props
- No side effects
- No data fetching
- Focus on UI rendering

Example:
```typescript
// components/gallery/GalleryView.tsx
interface GalleryViewProps {
  useCases: UseCase[];
  loading: boolean;
}
export function GalleryView({ useCases, loading }: GalleryViewProps) {
  return <div>/* render UI */</div>;
}
```

## API Architecture

### API Route Structure

```
/app/api/
├── usecases/
│   ├── route.ts              (GET list, POST create)
│   ├── [id]/
│   │   ├── route.ts          (GET detail, PUT update)
│   │   ├── info/route.ts      (PATCH info)
│   │   └── status/route.ts    (PATCH status)
│   └── search/route.ts       (GET search)
├── projects/
│   ├── route.ts              (GET list, POST create)
│   └── [id]/route.ts         (GET, PUT, DELETE)
├── auth/
│   ├── me/route.ts           (GET current user)
│   └── logout/route.ts       (POST logout)
└── health/route.ts           (GET health check)
```

### API Response Pattern

All responses follow consistent pattern:

```typescript
// Success Response
{
  success: true,
  data: { /* response data */ },
  timestamp: "2025-02-02T10:30:00Z"
}

// Error Response
{
  success: false,
  error: "VALIDATION_ERROR",
  message: "Invalid input provided",
  details: { /* field-specific errors */ },
  timestamp: "2025-02-02T10:30:00Z"
}
```

### Authentication Flow

```
Client Request
    │
    ▼
Check Authorization Header
    │
    ├─ Valid Token
    │   └─ Extract user ID
    │
    └─ Invalid/Missing
        └─ Return 401 Unauthorized
        │
    ▼
Verify Token with Azure AD
    │
    ├─ Valid
    │   └─ Attach user to request
    │
    └─ Invalid
        └─ Return 403 Forbidden
        │
    ▼
Process Request
```

## Database Design

### Core Tables

```sql
-- UseCases Table
UseCases
├─ ID (PK)
├─ Title
├─ Description
├─ Category
├─ Status
├─ CreatedBy (FK: Users)
├─ CreatedAt
├─ UpdatedAt

-- Projects Table
Projects
├─ ID (PK)
├─ UseCaseID (FK: UseCases)
├─ Title
├─ Status
├─ StartDate
├─ TargetEndDate
├─ Budget
├─ Owner (FK: Users)

-- ProjectTeam Table
ProjectTeam
├─ ID (PK)
├─ ProjectID (FK: Projects)
├─ UserID (FK: Users)
├─ Role
├─ JoinedAt

-- Milestones Table
Milestones
├─ ID (PK)
├─ ProjectID (FK: Projects)
├─ Title
├─ TargetDate
├─ Status
├─ Completed

-- Activity Table
Activity
├─ ID (PK)
├─ ProjectID (FK: Projects)
├─ UserID (FK: Users)
├─ ActivityType
├─ Description
├─ CreatedAt
```

### Relationships

```
Users
  ├─ 1:N → UseCases (creator)
  ├─ 1:N → Projects (owner)
  └─ 1:N → ProjectTeam (member)

UseCases
  ├─ 1:N → Projects (implementation)
  └─ 1:N → Activity (tracking)

Projects
  ├─ 1:N → ProjectTeam (members)
  ├─ 1:N → Milestones (tracking)
  └─ 1:N → Activity (log)

Milestones
  └─ N:1 → Projects
```

## Authentication & Security

### Authentication Flow

```
Azure AD
    │
    ▼
MSAL (Browser)
    │
    ├─ User Login
    ├─ Token Request
    └─ Token Storage
    │
    ▼
Next.js API
    │
    ├─ Verify Token
    ├─ Check Permissions
    └─ Return User Info
    │
    ▼
Protected Resources
```

### Security Layers

1. **Client Layer**
   - Input validation
   - HTTPS enforcement
   - Secure token storage

2. **API Layer**
   - Authentication verification
   - Authorization checks
   - CORS configuration
   - Rate limiting

3. **Database Layer**
   - Parameterized queries (prevent SQL injection)
   - Role-based access (RLS if available)
   - Audit logging

### Credentials & Secrets

```
Environment Variables (Never commit)
├─ MSAL_CLIENT_ID
├─ MSAL_AUTHORITY
├─ DB_CONNECTION_STRING
└─ API_KEYS

Managed By
└─ .env.local (local development)
└─ Vercel Secrets (production)
```

## Deployment Architecture

### Development Environment

```
Developer Machine
    │
    ├─ npm run dev
    │   └─ Next.js Dev Server
    │       ├─ Port 3000
    │       ├─ Hot Reload
    │       └─ Local Database
    │
    └─ Code Changes
        └─ Automatic Reload
```

### Production Environment

```
GitHub Repository
    │
    ▼
GitHub Actions (or Vercel)
    │
    ├─ Run Tests
    ├─ Build Production
    └─ Run Linting
    │
    ▼
Vercel / Cloud Platform
    │
    ├─ Deploy Node.js App
    ├─ Environment Variables
    └─ CDN / Caching
    │
    ▼
Azure SQL Database
    │
    └─ Persistent Data
```

### Scaling Considerations

```
Current Architecture (Single Region)
└─ Single Next.js instance
   └─ Connection pooling
   └─ Database indexes
   └─ Client-side caching

Future: Multi-Region (if needed)
├─ Load Balancing
├─ Database Replication
├─ CDN Distribution
└─ Geo-routing
```

---

**Related**: [Component Patterns](./component-patterns.md) | [API Reference](./api-reference.md) | [Database Schema](./database-schema.md)
