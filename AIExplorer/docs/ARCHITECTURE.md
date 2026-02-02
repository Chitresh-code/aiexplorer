# Architecture Documentation

## Project Structure

```
AIExplorer/
├── app/                          # Next.js App Router
│   ├── api/                      # API route handlers
│   │   ├── usecases/            # Use case endpoints
│   │   ├── ai/                  # AI suggestion endpoints
│   │   └── ...
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   └── [route]/page.tsx         # Individual pages
│
├── components/                   # Reusable React components
│   ├── ui/                      # Shadcn UI components
│   ├── layout/                  # Layout components
│   ├── shared/                  # Shared components
│   ├── pages/                   # Full-page components
│   └── [feature]/               # Feature-specific components
│
├── features/                     # Feature modules (organized by feature)
│   ├── auth/                    # Authentication feature
│   ├── navigation/              # Navigation components
│   ├── champion/                # Champion dashboard feature
│   ├── gallery/                 # Gallery feature
│   └── dashboard/               # Dashboard components
│
├── hooks/                        # Custom React hooks
│   ├── use-usecases.ts         # Use cases data fetching
│   ├── use-navigate.ts         # Navigation helpers
│   └── ...
│
├── lib/                          # Utility functions and libraries
│   ├── api.ts                   # API client
│   ├── error-utils.ts           # Error handling
│   ├── validators.ts            # Input validation
│   ├── types/                   # TypeScript types
│   ├── mappers/                 # Data mappers
│   ├── azure-sql.ts             # Database connection
│   └── ...
│
├── config/                       # Configuration files
│   ├── constants.ts             # Centralized constants
│   ├── metric-suggestions.yaml  # Metric configuration
│   └── ...
│
├── public/                       # Static assets
│   ├── images/
│   └── ...
│
├── docs/                         # Documentation
│   ├── API.md                   # API documentation
│   ├── ARCHITECTURE.md          # This file
│   └── DEVELOPMENT.md           # Development guide
│
└── Configuration files
    ├── next.config.ts           # Next.js config
    ├── tsconfig.json            # TypeScript config
    ├── eslint.config.mjs        # ESLint rules
    ├── .prettierrc.json         # Code formatting
    └── tailwind.config.ts       # Tailwind CSS
```

## Design Patterns

### 1. Feature-Based Organization

Features are organized in the `features/` directory, each containing:
- Components specific to the feature
- Custom hooks for feature logic
- API client methods
- Type definitions

Example: `features/gallery/` contains all gallery-related code.

### 2. Layered Architecture

```
UI Layer (components/)
    ↓
Business Logic (hooks/ + lib/)
    ↓
Data Access (lib/api.ts)
    ↓
Backend API
```

### 3. Separation of Concerns

- **Components**: Presentation logic only
- **Hooks**: Business logic and data fetching
- **Lib**: Utilities and helpers
- **Config**: Centralized configuration

### 4. Type Safety

- Strong TypeScript types throughout
- Mapper functions for data transformation
- Validated inputs and outputs
- Type-safe constants

## Key Modules

### API Client (`lib/api.ts`)

Centralized API communication using Axios:
- Automatic base URL detection
- Request/response interceptors
- Error logging
- Type-safe endpoints

### Error Handling (`lib/error-utils.ts`)

Consistent error handling:
- Development: Full error details
- Production: User-friendly messages
- Structured error logging

### Validation (`lib/validators.ts`)

Input validation utilities:
- Email, URL, length validation
- Type guards
- String sanitization
- Comprehensive error reporting

### Constants (`config/constants.ts`)

Centralized configuration:
- API endpoints
- Route definitions
- Cache settings
- Feature flags
- Validation rules

## Data Flow

### Use Case Creation Flow

```
Form Component
    ↓ (validation)
Validators (lib/validators.ts)
    ↓ (valid data)
API Call (lib/api.ts)
    ↓ (POST /api/usecases)
Backend API
    ↓
Database
    ↓ (response)
Component State Update
    ↓
UI Refresh
```

### Data Fetching Flow

```
Component Mount / User Action
    ↓
Custom Hook (hooks/use-*.ts)
    ↓
Fetch Function (lib/api.ts)
    ↓
Backend API
    ↓
Data Mapper (lib/mappers/*.ts)
    ↓
Component State Update
    ↓
UI Render
```

## Component Architecture

### Smart Components (Containers)

Located in `features/` and `components/pages/`:
- Manage state
- Fetch data
- Handle business logic
- Pass data down to presentational components

Example:
```typescript
// features/gallery/components/GalleryContainer.tsx
export function GalleryContainer() {
  const { useCases, loading } = useUseCases();
  return <GalleryView data={useCases} loading={loading} />;
}
```

### Presentational Components

Located in `components/` and `components/shared/`:
- Receive data via props
- Focus on UI rendering
- Handle user interactions
- No data fetching

Example:
```typescript
// components/gallery/GalleryView.tsx
export function GalleryView({ data, loading }) {
  return <div>{/* render UI */}</div>;
}
```

## State Management

### Client State

- Local component state for UI state (open/closed, etc.)
- React hooks for simple state

### Server State

- Use case data fetched from API
- Cached appropriately per `CACHE_CONFIG`
- Refetched when needed

### No Global State Manager

- Keeps dependencies minimal
- Props drilling for shared state where needed
- Hooks for complex shared logic

## Database Architecture

### Connection

- Azure SQL Database via `mssql` package
- Connection pooling in `lib/azure-sql.ts`
- Request timeout: 30 seconds

### Data Access

- Stored procedures for data operations
- Parameterized queries to prevent SQL injection
- Type-safe data mappers

## Authentication

### Provider

- Azure AD (MSAL) for authentication
- Managed in `features/auth/`
- Protected routes via `ProtectedLayout`

### Session Management

- Browser session-based
- User info from MSAL `accounts` array

## Build and Deployment

### Development

```bash
npm run dev
```

Starts Next.js dev server with Turbopack.

### Production Build

```bash
npm run build
npm start
```

Optimizations:
- React Compiler enabled
- Tree-shaking
- Code splitting
- Image optimization

### Linting

```bash
npm run lint
```

Uses ESLint with Next.js and TypeScript configurations.

## Performance Optimizations

### Code Level

- React Compiler for automatic memoization
- Tree-shaking of unused code
- Dynamic imports for code splitting

### Image Optimization

- WebP and AVIF formats
- Responsive image sizing
- Lazy loading

### Caching Strategy

- HTTP cache headers per `CACHE_CONFIG`
- Stale-while-revalidate for data
- Browser caching for assets

## Security Considerations

### Code Level

- Input validation for all user inputs
- SQL injection prevention via parameterized queries
- XSS prevention via React's built-in escaping
- Environment variables for sensitive data

### HTTP Level

- Security headers (CSP, X-Frame-Options, etc.)
- HTTPS in production
- CORS configuration

### Authentication

- Azure AD integration
- Secure session handling
- Protected route middleware

## Testing Strategy

### Unit Tests

- Component rendering
- Hook behavior
- Utility functions
- Validators

### Integration Tests

- API communication
- Form submission
- Data flow

### E2E Tests

- User workflows
- Critical paths
- Cross-browser testing

## Future Improvements

1. **State Management**: Consider Zustand or Jotai for complex shared state
2. **API Caching**: Implement React Query for advanced caching
3. **Error Boundaries**: Add error boundary components
4. **Monitoring**: Integrate error tracking (Sentry)
5. **Analytics**: Add usage analytics
6. **Testing**: Increase test coverage (unit, integration, E2E)
7. **Accessibility**: Enhance WCAG compliance
8. **Performance**: Monitor Core Web Vitals
