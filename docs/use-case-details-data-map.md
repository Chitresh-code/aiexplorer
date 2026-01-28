Use Case Details Data Map
Date: 2026-01-23

Overview
- Page: `AIExplorer/app/use-case-details/[id]/page.tsx`
- The page currently mixes static placeholders with list-based lookups (`useUseCases`) and generic dropdown data (`getDropdownData`). This map lists the data each section needs so we can define APIs.

Global / Page-Level
- Use case id (route param).
- Use case title.
- Current phase + phase id.
- Current status + status color.
- Business unit / department.
- Primary contact.
- Source screen (champion vs my-use-cases) to drive tabs and sections.

Tabs + Actions (Top Bar)
- Available tabs (Info, Update, Reprioritize or Agent Library, Metrics, Approvals/Actions).
- Edit state (info tab only).
- Apply changes action (persist edits per section).

Info Tab
Header
- Title.
- Use case id (shown as badge today).
Left Card (Use Case)
- Title.
- Current phase.
- Product/AI badge label (currently hardcoded).
Department
- Business unit or department label.
AI Themes
- List of selected AI themes.
Main Content
- Headline.
- Opportunity.
- Evidence.
- Primary contact person.

Update Tab
Change Status (hidden now, but present)
- Current phase.
- Current status.
- Status options (mapping).
Timeline
- Phase list (mapping) and per-phase start/end date.
- Save action for phase dates.
Stakeholders
- Stakeholder list: name, role, email, avatar initials.
- Role options (mapping).
- Add/edit/delete actions.
Post Update
- Update content text.
- Author (current user).
- Timestamp.
Recent Updates
- Update list: author, role, content, timestamp, update type (status change/comment/activity).

Reprioritize Tab (Champion Only)
Impact Metrics
- Reach.
- Impact (mapping).
- Confidence (mapping).
- Effort (mapping).
Priority & Scoring
- RICE score.
- Priority (mapping or 1-5 scale).
- Delivery / timespan (mapping).
- Total user base (mapping).
Reporting Configuration
- Display in AI Gallery (boolean).
- SLT Reporting (boolean).
- Reporting frequency (mapping).

Agent Library Tab (My Use Cases Only)
- Knowledge source options.
- Selected knowledge source.
- Agent instructions / prompt text.
- Save action (submit agent library config).

Metrics Tab
Add Metrics
- Metrics list with fields:
  - Primary success value
  - PARCS category (mapping)
  - Unit of measurement (mapping)
  - Baseline value/date
  - Target value/date
- Add metric action.
- Save metrics action.
Reported Metrics
- Reportable metrics list (submitted only).
- Reported metrics list with fields:
  - Reported value/date
  - Existing baseline/target values for context
- Save reported metrics action.

Status / Approvals Tab
Champion View
- Use case details: title, submitted by, status, business unit.
- Approval history items: phase, status, approver, date.
- Decision form: decision options + comments.
My Use Cases View
- Current phase + status.
- Status options (mapping).
- Completion summary per phase.
- Approval history items (phase, status, date, actor, comments).
- Request approval: next phase options (mapping) + notes.

Suggested API Inputs (Non-Exhaustive)
- `GET /api/usecases/:id` core fields for Info + header.
- `GET /api/usecases/:id/plan` phase timeline dates.
- `GET /api/usecases/:id/stakeholders` stakeholder list + roles.
- `GET /api/usecases/:id/updates` updates feed.
- `GET /api/usecases/:id/approvals` approval history + decision options.
- `GET /api/usecases/:id/reprioritize` reprioritization fields.
- `GET /api/usecases/:id/metrics` submitted + reported metrics.
- Mappings: phases, status, ai themes, roles, impact/confidence/effort, delivery timespans, user base, reporting frequency, PARCS categories, units of measure.
