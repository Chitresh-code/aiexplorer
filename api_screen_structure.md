# AI Hub - Screen-Based API Architecture

This document defines the "One Screen → One API" architecture for the AI Hub. Following the **Backend Aggregation Pattern**, each frontend screen makes a single primary request to fetch all required data, minimizing network overhead and simplifying frontend logic. The backend aggregates all data from various sources (KPIs, use cases, updates, etc.) and sends it in one JSON response that matches the mock data structures.

---

## 1. Screen-Based API Design Pattern

### The Rule
**Each frontend screen calls EXACTLY ONE GET endpoint to load its entire state.**

### How it works:
1.  **Frontend Request:** The frontend calls a consolidated "Screen API" (e.g., `GET /api/screens/dashboard`).
2.  **Backend Aggregation:** The backend gathers all data for that screen (e.g., KPI totals, recent submissions, timeline data) and sends it back in a single JSON package.
3.  **Frontend Decision:** The frontend receives the full data and distributes it to components (KPI cards, charts, lists).
4.  **Efficiency:** One trip to the server reduces latency and simplifies state management.

---

## 2. Integrated Screen APIs (Frontend-Facing)

### 2.1 Dashboard Screen (Homepage)
**Endpoint:** `GET /api/screens/dashboard`  
**Purpose:** Loads all data for the homepage (KPIs, Use Case Flow chart, and Recent Submissions).

**Sample Response:**
```json
{
  "kpis": {
    "totalUseCases": 32,
    "implemented": 21,
    "trending": 12.5,
    "completionRate": 65.6
  },
  "timeline": [
    { "month": "2024-11", "idea": 4, "diagnose": 4, "design": 4, "implemented": 20 },
    { "month": "2024-12", "idea": 4, "diagnose": 3, "design": 4, "implemented": 21 }
  ],
  "recent_submissions": [
    {
      "ID": 1,
      "UseCase": "AI-Powered Customer Support Chatbot",
      "AITheme": "Natural Language Processing",
      "Status": "Implemented",
      "Created": "2024-12-01T10:30:00Z"
    }
  ]
}
```

---

### 2.2 Use Case Details Screen
**Endpoint:** `GET /api/screens/use-case-details/{id}`  
**Purpose:** Loads all tab data for a specific use case (Stakeholders, Updates, Checklist, Dates, and Metadata).

**Sample Response:**
```json
{
  "details": {
    "ID": 1,
    "Title": "Process Automation with AI",
    "Phase": "Idea",
    "Status": "On-Track",
    "Department": "Communications",
    "AITheme": ["Data Extraction", "Causal Inference"],
    "Headline": "Streamline multilingual communication",
    "Opportunity": "...",
    "Evidence": "...",
    "ContactPerson": "John Doe"
  },
  "stakeholders": [
    { "name": "John Doe", "role": "Champion", "initial": "JD" }
  ],
  "updates": [
    { "id": 1, "author": "John Doe", "content": "Initial requirement gathering completed.", "time": "2 hours ago", "type": "status_change" }
  ],
  "checklist": [
    { "item": "Plan", "status": "approved" },
    { "item": "Metric", "status": "rejected" }
  ],
  "approval_history": [
    { "phase": "Diagnose", "approver": "Saurabh Yadav", "status": "Approved", "date": "Oct 03, 2025" }
  ],
  "phase_dates": {
    "idea": { "start": "2024-01-01", "end": "2024-02-01" },
    "diagnose": { "start": "2024-02-01", "end": null },
    "design": { "start": null, "end": null },
    "implemented": { "start": null, "end": "2024-12-31" }
  }
}
```

---

### 2.3 AI Gallery Screen
**Endpoint:** `GET /api/screens/gallery`  
**Purpose:** Fetches all use cases configured for display in the public gallery.

**Sample Response:**
```json
{
  "use_cases": [
    {
      "id": 1,
      "title": "Autotranslation using AWS",
      "phase": "Diagnose",
      "bgColor": "#c7e7e7",
      "department": "Communications",
      "persona": "All",
      "aiTheme": "Audio Generation",
      "modelName": "Poppulo AI"
    }
  ]
}
```

---

### 2.4 Champion Dashboard Screen
**Endpoint:** `GET /api/screens/champion-dashboard`  
**Purpose:** Fetches all use cases for the champion's view, including Kanban data, table data, and filter options.

**Sample Response:**
```json
{
  "table": [
    { "id": 1, "title": "AchmanTest", "idea": "completed", "diagnose": "11/21/25 - 11/26/25", "design": "Not Set", "implemented": "Not Set", "delivery": "FY25Q04", "priority": 1, "status": "On-Track" }
  ],
  "kanban": {
    "Idea": [],
    "Diagnose": [{ "id": 1, "title": "AchmanTest", "status": "On-Track" }],
    "Design": [],
    "Implemented": []
  },
  "filters": {
    "personas": [{ "label": "Employee", "value": "employee" }],
    "ai_themes": [{ "label": "NLP", "value": "nlp" }],
    "business_units": ["Communications", "IT", "People"]
  }
}
```

---

### 2.5 Metadata Reporting Screen
**Endpoint:** `GET /api/screens/metadata-reporting/{id}`  
**Purpose:** Loads all internal scoring and prioritization state for a specific use case.

**Sample Response:**
```json
{
  "form_data": {
    "reach": "1000",
    "impact": "High",
    "confidence": "Medium",
    "effort": "Low",
    "riceScore": "10434783",
    "priority": "1",
    "delivery": "FY25Q04",
    "totalUserBase": "100-500",
    "displayInGallery": true,
    "sltReporting": true,
    "reportingFrequency": "Bi-weekly"
  }
}
```

---

## 3. Support / Internal APIs (Actions & Utilities)

These APIs are used for specific actions and shared data lookups.

### 3.1 Write Operations (POST/PUT/DELETE)
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/usecases` | `POST` | Create a new use case. |
| `/api/usecases/{id}` | `PUT` | Update general use case fields. |
| `/api/usecases/{id}` | `DELETE` | Remove a use case. |
| `/api/metrics` | `POST` | Submit or update reported metrics. |
| `/api/updates` | `POST` | Post a status update or comment. |
| `/api/decisions` | `POST` | Submit an approval/rejection decision. |

### 3.2 Global Utilities
| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/dropdown-data` | `GET` | Fetches shared personas, themes, and business units. |
| `/api/auth/me` | `GET` | Get current user profile and role. |
| `/health` | `GET` | System health check. |

---

## 4. Implementation Rules

1.  **Response Parity:** All Screen API responses MUST match the structures defined in `mock_data_structure.md`.
2.  **Aggregation:** Backend should use efficient joins or parallel queries to gather screen data into a single response.
3.  **CamelCase:** Use camelCase for keys in JSON responses to match frontend TypeScript interfaces.
4.  **Error Handling:** Use standard HTTP status codes (404 for not found, 403 for unauthorized).
