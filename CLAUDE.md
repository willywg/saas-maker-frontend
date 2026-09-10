# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server on localhost:5190
npm run build    # Type check + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
npm run typecheck # Type check only
npm test         # Vitest + Testing Library (src/**/*.test.tsx)
npm run audit    # npm audit (fails on high/critical)
npm run upgrade  # Bump all deps with npm-check-updates, install, audit
```

Requires Node 24 (see `.nvmrc`, `nvm use`).

## Environment Setup

Copy `.env.example` to `.env` and configure:
```
VITE_API_BASE_URL=http://localhost:8090  # Backend API URL
```

## Design

Follow `../DESIGN.md` (root of the monorepo) for colors, type, spacing and component rules. Palette lives in `src/index.css`; brand color is `--brand-hue`. Never hard-code colors in components.

## Architecture

### Tech Stack
- React 19 + TypeScript + Vite
- TanStack React Query for server state
- React Router 8 (`react-router`, sin `react-router-dom`) for routing
- React Hook Form + Zod for forms
- Shadcn/ui (Radix) + Tailwind CSS 4 for UI
- Axios with interceptors for API calls

### Directory Structure
```
src/
├── components/
│   ├── ui/           # Shadcn/ui primitives
│   ├── layout/       # AppLayout, AuthLayout, Sidebar, Header
│   ├── auth/         # ProtectedRoute
│   └── features/     # Feature-specific components (organization/, projects/)
├── pages/            # Route page components
├── hooks/            # useAuth, useOrganization, useMembers, useProjects, useDebounce
├── lib/              # api-client.ts, utils.ts
├── router/           # React Router configuration
└── types/            # TypeScript interfaces (api.ts)
```

### Authentication Flow
- Tokens stored in localStorage (`access_token`, `refresh_token`)
- `lib/api-client.ts` handles automatic token injection and 401 refresh. Refresh tokens
  rotate: always store the `refresh_token` returned by `/auth/refresh`
- Logout revokes the refresh token server-side (`POST /auth/logout`); "cerrar sesión en
  todos los dispositivos" lives in `AccountPage` (`POST /auth/logout-all`)
- Multi-org: `hooks/useUserOrganizations.ts` lists memberships and switches the session
  (`OrganizationSwitcher` in the sidebar). Switching clears the React Query cache
- Email verification: `EmailVerificationBanner` shows until `user.email_verified`;
  `/verify-email/:token` confirms the link
- Login endpoint expects form-data with `username` field (not `email`)
- Role hierarchy: owner (3) > admin (2) > member (1)

### Key Patterns

**React Query Usage:**
- Query keys: `['auth', 'me']`, `['organization']`, `['members']`, `['projects', params]`
- 5-minute stale time configured globally
- Mutations auto-invalidate related queries

**Protected Routes:**
```tsx
<ProtectedRoute requiredRole="admin">
  <Component />
</ProtectedRoute>
```

**API Error Shape:**
```ts
{ detail: string, status_code?: number }
```

### Routes
- `/login`, `/register` - Public auth pages
- `/invite/:token` - Public invite acceptance
- `/forgot-password`, `/reset-password/:token`, `/verify-email/:token` - Public token flows
- `/dashboard` - Main dashboard (authenticated)
- `/organization` - Team management (admin+ only)
- `/projects` - Reference tenant-scoped CRUD (any member reads; admin+ writes)
- `/account` - Profile, password, sessions

### Adding New Features
Copy the `projects` module: `types/api.ts` (Project types), `hooks/useProjects.ts`,
`components/features/projects/` (list with the four states, form dialog, delete dialog,
status badge), `pages/ProjectsPage.tsx` and its test. Insert at the `// generator:*` anchors
in `router/index.tsx`, `components/layout/Sidebar.tsx` and `types/api.ts`. Copy in Spanish,
sentence case, following `../DESIGN.md`.
1. Create page in `src/pages/`
2. Add route in `src/router/index.tsx`
3. Create hooks in `src/hooks/` for API calls
4. Add feature components in `src/components/features/<feature>/`
5. Update Sidebar navigation if needed
6. Add a test next to the component/page (`*.test.tsx`, use `src/test/render.tsx`)
