# AIExplorer Wiki Structure

Complete guide to the documentation organization.

## Overview

The AIExplorer wiki is organized into two main sections serving different audiences:

- **User Documentation** (`/docs/user/`) - For end users and business stakeholders
- **Developer Documentation** (`/docs/developer/`) - For developers and technical staff

## Directory Structure

```
docs/
├── README.md                      # Wiki home page
├── WIKI_STRUCTURE.md              # This file
├── user/                          # User-facing documentation
│   ├── README.md                 # User guide index
│   ├── getting-started.md        # First-time user setup
│   ├── dashboard.md              # Dashboard overview and usage
│   ├── submitting-usecases.md    # How to submit AI use cases
│   ├── managing-projects.md      # Project management guide
│   ├── reports-metrics.md        # Viewing reports and analytics
│   ├── faq.md                    # Frequently asked questions
│   ├── glossary.md               # Key terminology
│   └── troubleshooting.md        # Common issues and solutions
└── developer/                     # Developer-facing documentation
    ├── README.md                 # Developer guide index
    ├── setup.md                  # Development environment setup
    ├── project-structure.md      # Codebase organization
    ├── architecture.md           # System architecture with diagrams
    ├── component-patterns.md     # React component best practices
    ├── database-schema.md        # Database structure and relationships
    ├── api-reference.md          # Complete API endpoint reference
    ├── authentication.md         # Auth flow and implementation
    ├── error-handling.md         # Error patterns and recovery
    ├── development-guide.md      # Coding standards and conventions
    ├── testing.md                # Unit, integration, and e2e testing
    ├── performance.md            # Optimization techniques
    ├── security.md               # Security best practices
    ├── deployment.md             # Build and deployment procedures
    └── contributing.md           # Contributing guidelines
```

## User Documentation

### Purpose

End-user focused documentation covering everything users need to know to work with AIExplorer.

### Target Audience

- Business users submitting AI use cases
- Project managers tracking initiatives
- Executives reviewing metrics and reports
- All stakeholders navigating the platform

### Sections

#### Getting Started (`user/getting-started.md`)
- Account setup and login
- First-time orientation
- Profile configuration
- Platform navigation basics

**When to read**: New to AIExplorer? Start here.

#### Dashboard Overview (`user/dashboard.md`)
- Understanding the dashboard interface
- Interpreting widgets and metrics
- Customizing your view
- Common dashboard tasks

**When to read**: Want to understand your home screen? Check this.

#### Submitting Use Cases (`user/submitting-usecases.md`)
- Step-by-step submission process
- Form field explanations
- Best practices for strong submissions
- What happens after submission

**When to read**: Ready to submit your first AI use case? Follow this guide.

#### Managing Projects (`user/managing-projects.md`)
- Project lifecycle and phases
- Team management
- Progress tracking
- Milestone and timeline management
- Communication and updates

**When to read**: Managing or involved in an AI project? This has everything you need.

#### Reports & Metrics (`user/reports-metrics.md`)
- Viewing and understanding reports
- Creating custom reports
- Exporting data
- Key performance indicators

**When to read**: Need to analyze project data or create reports?

#### FAQ (`user/faq.md`)
- Quick answers to common questions
- Organized by topic
- Links to detailed guides

**When to read**: Have a quick question? Check here first.

#### Glossary (`user/glossary.md`)
- Definitions of key terms
- Usage examples
- Cross-references

**When to read**: Don't understand a term? Look it up here.

#### Troubleshooting (`user/troubleshooting.md`)
- Common issues and solutions
- Organized by symptom
- When to contact support

**When to read**: Something not working? Try here.

## Developer Documentation

### Purpose

Technical documentation for developers working on the AIExplorer codebase.

### Target Audience

- Frontend developers
- Backend developers
- DevOps engineers
- Technical architects
- QA engineers

### Sections

#### Setup & Installation (`developer/setup.md`)
- Development environment setup
- Prerequisites and tools
- Configuration
- Running locally
- Database setup

**When to read**: Setting up development environment for the first time.

#### Project Structure (`developer/project-structure.md`)
- How the codebase is organized
- Directory conventions
- File naming standards
- Finding what you need

**When to read**: Learning the codebase layout.

#### System Architecture (`developer/architecture.md`)
- High-level system design
- Data flow diagrams
- Component architecture
- API architecture
- Database design
- Authentication & security flow
- Deployment architecture
- Scaling considerations

**When to read**: Understanding the big picture of how the system works.

#### Component Patterns (`developer/component-patterns.md`)
- React component best practices
- Smart vs presentational components
- Naming conventions
- Reusable patterns
- Type safety
- Common gotchas

**When to read**: Building React components or reviewing components.

#### Database Schema (`developer/database-schema.md`)
- Database tables and columns
- Relationships and constraints
- Stored procedures
- Views and indexes
- Sample queries
- Migration patterns

**When to read**: Working with database or understanding data structure.

#### API Reference (`developer/api-reference.md`)
- Complete endpoint documentation
- Request/response formats
- Authentication
- Error handling
- Rate limiting
- Code examples

**When to read**: Integrating with or working on the API.

#### Authentication (`developer/authentication.md`)
- Azure AD integration
- Token management
- Session handling
- Authorization checks
- Secure credential storage

**When to read**: Working on auth-related features or integrations.

#### Error Handling (`developer/error-handling.md`)
- Error patterns and conventions
- Creating meaningful error messages
- Logging errors
- Error recovery strategies
- Testing error scenarios

**When to read**: Implementing error handling or debugging issues.

#### Development Guide (`developer/development-guide.md`)
- Coding standards and conventions
- Style guide
- Comments and documentation
- Commit message format
- Code review process
- Performance considerations

**When to read**: Before writing code or reviewing others' code.

