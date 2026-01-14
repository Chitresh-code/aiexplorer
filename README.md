# AI Hub 🚀

AI Hub is a powerful, full-stack enterprise platform designed to manage the entire lifecycle of AI use cases. From ideation and design to implementation and tracking, AI Hub provides a centralized dashboard for AI Champions and users to collaborate on and monitor AI initiatives.

## ✨ Key Features

- **Champion Dashboard**: High-level overview of all AI initiatives with interactive charts and KPI metrics.
- **Use Case Lifecycle Management**: Track progress across Idea, Diagnose, Design, and Implemented phases.
- **Dynamic Metrics Reporting**: Create and report on custom success metrics for each use case.
- **Role-Based Views**: Specialized screens for AI Champions and standard users.
- **Enterprise-Grade Auth**: Integrated with Microsoft Azure AD (MSAL) for secure single sign-on.
- **Modern UI/UX**: Built with a custom design system using Shadcn UI and Tailwind CSS.

## 🛠️ Technology Stack

### Frontend
- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Components**: [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: React Hooks & Context API
- **Table System**: [TanStack Table v8](https://tanstack.com/table)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Framework**: [FastAPI (Python)](https://fastapi.tiangolo.com/)
- **Validation**: [Pydantic v2](https://docs.pydantic.dev/)
- **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/)
- **Database**: Azure SQL Database
- **Authentication**: Azure Active Directory (MSAL)

---

## 🏗️ Project Structure

The project follows a **Feature-Based Architecture**, ensuring scalability and clear separation of concerns.

```text
AI Hub/
├── backend/                  # FastAPI Python Backend
│   ├── app/
│   │   ├── api/              # API Routers & Endpoints
│   │   ├── core/             # Config, Security, Auth logic
│   │   ├── models/           # SQLAlchemy Models
│   │   └── schemas/          # Pydantic Schemas
│   ├── main.py               # Entry Point
│   └── requirements.txt      # Python Dependencies
│
├── frontend/                 # Next.js Frontend
│   ├── app/                  # App Router (Next.js Routing Layer)
│   ├── features/             # Feature-Based Modules (Logic + UI)
│   │   ├── dashboard/        # Dashboard KPIs & Charts
│   │   ├── navigation/       # Sidebar, Headers, Nav logic
│   │   └── ...
│   ├── components/
│   │   ├── ui/               # Generic Shadcn UI components
│   │   └── shared/           # Reusable domain-specific components
│   ├── hooks/                # Global React Hooks
│   ├── lib/                  # Utilities, API clients, Constants
│   └── public/               # Static Assets
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **npm** or **pnpm**

### 2. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```
*Configure your `.env` file based on the environment variables required.*

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Running Locally
**Start Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at http://localhost:3000.

---

## 📝 Available Scripts

### Frontend
- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server.
- `npm run lint`: Runs ESLint for code quality checks.

### Backend
- `uvicorn main:app --reload`: Starts the FastAPI server with hot-reload.
- `python seed_data.py`: Seeds the database with initial developer data.

---

## 🤝 Contributing
1.  **Plan**: Follow the feature-based structure for new additions.
2.  **UI**: Use Shadcn components and maintain the teal/slate color scheme.
3.  **API**: Ensure all new endpoints are documented in the Swagger UI (`/docs`).

---

## 📄 License
Internal Application - All Rights Reserved. ukg-ai-hub team.

