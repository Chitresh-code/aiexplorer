# API Reference - AIExplorer

Complete reference for all API endpoints and usage patterns.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL & Format](#base-url--format)
4. [Use Cases Endpoints](#use-cases-endpoints)
5. [Projects Endpoints](#projects-endpoints)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)

## Overview

AIExplorer API is built on Next.js API Routes and follows RESTful principles. All endpoints require authentication and return JSON responses.

### API Client

Use the centralized API client from `lib/api.ts`:

```typescript
import { fetchUseCases, createUseCase } from '@/lib/api';

// Fetch use cases
const useCases = await fetchUseCases();

// Create use case
const newUseCase = await createUseCase({
  title: 'My Use Case',
  // ... other fields
});
```

## Authentication

### Token-Based Authentication

All requests require an Authorization header:

```
Authorization: Bearer <access_token>
```

### Getting a Token

Tokens are automatically managed by MSAL:

```typescript
import { useMsal } from '@azure/msal-react';

function MyComponent() {
  const { instance, accounts } = useMsal();
  
  // Get token
  const tokenRequest = {
    scopes: ['api://your-app/.default'],
    account: accounts[0],
  };
  
  const { accessToken } = await instance.acquireTokenSilent(tokenRequest);
  // Token is automatically included in all API calls
}
```

### Session Management

- Tokens expire after 1 hour
- Automatic refresh on re-authentication
- Silent refresh happens in background
- Logout clears all tokens

## Base URL & Format

### Base URL

```
Development:  http://localhost:3000
Production:   https://aiexplorer.yourcompany.com
```

### Request Format

All requests use JSON:

```
Content-Type: application/json
Accept: application/json
```

### Response Format

All responses follow consistent format:

```json
{
  "success": true,
  "data": { /* response data */ },
  "timestamp": "2025-02-02T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": { /* additional context */ },
  "timestamp": "2025-02-02T10:30:00Z"
}
```

## Use Cases Endpoints

### GET /api/usecases

**Description**: Fetch list of use cases

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `view` | string | 'list' (summary) or 'full' (detailed) |
| `category` | string | Filter by category |
| `status` | string | Filter by status |
| `page` | number | Pagination page (1-based) |
| `limit` | number | Items per page (default: 20) |

**Example Request**:
```
GET /api/usecases?view=list&category=automation&page=1&limit=10
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123",
        "title": "Automated Invoice Processing",
        "category": "Process Automation",
        "status": "Active",
        "createdAt": "2025-01-01T10:00:00Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 10
  }
}
```

### GET /api/usecases/:id

**Description**: Fetch single use case details

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Use case ID |

**Example Request**:
```
GET /api/usecases/123
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Automated Invoice Processing",
    "description": "Use AI to process invoices...",
    "category": "Process Automation",
    "status": "Active",
    "businessOwner": "john@company.com",
    "successMetrics": ["Process time reduced by 50%"],
    "team": [
      {
        "email": "jane@company.com",
        "role": "Developer"
      }
    ],
    "createdAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-15T14:30:00Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "NOT_FOUND",
  "message": "Use case not found",
  "timestamp": "2025-02-02T10:30:00Z"
}
```

### POST /api/usecases

**Description**: Create new use case

**Request Body**:
```json
{
  "title": "Use case title",
  "category": "Process Automation",
  "department": "Finance",
  "problemStatement": "Current process takes too long...",
  "opportunity": "AI can automate this process...",
  "successMetrics": ["Reduce time by 50%"],
  "businessOwner": "owner@company.com",
  "estimatedBudget": 50000,
  "timeline": "3-4 months"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "456",
    "title": "Use case title",
    "category": "Process Automation",
    "status": "Submitted",
    "createdAt": "2025-02-02T10:30:00Z"
  }
}
```

**Error Response** (400):
```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Validation failed",
  "details": {
    "title": "Title is required",
    "problemStatement": "Problem statement must be at least 50 characters"
  }
}
```

### PATCH /api/usecases/:id/info

**Description**: Update use case information

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Use case ID |

**Request Body** (all optional):
```json
{
  "title": "Updated title",
  "problemStatement": "Updated problem...",
  "opportunity": "Updated opportunity...",
  "businessValue": "Updated business value...",
  "editorEmail": "editor@company.com"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "123",
    "title": "Updated title",
    "updatedAt": "2025-02-02T11:00:00Z"
  }
}
```

### PUT /api/usecases/:id

**Description**: Update use case completely

**Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | Use case ID |

**Request Body**: Full use case object

**Success Response** (200):
```json
{
  "success": true,
  "data": { /* updated use case */ }
}
```

## Projects Endpoints

### GET /api/projects

**Description**: Fetch list of projects

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status (Planning, In Progress, Testing, Deployed) |
| `owner` | string | Filter by owner email |
| `page` | number | Pagination page |

**Example Request**:
```
GET /api/projects?status=In%20Progress&page=1
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "proj_001",
        "title": "Invoice Processing Implementation",
        "status": "In Progress",
        "progress": 65,
        "owner": "john@company.com",
        "startDate": "2025-01-01",
        "targetEndDate": "2025-03-31"
      }
    ],
    "total": 12,
    "page": 1
  }
}
```

### GET /api/projects/:id

**Description**: Fetch project details

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "proj_001",
    "title": "Invoice Processing Implementation",
    "description": "Implementation of automated invoice processing",
    "status": "In Progress",
    "progress": 65,
    "owner": "john@company.com",
    "budget": 150000,
    "spent": 97500,
    "startDate": "2025-01-01",
    "targetEndDate": "2025-03-31",
    "team": [
      {
        "email": "jane@company.com",
        "role": "Developer",
        "joinedAt": "2025-01-01"
      }
    ],
    "milestones": [
      {
        "id": "m_001",
        "title": "Requirements Complete",
        "targetDate": "2025-01-31",
        "completed": true
      }
    ]
  }
}
```

### POST /api/projects

**Description**: Create new project

**Request Body**:
```json
{
  "useCaseId": "123",
  "title": "Project title",
  "description": "Project description",
  "owner": "owner@company.com",
  "budget": 100000,
  "startDate": "2025-02-01",
  "targetEndDate": "2025-05-31"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "proj_002",
    "title": "Project title",
    "status": "Planning",
    "createdAt": "2025-02-02T10:30:00Z"
  }
}
```

## Error Handling

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Authenticated but not authorized |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists |
| `INTERNAL_ERROR` | 500 | Server-side error |

### Error Response Example

```json
{
  "success": false,
  "error": "VALIDATION_ERROR",
  "message": "Invalid request data",
  "details": {
    "email": "Invalid email format",
    "title": "Title is required"
  },
  "timestamp": "2025-02-02T10:30:00Z"
}
```

### Handling Errors in Code

```typescript
try {
  const useCase = await fetchUseCase(id);
  // Process useCase
} catch (error) {
  if (error.response?.status === 404) {
    console.error('Use case not found');
  } else if (error.response?.status === 401) {
    console.error('Not authenticated');
  } else {
    console.error('Error:', error.message);
  }
}
```

## Rate Limiting

### Rate Limits

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **Burst limit**: 50 requests per minute

### Rate Limit Headers

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

### Handling Rate Limits

```typescript
if (error.response?.status === 429) {
  const resetTime = error.response.headers['x-ratelimit-reset'];
  console.warn(`Rate limited. Reset at: ${resetTime}`);
  // Wait before retrying
}
```

## Pagination

### Offset-Based Pagination

```
GET /api/usecases?page=2&limit=20
```

**Response includes**:
```json
{
  "data": { /* items */ },
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

### Cursor-Based Pagination

For large datasets:
```
GET /api/usecases?cursor=abc123&limit=20
```

---

**Related**: [Architecture](./architecture.md) | [Development Guide](./development-guide.md) | [Error Handling](./error-handling.md)
