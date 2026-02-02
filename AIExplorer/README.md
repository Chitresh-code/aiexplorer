# AIExplorer

A production-grade Next.js application for managing and exploring AI use cases across the enterprise.

## Overview

AIExplorer is a comprehensive platform designed to help organizations:
- Submit and track AI use cases
- Monitor progress through implementation phases
- Manage stakeholders and timelines
- Report metrics and measure success
- Build a centralized gallery of AI initiatives

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict type checking
- **UI Framework**: Shadcn UI + Tailwind CSS
- **Authentication**: Azure AD (MSAL)
- **Database**: Azure SQL Database
- **HTTP Client**: Axios
- **Forms**: React Hook Form + Zod
- **Build Tool**: Turbopack

## Quick Start

### Prerequisites

- Node.js 18+ and npm 8+
- Azure SQL Database access
- Azure AD app registration

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd AIExplorer

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your configuration
```

### Development

```bash
# Start development server
npm run dev

# Start on specific port
npm run dev -- -p 3001

# Navigate to http://localhost:3000
```

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start

# The application will be optimized and ready for deployment
```

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix
```

### Type Checking

```bash
# Check TypeScript types
npm run type-check
```

### Code Formatting

```bash
# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check
```

### Complete Validation

```bash
# Run all validations (lint, type-check, format)
npm run validate

# Fix all issues automatically
npm run validate:fix
```

## Project Structure

```
AIExplorer/
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable React components
├── features/               # Feature modules organized by domain
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities, API client, validators, types
├── config/                 # Centralized configuration and constants
├── docs/                   # Documentation (API, Architecture, Development)
├── public/                 # Static assets
├── tests/                  # Test files
└── Configuration files     # ESLint, TypeScript, Next.js configs
```

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed project structure documentation.

## Documentation

- **[API Documentation](./docs/API.md)** - API client, endpoints, and best practices
- **[Architecture Documentation](./docs/ARCHITECTURE.md)** - Project structure, design patterns, and data flow
- **[Development Guide](./docs/DEVELOPMENT.md)** - Coding standards, conventions, and best practices

## Key Features

### Production-Grade Quality

- ✅ Strict TypeScript configuration for type safety
- ✅ Comprehensive ESLint rules enforcing best practices
- ✅ Prettier code formatting for consistency
- ✅ Centralized constants for maintainability
- ✅ Input validation for security
- ✅ Error handling with proper logging
- ✅ Security headers and CORS configuration
- ✅ React Compiler for automatic optimizations

### Developer Experience

- ✅ Modular component architecture
- ✅ Custom hooks for business logic
- ✅ Type-safe API client with error handling
- ✅ Reusable utility functions
- ✅ Clear separation of concerns
- ✅ Comprehensive documentation
- ✅ Fast builds with Turbopack

### Performance

- ✅ Server-side rendering with Next.js
- ✅ Code splitting and lazy loading
- ✅ Image optimization (WebP, AVIF)
- ✅ Caching strategies
- ✅ React Compiler for memoization

## Environment Variables

Create `.env.local` with the following:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000

# Azure MSAL Configuration
NEXT_PUBLIC_MSAL_CLIENT_ID=your_client_id
NEXT_PUBLIC_MSAL_AUTHORITY=https://login.microsoftonline.com/your_tenant_id
NEXT_PUBLIC_MSAL_REDIRECT_URI=http://localhost:3000

# Database Configuration
DB_SERVER=your_server
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

# Power Automate
POWER_AUTOMATE_APPROVAL_FLOW_URL=your_flow_url

# Node Environment
NODE_ENV=development
```

## API Integration

All API calls should use the functions from `lib/api.ts`:

```typescript
import { fetchUseCases, createUseCase } from "@/lib/api";
import { validateUseCasePayload } from "@/lib/validators";

// Fetch data
const useCases = await fetchUseCases();

// Create with validation
const validation = validateUseCasePayload(data);
if (validation.isValid) {
  const result = await createUseCase(data);
}
```

See [API Documentation](./docs/API.md) for complete API reference.

## Component Patterns

### Smart Components (Container)

```typescript
// features/gallery/GalleryPage.tsx
export function GalleryPage() {
  const { useCases, loading } = useUseCases();
  return <GalleryView data={useCases} loading={loading} />;
}
```

### Presentational Components

```typescript
// components/gallery/GalleryView.tsx
interface GalleryViewProps {
  data: UseCase[];
  loading: boolean;
}

export function GalleryView({ data, loading }: GalleryViewProps) {
  return <div>{/* render UI */}</div>;
}
```

## Database

The application uses Azure SQL Database with stored procedures for data access:

```typescript
const pool = await getSqlPool();
const result = await pool
  .request()
  .input("Email", email)
  .execute("dbo.GetUseCases");
```

Always use parameterized queries to prevent SQL injection.

## Authentication

Authentication is handled via Azure AD using MSAL:

```typescript
import { useMsal } from "@azure/msal-react";

export function LoginComponent() {
  const { instance } = useMsal();
  
  const handleLogin = () => {
    instance.loginPopup();
  };

  return <button onClick={handleLogin}>Sign In</button>;
}
```

## Error Handling

All errors are logged and handled consistently:

```typescript
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";

try {
  const data = await fetchUseCases();
} catch (error) {
  logErrorTrace("Failed to load use cases", error);
  const message = getUiErrorMessage(error, "Failed to load use cases.");
  toast.error(message);
}
```

## Best Practices

1. **Always use centralized constants** from `config/constants.ts`
2. **Validate inputs** using validators from `lib/validators.ts`
3. **Use type-safe API functions** from `lib/api.ts`
4. **Log errors appropriately** using `lib/error-utils.ts`
5. **Follow component patterns** with smart and presentational components
6. **Keep components focused** on single responsibility
7. **Use custom hooks** for shared logic
8. **Add JSDoc comments** for complex functions
9. **Write tests** for critical functionality
10. **Follow the development guide** in [DEVELOPMENT.md](./docs/DEVELOPMENT.md)

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect GitHub repository to Vercel
3. Vercel will automatically build and deploy
4. Set environment variables in Vercel project settings

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

```bash
docker build -t aiexplorer .
docker run -p 3000:3000 aiexplorer
```

## Troubleshooting

### Port Already in Use

```bash
# Use a different port
npm run dev -- -p 3001
```

### Database Connection Issues

- Verify `DB_SERVER`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- Check network/firewall access to Azure SQL Database
- Review database connection logs

### Azure AD Authentication Issues

- Verify `NEXT_PUBLIC_MSAL_CLIENT_ID` and `NEXT_PUBLIC_MSAL_AUTHORITY`
- Check redirect URI configuration in Azure AD app registration
- Review MSAL configuration in `lib/msal.ts`

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit changes: `git commit -am 'feat: add my feature'`
3. Push to branch: `git push origin feature/my-feature`
4. Submit a pull request

See [DEVELOPMENT.md](./docs/DEVELOPMENT.md) for coding standards and conventions.

## Performance Monitoring

Monitor application performance using:

- **NextJS built-in**: `npm run build` will show build size
- **React DevTools**: Browser extension for React component debugging
- **Chrome DevTools**: Network and performance analysis
- **Web Vitals**: Monitor Core Web Vitals in production

## License

[Your License Here]

## Support

For issues and questions:
1. Check [Documentation](./docs/)
2. Review [GitHub Issues](https://github.com/Chitresh-code/aiexplorer/issues)
3. Contact development team

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and updates.
