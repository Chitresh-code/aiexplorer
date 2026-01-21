# Next.js API Migration Plan

## Goal
Move the FastAPI endpoints in `backend/` into Next.js App Router API routes in
`frontend/` while keeping the current REST contract used by
`frontend/lib/api.ts`.

## Steps
1. Inventory endpoints and schemas
   - Review `backend/app/api/routers/*.py` and `frontend/lib/api.ts`.
   - Document paths, methods, request bodies, and response shapes.
2. Pick the data-access strategy
   - Rebuild the SQLAlchemy models and queries from `backend/app/models` and
     `backend/app/services` in Node (Prisma or `mssql`/`tedious`).
   - Mirror environment variables from `backend/app/core/config.py` into
     `frontend/.env`.
3. Create a server-only service layer
   - Add a Node service layer (for example `frontend/lib/server/*`) for DB
     access and domain logic.
   - Keep API route handlers thin and reuse shared logic.
4. Build Next.js route handlers
   - Create `frontend/app/api/.../route.ts` for `usecases`, `metrics`, `updates`,
     `decisions`, `lookups`, `kpis`, and `health`.
   - Match FastAPI paths, status codes, and error messages.
5. Auth and middleware parity
   - Port MSAL/AAD token validation and enforce it in route handlers.
   - Remove CORS handling since the API becomes same-origin.
6. Update the frontend API client
   - Switch `frontend/lib/api.ts` to a relative base URL (for example `/api`).
   - Drop cross-origin fallbacks once the internal API is live.
7. Decommission FastAPI
   - Remove the `backend/` runtime from dev and prod scripts.
   - Update docs and deployment manifests to only run Next.js.
8. Test and validate
   - Add a smoke test list or scripts to hit each endpoint.
   - Compare responses with the current FastAPI output.

## Risks / Notes
- Long-running or heavy operations may need background jobs or queue workers.
- If you still need CSV-backed data (the current `api/` Express service), port
  the logic from `api/src/services` into the new server layer or keep it as a
  separate data source.
