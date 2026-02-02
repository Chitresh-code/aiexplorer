# AIExplorer - Enterprise AI Use Case Management Platform

A production-grade Next.js application for managing, tracking, and reporting on enterprise AI initiatives. This repository contains the complete application source code and comprehensive documentation.

## Quick Links

- **Get Started**: [Start Here](./docs/START_HERE.md)
- **User Documentation**: [User Guides](./docs/user/README.md)
- **Developer Documentation**: [Developer Guides](./docs/developer/README.md)
- **Application Repository**: [AIExplorer](./AIExplorer)

## What is AIExplorer?

AIExplorer is an enterprise platform that enables organizations to:

- **Submit and Track** AI use cases from ideation to deployment
- **Manage Stakeholders** across teams and departments
- **Monitor Progress** through defined implementation phases
- **Report Metrics** and measure business impact
- **Build a Gallery** of enterprise AI initiatives
- **Collaborate** with team members and leadership

## Repository Structure

```
.
├── AIExplorer/                 # Main application (Next.js)
│   ├── app/                    # Pages and API routes
│   ├── components/             # React components
│   ├── features/               # Feature modules
│   ├── hooks/                  # Custom hooks
│   ├── lib/                    # Utilities and API client
│   └── config/                 # Configuration constants
│
├── docs/                       # Comprehensive wiki documentation
│   ├── user/                   # User-facing guides
│   │   ├── getting-started.md
│   │   ├── dashboard.md
│   │   ├── submitting-usecases.md
│   │   ├── managing-projects.md
│   │   ├── faq.md
│   │   └── glossary.md
│   │
│   ├── developer/              # Developer guides
│   │   ├── architecture.md
│   │   ├── api-reference.md
│   │   └── component-patterns.md
│   │
│   ├── START_HERE.md          # Documentation entry point
│   ├── README.md              # Wiki homepage
│   └── WIKI_STRUCTURE.md      # Navigation guide
│
└── README.md                   # This file

```

## Documentation Overview

### User Documentation

Complete guides for end users covering:
- Getting started and authentication
- Dashboard navigation and customization
- Submitting and managing use cases
- Project lifecycle management
- Frequently asked questions
- Terminology and glossary

**[→ Browse User Docs](./docs/user/README.md)**

### Developer Documentation

Comprehensive guides for developers including:
- System architecture and design patterns
- Complete API reference with examples
- Component patterns and React best practices
- Database and authentication architecture
- Deployment and production guidelines

**[→ Browse Developer Docs](./docs/developer/README.md)**

## Getting Started

### For Users

1. Visit [Getting Started](./docs/user/getting-started.md) for authentication and setup
2. Explore [Dashboard Guide](./docs/user/dashboard.md) to learn the interface
3. Check [FAQ](./docs/user/faq.md) for common questions

### For Developers

1. Read [Architecture Overview](./docs/developer/architecture.md) to understand the system
2. Review [API Reference](./docs/developer/api-reference.md) for endpoints and integration
3. Study [Component Patterns](./docs/developer/component-patterns.md) for development guidelines
4. Follow the [Development Guide](./AIExplorer/docs/DEVELOPMENT.md) in the app

### For Project Owners

1. Review [PRODUCTION_REFACTOR.md](./AIExplorer/PRODUCTION_REFACTOR.md) for improvements made
2. Check [DEPLOYMENT_CHECKLIST.md](./AIExplorer/DEPLOYMENT_CHECKLIST.md) before going live
3. Consult [CONTRIBUTING.md](./AIExplorer/CONTRIBUTING.md) for team guidelines

## Documentation Statistics

| Section | Documents | Lines | Content |
|---------|-----------|-------|---------|
| User Docs | 7 | 2,033 | Guides, FAQ, glossary |
| Developer Docs | 3+ | 1,844 | Architecture, APIs, patterns |
| App Docs | 9+ | 3,500+ | In-app documentation |
| **Total** | **20+** | **7,400+** | **Complete reference** |

## Key Features

### Application

- **Authentication**: Azure AD integration with MSAL
- **Database**: Azure SQL with stored procedures
- **UI**: Shadcn components with Tailwind CSS
- **State Management**: React hooks and SWR
- **Forms**: React Hook Form with Zod validation
- **API**: Type-safe Axios client with error handling

### Production-Grade Quality

- Strict TypeScript configuration
- Comprehensive ESLint rules
- Prettier code formatting
- Input validation framework
- Security headers configuration
- Error handling and logging
- React Compiler optimization

## Tech Stack

- **Framework**: Next.js 16 with App Router and Turbopack
- **Language**: TypeScript with strict type checking
- **UI**: Shadcn UI and Tailwind CSS
- **Auth**: Azure AD (MSAL)
- **Database**: Azure SQL Database
- **API**: Axios with interceptors
- **Forms**: React Hook Form + Zod
- **Validation**: Custom validators and sanitizers

## Quick Commands

```bash
# Navigate to the application
cd AIExplorer

# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm start                  # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run type-check        # Check TypeScript
npm run format             # Format code
npm run validate           # Run all checks
npm run validate:fix       # Fix all issues
```

## Environment Setup

1. Clone the repository
2. Navigate to the AIExplorer directory: `cd AIExplorer`
3. Install dependencies: `npm install`
4. Create `.env.local` from `.env.example`
5. Configure environment variables
6. Start development: `npm run dev`

See [Getting Started](./docs/user/getting-started.md) for detailed setup instructions.

## Support and Resources

- **User Questions**: Check [FAQ](./docs/user/faq.md) and [Glossary](./docs/user/glossary.md)
- **Development Help**: See [Developer Docs](./docs/developer/README.md)
- **Technical Issues**: Review [API Reference](./docs/developer/api-reference.md) and [Architecture](./docs/developer/architecture.md)
- **Deployment**: Check [DEPLOYMENT_CHECKLIST.md](./AIExplorer/DEPLOYMENT_CHECKLIST.md)

## Contributing

Please read [CONTRIBUTING.md](./AIExplorer/CONTRIBUTING.md) for:
- Code style guidelines
- Commit message conventions
- Pull request process
- Development workflow

## License

[Your License Here]

---

**Last Updated**: February 2, 2026  
**Documentation Version**: 1.0  
**Application Version**: 1.0 (Production-Grade Refactor)
