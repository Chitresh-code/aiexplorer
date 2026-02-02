# API Documentation

This document provides an overview of the API client and available endpoints used throughout the AIExplorer application.

## Overview

The API client is built using Axios and provides a centralized way to communicate with the backend service. All API calls should use the functions provided in `lib/api.ts` to ensure consistent error handling and logging.

## Base Configuration

- **Base URL**: Automatically detected based on environment
  - Development: `http://localhost:8000`
  - Production: `https://eai-aihub-backend-dev.happywave-248a4bd8.eastus2.azurecontainerapps.io`
- **Timeout**: 30 seconds
- **Default Headers**: JSON content-type and accept headers

## Error Handling

All API errors are:
1. Logged using `logErrorTrace()` from `lib/error-utils.ts`
2. Intercepted by the axios response interceptor
3. Thrown as errors that should be caught by the calling function

Example error handling:

```typescript
try {
  const data = await fetchUseCases();
} catch (error) {
  console.error("Failed to load use cases", error);
  // Handle error appropriately
}
```

## Use Cases API

### Fetch All Use Cases

```typescript
const useCases = await fetchUseCases();
```

Returns an array of use case summaries in list view format.

### Fetch Single Use Case

```typescript
const useCase = await fetchUseCase(useCaseId);
```

Returns detailed information for a specific use case.

### Create Use Case

```typescript
const newUseCase = await createUseCase(payload);
```

**Payload Structure**:
```typescript
{
  businessUnitId: number;
  phaseId: number;
  statusId: number;
  title: string;
  headlines: string;
  opportunity: string;
  businessValue: string;
  eseDependency: string;
  primaryContact: string;
  editorEmail: string;
  stakeholders: Array<{
    roleId: number;
    role: string;
    stakeholderEmail: string;
  }>;
  plan: Array<{
    usecasephaseid: number;
    startdate: string;
    enddate: string;
  }>;
  metrics: Array<{
    metrictypeid: number;
    unitofmeasureid: number;
    primarysuccessmetricname: string;
    baselinevalue: string;
    baselinedate: string;
    targetvalue: string;
    targetdate: string;
  }>;
}
```

### Update Use Case

```typescript
const updated = await updateUseCase(useCaseId, payload);
```

### Update Use Case Info

```typescript
const updated = await updateUseCaseInfo(useCaseId, {
  title?: string;
  headlines?: string;
  opportunity?: string;
  businessValue?: string;
  editorEmail?: string;
});
```

### Update Use Case Metrics

```typescript
const updated = await updateUseCaseMetrics(useCaseId, {
  newMetrics?: MetricItem[];
  updateMetrics?: UpdateMetricItem[];
  deleteMetricIds?: number[];
  editorEmail?: string;
});
```

### Update Use Case Checklist

```typescript
const updated = await updateUseCaseChecklist(useCaseId, {
  items: Array<{
    questionId: number;
    response?: string | null;
  }>;
  editorEmail?: string;
});
```

### Delete Use Case

```typescript
await deleteUseCase(useCaseId);
```

## Validation

Input validation utilities are provided in `lib/validators.ts`:

- `isValidEmail()` - Validates email format
- `isValidLength()` - Validates string length constraints
- `isValidUrl()` - Validates URL format
- `isValidId()` - Validates numeric IDs
- `isRequired()` - Checks non-empty strings
- `isNonEmptyArray()` - Validates non-empty arrays
- `validateUseCasePayload()` - Validates complete use case data
- `validateEmail()` - Validates email with error messages

## Constants

All API configuration, endpoints, routes, and error messages are centralized in `config/constants.ts`. This ensures consistency across the application and makes it easy to update configurations globally.

### Common Constants:

```typescript
import { API_CONFIG, ROUTES, ERROR_CONFIG } from "@/config/constants";

// API endpoints
API_CONFIG.ENDPOINTS.USECASES
API_CONFIG.ENDPOINTS.USECASES_DETAILS(id)

// Application routes
ROUTES.GALLERY
ROUTES.MY_USE_CASES
ROUTES.SUBMIT_USE_CASE

// Error messages
ERROR_CONFIG.MESSAGES.LOAD_USECASES
```

## Best Practices

1. **Always use the functions from `lib/api.ts`** rather than calling axios directly
2. **Validate inputs** using validators from `lib/validators.ts`
3. **Use centralized constants** from `config/constants.ts`
4. **Log errors appropriately** using `logErrorTrace()` from `lib/error-utils.ts`
5. **Handle errors gracefully** with user-friendly messages from `ERROR_CONFIG`
6. **Type your responses** to ensure type safety

Example:

```typescript
import { fetchUseCases } from "@/lib/api";
import { isNonEmptyArray } from "@/lib/validators";
import { ERROR_CONFIG } from "@/config/constants";

try {
  const response = await fetchUseCases();
  if (isNonEmptyArray(response)) {
    // Process data
  }
} catch (error) {
  console.error(ERROR_CONFIG.MESSAGES.LOAD_USECASES);
}
```
