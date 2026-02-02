# Developer Guide - AIExplorer

Welcome to the developer documentation for AIExplorer. This section provides technical documentation for working with the codebase.

## Documentation Index

### Getting Started
- [Setup & Installation](./setup.md) - Development environment setup
- [Project Structure](./project-structure.md) - Codebase organization

### Architecture & Design
- [System Architecture](./architecture.md) - High-level system design with diagrams
- [Component Patterns](./component-patterns.md) - React component best practices
- [Database Schema](./database-schema.md) - Data models and relationships

### API & Integration
- [API Reference](./api-reference.md) - Complete API documentation
- [Authentication](./authentication.md) - Azure AD integration and session management
- [Error Handling](./error-handling.md) - Error patterns and recovery

### Development
- [Development Guide](./development-guide.md) - Coding standards and practices
- [Testing](./testing.md) - Unit, integration, and e2e testing
- [Deployment](./deployment.md) - Build and deployment procedures

### Advanced Topics
- [Performance Optimization](./performance.md) - Caching, optimization techniques
- [Security Practices](./security.md) - Security considerations and best practices
- [Contributing](./contributing.md) - How to contribute to the project

## Quick Navigation

### For New Developers
1. Start with [Setup & Installation](./setup.md)
2. Learn the [Project Structure](./project-structure.md)
3. Review [Component Patterns](./component-patterns.md)
4. Read the [Development Guide](./development-guide.md)

### Common Tasks
- **Starting development**: [Setup & Installation](./setup.md)
- **Adding a feature**: [Component Patterns](./component-patterns.md) + [Development Guide](./development-guide.md)
- **Working with API**: [API Reference](./api-reference.md)
- **Deploying code**: [Deployment](./deployment.md)
- **Understanding the system**: [System Architecture](./architecture.md)

### Troubleshooting
- **Build issues**: See deployment and setup guides
- **API errors**: Check [API Reference](./api-reference.md) and [Error Handling](./error-handling.md)
- **Performance**: Review [Performance Optimization](./performance.md)
- **Security concerns**: See [Security Practices](./security.md)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 with App Router |
| **Language** | TypeScript (strict mode) |
| **UI Framework** | Shadcn UI + Tailwind CSS |
| **State Management** | React hooks, SWR for data fetching |
| **Authentication** | Azure AD (MSAL) |
| **Database** | Azure SQL Database |
| **API Client** | Axios with interceptors |
| **Build Tool** | Turbopack |
| **Code Quality** | ESLint, Prettier, TypeScript |

## Architecture Overview

```
┌─────────────────────────────────────┐
│     Client (Next.js App)            │
│  ┌──────────────────────────────┐   │
│  │ Pages / Layouts              │   │
│  │ React Components             │   │
│  │ Custom Hooks                 │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
         HTTP/JSON
               │
┌──────────────▼──────────────────────┐
│   API Routes (Next.js)              │
│  ┌──────────────────────────────┐   │
│  │ Authentication               │   │
│  │ Business Logic               │   │
│  │ Error Handling               │   │
│  └──────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
      SQL Queries
               │
┌──────────────▼──────────────────────┐
│   Azure SQL Database                │
│  ┌──────────────────────────────┐   │
│  │ Tables                       │   │
│  │ Stored Procedures            │   │
│  │ Views                        │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

See [System Architecture](./architecture.md) for detailed diagrams.

## Key Principles

### 1. Type Safety
- Strict TypeScript configuration
- No implicit any
- Comprehensive type definitions
- Runtime validation

### 2. Component Modularity
- Single responsibility principle
- Clear prop interfaces
- Reusable components
- Isolated concerns

### 3. API Consistency
- Centralized API client
- Consistent error handling
- Request/response logging
- Type-safe endpoints

### 4. Code Quality
- ESLint rules enforced
- Prettier formatting
- Comments and documentation
- Meaningful test coverage

### 5. Security
- Input validation
- SQL injection prevention
- CSRF protection
- Secure session management

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Code Quality

```bash
# Run all validations
npm run validate

# Fix issues automatically
npm run validate:fix
```

### Before Committing

```bash
# Ensure code passes all checks
npm run validate

# Build for production
npm run build
```

### Deployment

```bash
# Build and deploy to production
# See deployment guide for details
```

## Best Practices

### Code Organization
- Keep files focused and small
- Use consistent naming conventions
- Group related functionality
- Document complex logic

### Component Design
- Props should be clear and typed
- Use composition over inheritance
- Keep state close to where it's used
- Separate smart and presentational components

### API Integration
- Use centralized API client
- Always validate inputs
- Handle errors gracefully
- Log appropriately

### Performance
- Use lazy loading for components
- Implement caching where appropriate
- Optimize re-renders
- Monitor bundle size

### Testing
- Unit test business logic
- Integration test API interactions
- Test user workflows
- Maintain >80% code coverage

## File Structure

```
AIExplorer/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   ├── layout.tsx                # Root layout
│   └── [feature]/page.tsx         # Page components
├── components/                   # Reusable components
│   ├── ui/                       # Shadcn UI components
│   └── [feature]/                # Feature components
├── features/                     # Feature modules
│   ├── [feature]/
│   │   ├── components/           # Feature components
│   │   ├── hooks/                # Feature hooks
│   │   └── types.ts              # Feature types
├── hooks/                        # Custom React hooks
├── lib/                          # Utilities and helpers
│   ├── api.ts                    # API client
│   ├── error-utils.ts            # Error handling
│   ├── validators.ts             # Input validation
│   └── types/                    # TypeScript types
├── config/                       # Configuration
│   └── constants.ts              # App constants
├── docs/                         # Documentation
├── public/                       # Static assets
└── Configuration files           # ESLint, TypeScript, etc.
```

See [Project Structure](./project-structure.md) for details.

## Documentation Standards

All code should include:

1. **JSDoc Comments** for functions
   - What the function does
   - Parameter descriptions
   - Return type description
   - Usage examples for complex functions

2. **Inline Comments** for complex logic
   - Why a specific approach was used
   - Non-obvious implementation details
   - Performance or security considerations

3. **Type Annotations**
   - All function parameters typed
   - Function return types explicit
   - No implicit `any` types

## Getting Help

### Documentation
- [System Architecture](./architecture.md) - Understand the system design
- [API Reference](./api-reference.md) - API endpoint documentation
- [Component Patterns](./component-patterns.md) - How to build components

### Code Examples
- Check existing code for patterns
- Review similar components
- Study error handling implementations
- Look at test files for usage examples

### Discussion
- Ask on team chat or Slack
- Create GitHub discussion for architectural questions
- Pair program for complex features
- Code review feedback

## Continuous Learning

### Recommended Reading
- Next.js documentation: https://nextjs.org/docs
- React documentation: https://react.dev
- TypeScript documentation: https://typescriptlang.org
- Azure AD documentation: https://learn.microsoft.com

### Stay Current
- Review release notes for dependencies
- Follow best practice updates
- Attend team tech talks
- Contribute to code reviews

---

**Next Steps**:
- [Setup & Installation](./setup.md) - Get your environment ready
- [Project Structure](./project-structure.md) - Learn the codebase layout
- [Development Guide](./development-guide.md) - Start coding with standards
