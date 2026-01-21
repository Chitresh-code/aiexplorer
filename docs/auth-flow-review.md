# Auth Flow Review (React Best Practices + Web UI Guidelines)

## Scope
- `AIExplorer/components/layout/ProtectedLayout.tsx`
- `AIExplorer/components/providers/app-providers.tsx`
- `AIExplorer/lib/msal.ts`
- `AIExplorer/app/login/page.tsx`
- `AIExplorer/features/auth/components/login-form.tsx`
- `AIExplorer/app/globals.css`

## Reported Symptom
- Login popup shows "Checking authentication..." and never closes. Manually closing it leads to a timeout error.

## Findings and Fixes (Ordered by Severity)

### 1) Popup login can hang when redirected to a protected route (critical)
- Evidence: `AIExplorer/components/layout/ProtectedLayout.tsx:140`, `AIExplorer/components/layout/ProtectedLayout.tsx:155`
- Why it matters: When the popup is redirected back to the app root, `ProtectedLayout` renders a blocking "Checking authentication..." state and can trigger client-side navigation. This can clear the auth response before MSAL finishes, leaving the popup open and `loginPopup` timing out.
- Fix:
  - Use a dedicated, public redirect route for popup flows (example: `/auth/popup`).
  - Add that route to `publicRoutes` so it bypasses `ProtectedLayout`.
  - Pass `redirectUri: "${origin}/auth/popup"` in `loginPopup` (or set `msalConfig.auth.redirectUri` to the callback).
  - Keep the callback route minimal: parse the MSAL response and close the window.

### 2) Missing explicit redirect handling/active account setup (high)
- Evidence: `AIExplorer/components/providers/app-providers.tsx:16`, `AIExplorer/lib/msal.ts:71`
- Why it matters: Without `handleRedirectPromise` and active account selection, `useIsAuthenticated` can stay false and token acquisition may fail even after a successful login, especially across refreshes or when multiple accounts exist.
- Fix:
  - After `initialize()`, call `handleRedirectPromise()` once on app load.
  - Add an event callback for `LOGIN_SUCCESS` / `ACQUIRE_TOKEN_SUCCESS` to `setActiveAccount`.
  - On startup, if no active account is set, call `getAllAccounts()` and select the first.

### 3) `returnTo` is not validated (open redirect risk) (high)
- Evidence: `AIExplorer/app/login/page.tsx:13`
- Why it matters: Any external URL placed in `returnTo` will be used in `router.replace`, enabling an open redirect.
- Fix:
  - Only allow relative, in-app paths (e.g., `returnTo?.startsWith("/") && !returnTo.startsWith("//")`).
  - Otherwise fall back to `/`.

### 4) Login error state is not announced; focus styles are missing (medium, accessibility)
- Evidence: `AIExplorer/features/auth/components/login-form.tsx:35`, `AIExplorer/app/globals.css:2836`
- Why it matters: Screen readers may not announce errors. Keyboard users do not get a visible focus state on the primary button.
- Fix:
  - Add `role="alert"` and `aria-live="polite"` to the error container.
  - Add a `:focus-visible` style for `.login-microsoft-btn` in `AIExplorer/app/globals.css`.

### 5) Legal links are placeholders (medium, UX/compliance)
- Evidence: `AIExplorer/features/auth/components/login-form.tsx:73`
- Why it matters: `href="#"` is a dead link and creates confusing keyboard focus behavior.
- Fix:
  - Replace with real URLs or remove the anchors until routes exist.

### 6) Loading state can remain stuck after a popup failure (low)
- Evidence: `AIExplorer/features/auth/components/login-form.tsx:14`
- Why it matters: If the popup flow fails to resolve, the login button stays disabled with no retry.
- Fix:
  - Use a `finally` block to restore `isLoading`, or add a timeout fallback that re-enables the button with a "Try again" prompt.

## Suggested Validation Steps
- Run the popup login flow and confirm the popup closes after auth (no timeout).
- Confirm `useIsAuthenticated` flips to `true` without a manual refresh.
- Verify `returnTo` only accepts in-app paths.
- Keyboard-tab through the login page to ensure the sign-in button has a visible focus state.

## Notes
- The Web Interface Guidelines normally require fetching the latest rules from Vercel. Network access was unavailable, so the UI review above uses standard accessibility and UX best practices as a fallback.
