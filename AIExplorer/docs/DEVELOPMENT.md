# Development Guide

This guide provides best practices and conventions for developing in the AIExplorer codebase.

## Getting Started

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build
```

### Environment Variables

Create a `.env.local` file in the root directory:

```bash
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

## Code Style and Standards

### TypeScript

All code must be strongly typed:

```typescript
// ✅ Good
interface UserProps {
  name: string;
  email: string;
  age: number;
}

export function UserCard({ name, email, age }: UserProps): JSX.Element {
  return <div>{name}</div>;
}

// ❌ Avoid
export function UserCard(props: any) {
  return <div>{props.name}</div>;
}
```

### Component Structure

```typescript
// 1. Imports
import { useState } from "react";
import { Button } from "@/components/ui/button";

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  onClick?: () => void;
}

// 3. Component Definition
export function MyComponent({ title, onClick }: ComponentProps): JSX.Element {
  // 4. State and Hooks
  const [isOpen, setIsOpen] = useState(false);

  // 5. Event Handlers
  const handleClick = (): void => {
    setIsOpen(!isOpen);
    onClick?.();
  };

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick}>Toggle</Button>
    </div>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase with `use` prefix (`useUseCases.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_CONFIG`)
- **Types**: PascalCase (`UserProps`, `ApiResponse`)
- **Variables**: camelCase (`userData`, `isLoading`)
- **Private functions**: Prefix with underscore (`_formatDate`)

### File Organization

```typescript
// File: components/gallery/GalleryCard.tsx
"use client"; // Use client directive if needed

// 1. External imports
import { useState } from "react";
import Link from "next/link";

// 2. Internal imports (organized)
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// 3. Types
interface GalleryCardProps {
  id: number;
  title: string;
  description: string;
}

// 4. Component
export function GalleryCard({ id, title, description }: GalleryCardProps) {
  const [isSelected, setIsSelected] = useState(false);

  return (
    <Card className={cn("p-4", isSelected && "ring-2")}>
      <h3>{title}</h3>
      <p>{description}</p>
      <Button onClick={() => setIsSelected(!isSelected)}>
        {isSelected ? "Deselect" : "Select"}
      </Button>
    </Card>
  );
}
```

### Imports Organization

Organize imports in this order:

```typescript
// 1. React and Next.js imports
import { useState } from "react";
import Link from "next/link";

// 2. Third-party imports
import axios from "axios";
import { toast } from "sonner";

// 3. Internal absolute imports
import { Button } from "@/components/ui/button";
import { fetchUseCases } from "@/lib/api";
import { API_CONFIG } from "@/config/constants";
import type { UseCase } from "@/lib/types/usecase";

// 4. Relative imports (if needed)
import { helper } from "./helper";
```

## API Integration

### Creating API Functions

```typescript
// File: lib/api.ts

/**
 * Fetch data from an endpoint
 * @param id - The resource ID
 * @returns The resource data
 * @throws {AxiosError} If the request fails
 */
export const fetchResource = async (id: number): Promise<Resource> => {
  try {
    const response = await apiClient.get(`/api/resources/${id}`);
    return response.data as Resource;
  } catch (error) {
    logErrorTrace(`Failed to fetch resource ${id}`, error);
    throw error;
  }
};
```

### Using API Functions in Components

```typescript
// File: components/ResourceList.tsx
"use client";

import { useEffect, useState } from "react";
import { fetchResources } from "@/lib/api";
import { ERROR_CONFIG } from "@/config/constants";

