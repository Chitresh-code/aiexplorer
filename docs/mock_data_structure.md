# AI Hub - Mock Data Structure Documentation

This document outlines the structures of the mock data currently used in the AI Hub application for UI testing and development purposes. It serves as a blueprint for the "One Screen → One API" architecture.

---

## 1. Global / Shared Data Structures

### `UseCaseRecord`
The primary data object for use cases, used across several screens.
```typescript
interface UseCaseRecord {
  ID: number;
  UseCase: string;      // Title of the use case
  Title?: string;       // Sometimes used interchangeably with UseCase
  AITheme: string;      // AI classification (e.g., "Natural Language Processing")
  Status: string;       // Current status (e.g., "Implemented", "On Track")
  Phase: string;        // Current delivery phase (e.g., "Idea", "Diagnose")
  Created: string;      // ISO Date string
  BusinessUnit?: string;
  Owner?: string;
  Priority?: number | null;
  Delivery?: string;    // Fiscal quarter (e.g., "FY25Q04")
}
```

---

## 2. Homepage (`/`)

### `kpiData`
Summary stats displayed on the dashboard KPI cards.
```typescript
{
  totalUseCases: number;  // e.g., 32
  implemented: number;    // e.g., 21
  trending: number;       // Percentage change (e.g., 12.5)
  completionRate: number; // Percentage (e.g., 65.6)
}
```

### `recentUseCases`
Array of objects for the "Recent Submissions" carousel.
```typescript
{
  ID: number;
  UseCase: string;
  AITheme: string;
  Status: string;
  Created: string;      // ISO Date string: "2024-12-01T10:30:00Z"
}
```

### `chartData`
Monthly data points for the "Use Case Flow" visualization.
```typescript
{
  month: string;       // Format: "YYYY-MM"
  idea: number;        // Count in Idea phase
  diagnose: number;    // Count in Diagnose phase
  design: number;      // Count in Design phase
  implemented: number; // Count in Implemented phase
}
```

---

## 3. Use Case Details (`/use-case-details/[id]`)

### `stakeholders`
List of key project members.
```typescript
{
  name: string;
  role: string;
  initial: string;     // First initials for Avatar (e.g., "JD")
}
```

### `updates`
Recent activity feed.
```typescript
{
  id: number;
  author: string;
  content: string;
  time: string;        // Relative time string (e.g., "2 hours ago")
  type: string;        // "status_change" | "comment" | "activity"
}
```

### `checklist` & `approvalHistory`
Approval tracking data.
```typescript
// Checklist
{
  item: string;        // e.g., "Plan", "Metric", "RICE Score"
  status: "approved" | "rejected";
}

// Approval History
{
  phase: string;
  approver: string;
  status: "Approved" | "Rejected";
  date: string;        // Format: "Oct 03, 2025"
}
```

### `phaseDates`
Start and End dates for project phases.
```typescript
{
  idea: { start: Date; end?: Date };
  diagnose: { start?: Date; end?: Date };
  design: { start?: Date; end?: Date };
  implemented: { start?: Date; end: Date };
}
```

---

## 4. AI Gallery (`/gallery`)

### `GalleryUseCase`
Cards for the public gallery view.
```typescript
{
  id: number;
  title: string;
  phase: string;
  bgColor: string;     // Hex color code for the card background
  department: string;
  persona: string;
  aiTheme: string;
  modelName: string;
}
```

---

## 5. Champion Dashboard (`/champion`)

### `UseCase` (Champion Table/Kanban)
Extended structure for the Kanban and List views.
```typescript
{
  id: number;
  title: string;
  idea: string;        // status or date range: "completed" | "MM/DD/YY - MM/DD/YY" | "Not Set"
  diagnose: string;
  design: string;
  implemented: string;
  delivery: string;    // Fiscal quarter (e.g., "FY25Q04")
  priority: number | null;
  status: string;      // e.g., "On-Track", "At Risk", "Completed", "Help Needed"
}
```

### `filters` (Dropdown Data)
Data for the filter dropdowns in the Champion dashboard.
```typescript
{
  personas: { label: string; value: string }[];
  ai_themes: { label: string; value: string }[];
  business_units: string[];
}
```

---

## 6. Metadata Reporting (`/metadata-reporting/[id]`)

### `formData` (RICE & Reporting)
Internal scoring and prioritization state.
```typescript
{
  reach: string;
  impact: string;       // "Low" | "Medium" | "High" | "Very High"
  confidence: string;   // "Low" | "Medium" | "High"
  effort: string;       // "Low" | "Medium" | "High"
  riceScore: string;
  priority: string;     // "1" | "2" | "3" | "4" | "5"
  delivery: string;     // e.g., "FY25Q04"
  totalUserBase: string; // e.g., "100-500"
  displayInGallery: boolean;
  sltReporting: boolean;
  reportingFrequency: string; // "Weekly" | "Bi-weekly" | "Monthly" | "Quarterly"
}
```