#### Testing (`developer/testing.md`)
- Unit testing approach
- Integration testing patterns
- End-to-end testing
- Test organization
- Mocking strategies
- Coverage requirements

**When to read**: Writing tests or evaluating test coverage.

#### Performance Optimization (`developer/performance.md`)
- Caching strategies
- Database optimization
- API response optimization
- Frontend performance
- Monitoring performance
- Common bottlenecks

**When to read**: Optimizing performance or investigating slow operations.

#### Security Best Practices (`developer/security.md`)
- Input validation and sanitization
- SQL injection prevention
- CSRF protection
- XSS prevention
- Secure header configuration
- Dependency security

**When to read**: Working on security-related features or security audit.

#### Deployment (`developer/deployment.md`)
- Build process
- Environment configuration
- Deployment checklist
- Rollback procedures
- Monitoring deployments
- Troubleshooting deployment issues

**When to read**: Deploying to production or setting up CI/CD.

#### Contributing (`developer/contributing.md`)
- How to contribute to the project
- Development workflow
- Pull request process
- Code review guidelines
- Branch naming conventions

**When to read**: Making changes or submitting code.

## Navigation Guide

### For New Users

1. Start with [User Guide Index](./user/README.md)
2. Read [Getting Started](./user/getting-started.md)
3. Explore [Dashboard](./user/dashboard.md)
4. Learn how to [Submit Use Cases](./user/submitting-usecases.md)
5. Reference [Glossary](./user/glossary.md) as needed
6. Check [FAQ](./user/faq.md) for quick answers

### For New Developers

1. Start with [Developer Guide Index](./developer/README.md)
2. Follow [Setup & Installation](./developer/setup.md)
3. Learn [Project Structure](./developer/project-structure.md)
4. Study [System Architecture](./developer/architecture.md)
5. Review [Component Patterns](./developer/component-patterns.md)
6. Follow [Development Guide](./developer/development-guide.md)

### Quick Reference by Task

**Submitting a Use Case**
→ [Submitting Use Cases](./user/submitting-usecases.md)

**Managing a Project**
→ [Managing Projects](./user/managing-projects.md)

**Adding a New Feature**
→ [Component Patterns](./developer/component-patterns.md) + [Development Guide](./developer/development-guide.md)

**Understanding the API**
→ [API Reference](./developer/api-reference.md) + [Architecture](./developer/architecture.md)

**Deploying Code**
→ [Deployment](./developer/deployment.md)

**Fixing a Bug**
→ [Error Handling](./developer/error-handling.md) + [Testing](./developer/testing.md)

**Quick Question**
→ [User FAQ](./user/faq.md) or [Developer FAQ](#) (if exists)

## Search Tips

### By Topic

- **Authentication**: See [Getting Started](./user/getting-started.md) (user) or [Authentication](./developer/authentication.md) (developer)
- **Projects**: See [Managing Projects](./user/managing-projects.md) or [Project Structure](./developer/project-structure.md)
- **Database**: See [Database Schema](./developer/database-schema.md) in developer docs
- **API**: See [API Reference](./developer/api-reference.md) in developer docs
- **Errors**: See [Troubleshooting](./user/troubleshooting.md) (user) or [Error Handling](./developer/error-handling.md) (developer)

### By Document Type

**How-To Guides**: [Getting Started](./user/getting-started.md), [Submitting Use Cases](./user/submitting-usecases.md), [Managing Projects](./user/managing-projects.md), [Setup](./developer/setup.md)

**Reference**: [API Reference](./developer/api-reference.md), [Glossary](./user/glossary.md), [Database Schema](./developer/database-schema.md)

**Troubleshooting**: [Troubleshooting](./user/troubleshooting.md) (user), [Error Handling](./developer/error-handling.md) (developer)

**Best Practices**: [Component Patterns](./developer/component-patterns.md), [Development Guide](./developer/development-guide.md), [Security](./developer/security.md)

## Document Conventions

### Code Examples

All code examples are properly formatted and runnable:

```typescript
// Correct format
const example = 'code';
```

### Sections

Each document follows consistent structure:
- Table of Contents
- Introduction/Overview
- Main sections with subsections
- Related documents at bottom
- Examples where applicable

### Formatting

- **Bold** for important terms and definitions
- *Italics* for emphasis
- `Code` for technical terms and snippets
- > Blockquotes for notes and warnings
- Tables for structured information
- Lists for multiple items

### Links

Internal links use relative paths:
```markdown
[Link Text](./path/to/document.md)
[Link with Section](./document.md#section-name)
```

## Maintaining Documentation

### Updating Docs

1. Identify affected documents
2. Update content accurately
3. Update related links
4. Check all cross-references
5. Test links work

### Adding New Documents

1. Choose appropriate section (user or developer)
2. Follow naming convention (kebab-case.md)
3. Create TOC at top
4. Include related documents at bottom
5. Add to relevant index

### Keeping Current

- Review docs when code changes
- Update examples with latest patterns
- Remove outdated information
- Add new best practices
- Collect user feedback

## FAQ About Documentation

### Q: Which docs should I read?

**A**: Depends on your role:
- **Business User**: Start with [User Guide](./user/README.md)
- **Developer**: Start with [Developer Guide](./developer/README.md)

### Q: Where do I find X?

**A**: Use the [Navigation Guide](#navigation-guide) above or search by task.

### Q: Can I suggest improvements?

**A**: Yes! Use the feedback mechanism in the application or contact the development team.

### Q: Are docs always up-to-date?

**A**: We update docs as features change. If you find outdated info, please report it.

---

**Navigation**: [Main Wiki](./README.md) | [User Docs](./user/README.md) | [Developer Docs](./developer/README.md)

**Last Updated**: 2026-02-02
**Version**: 1.0.0
