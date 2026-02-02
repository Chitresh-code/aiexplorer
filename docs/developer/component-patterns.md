# Component Patterns - AIExplorer

Best practices and patterns for building React components in AIExplorer.

## Table of Contents

1. [Component Types](#component-types)
2. [Naming Conventions](#naming-conventions)
3. [Smart Components (Containers)](#smart-components-containers)
4. [Presentational Components](#presentational-components)
5. [Custom Hooks](#custom-hooks)
6. [Common Patterns](#common-patterns)
7. [Type Safety](#type-safety)

## Component Types

### Smart Components (Container)

**Purpose**: Manage data and business logic

**Responsibilities**:
- Fetch data from API
- Manage state
- Handle side effects
- Pass data to presentational components

**Location**: `features/[feature]/components/` or `app/[feature]/`

**Example**:
```typescript
// features/usecases/GalleryPage.tsx
'use client';

import { useUseCases } from '@/hooks/use-usecases';
import { GalleryView } from './GalleryView';

export function GalleryPage() {
  const { useCases, loading, error } = useUseCases();
  
  if (error) return <ErrorBoundary error={error} />;
  
  return (
    <GalleryView 
      useCases={useCases} 
      loading={loading} 
    />
  );
}
```

### Presentational Components

**Purpose**: Render UI based on props

**Responsibilities**:
- Render HTML/JSX
- Handle user interactions
- No data fetching
- No side effects (mostly)

**Location**: `components/` or `features/[feature]/components/`

**Example**:
```typescript
// components/gallery/GalleryView.tsx
interface GalleryViewProps {
  useCases: UseCase[];
  loading: boolean;
  onSelectUseCase?: (id: string) => void;
}

export function GalleryView({ 
  useCases, 
  loading,
  onSelectUseCase
}: GalleryViewProps) {
  if (loading) return <Spinner />;
  
  return (
    <div className="grid grid-cols-3 gap-4">
      {useCases.map(useCase => (
        <UseCaseCard
          key={useCase.id}
          useCase={useCase}
          onClick={() => onSelectUseCase?.(useCase.id)}
        />
      ))}
    </div>
  );
}
```

## Naming Conventions

### File Naming

**PascalCase** for component files:
```
✅ GalleryPage.tsx
✅ UseCaseCard.tsx
✅ ProjectTimeline.tsx

❌ galleryPage.tsx
❌ use-case-card.tsx
```

**camelCase** for utility files:
```
✅ use-usecases.ts
✅ api-client.ts
✅ error-handler.ts

❌ UseUsecases.ts
❌ ApiClient.ts
```

### Directory Structure

```
features/
├── usecases/
│   ├── components/
│   │   ├── GalleryPage.tsx      (smart)
│   │   ├── GalleryView.tsx      (presentational)
│   │   ├── UseCaseCard.tsx      (presentational)
│   │   └── UseCaseForm.tsx      (smart)
│   ├── hooks/
│   │   └── use-usecases.ts
│   └── types.ts

components/
├── common/
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Modal.tsx
└── gallery/
    ├── GalleryView.tsx
    └── UseCaseCard.tsx
```

### Naming Functions & Props

```typescript
// Event handlers: handle[Action]
const handleSubmit = () => {};
const handleFilterChange = (filter) => {};

// Callbacks passed as props: on[Action]
interface ComponentProps {
  onSubmit?: (data: FormData) => void;
  onCancel?: () => void;
  onLoadMore?: () => void;
}

// Boolean props: is[State] or has[Quality]
interface Props {
  isLoading: boolean;
  isDisabled: boolean;
  hasError: boolean;
  isOpen: boolean;
}

// Data retrieval functions: get[Data] or fetch[Data]
const getUseCases = () => {};
const fetchUserProfile = async () => {};
```

## Smart Components (Containers)

### Template

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useUseCases } from '@/hooks/use-usecases';
import { GalleryView } from './GalleryView';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

interface GalleryPageProps {
  initialFilter?: string;
}

/**
 * Gallery Page Container
 * 
 * Manages gallery state and data fetching.
 * Renders the presentational GalleryView component.
 */
export function GalleryPage({ initialFilter }: GalleryPageProps) {
  const [filter, setFilter] = useState(initialFilter || 'all');
  const { useCases, loading, error, refetch } = useUseCases(filter);
  
  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    refetch();
  };
  
  const handleRefresh = () => {
    refetch();
  };
  
  if (error) {
    return <ErrorBoundary error={error} onRetry={handleRefresh} />;
  }
  
  return (
    <GalleryView
      useCases={useCases}
      loading={loading}
      currentFilter={filter}
      onFilterChange={handleFilterChange}
      onRefresh={handleRefresh}
    />
  );
}
```

### Key Patterns

1. **Data Fetching**
   ```typescript
   const { data, loading, error } = useCustomHook();
   ```

2. **State Management**
   ```typescript
   const [filter, setFilter] = useState('');
   const [isModalOpen, setIsModalOpen] = useState(false);
   ```

3. **Effect Handling**
   ```typescript
   useEffect(() => {
     // Side effects here
   }, [dependencies]);
   ```

4. **Error Boundaries**
   ```typescript
   if (error) return <ErrorBoundary error={error} />;
   ```

## Presentational Components

### Template

```typescript
'use client';

import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface UseCaseCardProps {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'Active' | 'Completed' | 'Archived';
  onClick?: () => void;
}

/**
 * Use Case Card Component
 * 
 * Displays a single use case in card format.
 * 
 * @param props - Card properties
 * @returns Rendered card component
 */
export function UseCaseCard({
  id,
  title,
  description,
  category,
  status,
  onClick
}: UseCaseCardProps) {
  const statusColor = {
    Active: 'bg-green-100 text-green-800',
    Completed: 'bg-blue-100 text-blue-800',
    Archived: 'bg-gray-100 text-gray-800'
  }[status];
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-bold text-lg text-balance">
            {title}
          </h3>
          <span className={`px-2 py-1 rounded text-sm ${statusColor}`}>
            {status}
          </span>
        </div>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
            {category}
          </span>
          <Button variant="ghost" size="sm">
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

### Best Practices

1. **Props Interface**
   - Define clear, typed interface
   - Use specific types, not `any`
   - Make optional props explicit with `?`

2. **JSDoc Comments**
   - Document component purpose
   - Explain complex props
   - Include usage examples

3. **Styling**
   - Use Tailwind classes
   - Apply semantic styling
   - Keep inline styles minimal

4. **Event Handlers**
   - Handle null/undefined callbacks
   - Provide sensible defaults
   - Use optional chaining: `onClick?.()`

## Custom Hooks

### Hook Pattern

```typescript
// hooks/use-usecases.ts

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { fetchUseCases } from '@/lib/api';
import { UseCase } from '@/lib/types';

interface UseUseCasesOptions {
  category?: string;
  status?: string;
}

/**
 * Hook for managing use case data
 * 
 * Provides loading state and error handling
 * 
 * @param options - Filter and pagination options
 * @returns Use cases data and management functions
 */
export function useUseCases(options?: UseUseCasesOptions) {
  const [page, setPage] = useState(1);
  
  const { data, error, isLoading, mutate } = useSWR(
    ['usecases', page, options],
    () => fetchUseCases({ page, ...options }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
  
  const refetch = useCallback(() => {
    mutate();
  }, [mutate]);
  
  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);
  
  return {
    useCases: (data?.items as UseCase[]) || [],
    loading: isLoading,
    error,
    page,
    refetch,
    goToPage,
  };
}
```

### Characteristics

- Manage complex logic
- Handle data fetching
- Manage derived state
- Provide clear interface
- Return consistent shape

## Common Patterns

### Loading State

```typescript
if (loading) {
  return <Spinner />;
}

if (error) {
  return <ErrorMessage error={error} />;
}

return <Content data={data} />;
```

### Conditional Rendering

```typescript
// Avoid ternary chains
❌ return isLoading ? <A /> : isError ? <B /> : <C />;

// Use if statements or specific patterns
✅ if (isLoading) return <Spinner />;
✅ if (isError) return <ErrorBoundary />;
✅ return <Content />;
```

### List Rendering with Keys

```typescript
// ✅ Unique, stable ID
{items.map(item => (
  <Item key={item.id} item={item} />
))}

// ❌ Array index (can cause issues)
{items.map((item, index) => (
  <Item key={index} item={item} />
))}
```

### Controlled Components

```typescript
const [value, setValue] = useState('');

return (
  <input
    value={value}
    onChange={(e) => setValue(e.target.value)}
    onBlur={() => onValueChange?.(value)}
  />
);
```

## Type Safety

### Component Props

```typescript
interface ComponentProps {
  // Required string
  title: string;
  
  // Optional string
  subtitle?: string;
  
  // Union type
  variant: 'primary' | 'secondary' | 'danger';
  
  // Complex object
  item: {
    id: string;
    name: string;
  };
  
  // Array
  items: Item[];
  
  // Function callback
  onClick?: (id: string) => void;
  
  // React children
  children?: ReactNode;
}

interface Props extends ComponentProps {
  // Extend existing props
}
```

### Generic Components

```typescript
/**
 * Generic list component
 * @template T - Type of items in list
 */
export function List<T extends { id: string }>(props: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  onSelect?: (item: T) => void;
}) {
  return (
    <ul>
      {props.items.map(item => (
        <li key={item.id} onClick={() => props.onSelect?.(item)}>
          {props.renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
```

---

**Related**: [Architecture](./architecture.md) | [Development Guide](./development-guide.md)