export function ResourceList() {
  const [data, setData] = useState<Resource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await fetchResources();
        setData(result);
        setError(null);
      } catch (err) {
        setError(ERROR_CONFIG.MESSAGES.DEFAULT);
        console.error("Failed to load resources", err);
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <ul>
      {data.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}
```

## Form Handling

Use React Hook Form with Zod validation:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  email: z.string().email("Invalid email format"),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("title")} />
      {errors.title && <span>{errors.title.message}</span>}

      <input {...register("email")} type="email" />
      {errors.email && <span>{errors.email.message}</span>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

## Error Handling

### API Errors

```typescript
import { getUiErrorMessage, logErrorTrace } from "@/lib/error-utils";
import { ERROR_CONFIG } from "@/config/constants";

try {
  const data = await fetchUseCases();
} catch (error) {
  logErrorTrace("Failed to load use cases", error);
  const message = getUiErrorMessage(error, ERROR_CONFIG.MESSAGES.LOAD_USECASES);
  toast.error(message);
}
```

### Validation Errors

```typescript
import { validateUseCasePayload } from "@/lib/validators";

const validation = validateUseCasePayload(formData);
if (!validation.isValid) {
  Object.entries(validation.errors).forEach(([field, message]) => {
    console.error(`Validation error in ${field}: ${message}`);
  });
  return;
}
```

## Database Operations

### Executing Stored Procedures

```typescript
import { getSqlPool } from "@/lib/azure-sql";

const pool = await getSqlPool();
const result = await pool
  .request()
  .input("UserId", userId)
  .input("Email", email)
  .execute("dbo.GetUserData");

const records = result.recordset || [];
```

### Parameters

Always use parameterized queries to prevent SQL injection:

```typescript
// ✅ Good - Parameterized
pool.request()
  .input("Email", email)
  .query("SELECT * FROM users WHERE email = @Email");

// ❌ Bad - String interpolation
pool.request()
  .query(`SELECT * FROM users WHERE email = '${email}'`);
```

## Testing

### Component Testing

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MyComponent } from "./MyComponent";

describe("MyComponent", () => {
  test("renders with title", () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  test("calls onClick handler", async () => {
    const onClick = jest.fn();
    render(<MyComponent title="Test" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Hook Testing

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { useUseCases } from "@/hooks/use-usecases";

describe("useUseCases", () => {
  test("fetches use cases", async () => {
    const { result } = renderHook(() => useUseCases());

    await waitFor(() => {
      expect(result.current.useCases).toHaveLength(5);
    });
  });
});
```

## Debugging

### Console Logging

Use console carefully in production:

```typescript
// Development
if (process.env.NODE_ENV === "development") {
  console.log("Debug info:", data);
}

// Avoid console.log in components
// Use error-utils.ts for production logging
```

### React DevTools

Install React DevTools extension for browser debugging.

## Performance Best Practices

### Component Optimization

```typescript
// Use React.memo for expensive components
export const ExpensiveComponent = React.memo(function Component({ data }: Props) {
  return <div>{data}</div>;
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // handler
}, []);

// Use useMemo for expensive computations
const sortedData = useMemo(() => {
  return data.sort((a, b) => a - b);
}, [data]);
```

### Data Fetching

```typescript
// Avoid refetching on every render
useEffect(() => {
  const loadData = async () => {
    // fetch
  };

  void loadData();
}, []); // Empty dependency array = runs once
```

### Code Splitting

```typescript
// Lazy load heavy components
const HeavyComponent = dynamic(
  () => import("./HeavyComponent"),
  { loading: () => <div>Loading...</div> }
);
```

## Commit Messages

Use conventional commits:

```
feat: add use case gallery view
fix: resolve pagination bug in metrics
docs: update API documentation
refactor: simplify use case validation
test: add test coverage for validators
chore: update dependencies
```

## Pull Request Checklist

- [ ] Code follows style guide
- [ ] All tests pass
- [ ] ESLint has no warnings
- [ ] Type checking passes
- [ ] Updated documentation if needed
- [ ] No console errors or warnings
- [ ] Tested in development
- [ ] Responsive design verified (if UI change)
- [ ] Accessibility tested (if UI change)

## Common Patterns

### Conditional Rendering

```typescript
// Use ternary for simple conditions
{isLoading ? <Skeleton /> : <Content />}

// Use logical && for presence
{hasError && <ErrorMessage />}

// Use switch for multiple states
{(() => {
  switch (status) {
    case "loading": return <Skeleton />;
    case "error": return <Error />;
    case "success": return <Content />;
  }
})()}
```

### List Rendering

```typescript
// Always use unique key
{items.map((item) => (
  <Item key={item.id} {...item} />
))}

// Not item.index as key
{items.map((item, index) => (
  <Item key={index} {...item} /> // ❌ Don't do this
))}
```

## Useful Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production server
npm start

# Linting
npm run lint

# Type checking
npx tsc --noEmit

# Format code
npm run format

# Test
npm test
```

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn UI](https://ui.shadcn.com)
