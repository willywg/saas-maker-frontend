# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start dev server on localhost:5190
npm run build    # Type check + production build
npm run lint     # Run ESLint
npm run preview  # Preview production build
npm run typecheck # Type check only
npm run audit    # npm audit (fails on high/critical)
npm run upgrade  # Bump all deps with npm-check-updates, install, audit
```

Requires Node 24 (see `.nvmrc`, `nvm use`).

## Environment Setup

Copy `.env.example` to `.env` and configure:
```
VITE_API_BASE_URL=http://localhost:8090  # Backend API URL
```

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
│   └── features/     # Feature-specific components (organization/)
├── pages/            # Route page components
├── hooks/            # useAuth, useOrganization, useMembers
├── lib/              # api-client.ts, utils.ts
├── router/           # React Router configuration
└── types/            # TypeScript interfaces (api.ts)
```

### Authentication Flow
- Tokens stored in localStorage (`access_token`, `refresh_token`)
- `lib/api-client.ts` handles automatic token injection and 401 refresh
- Login endpoint expects form-data with `username` field (not `email`)
- Role hierarchy: owner (3) > admin (2) > member (1)

### Key Patterns

**React Query Usage:**
- Query keys: `['auth', 'me']`, `['organization']`, `['members']`
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
- `/dashboard` - Main dashboard (authenticated)
- `/organization` - Team management (admin+ only)

### Adding New Features
1. Create page in `src/pages/`
2. Add route in `src/router/index.tsx`
3. Create hooks in `src/hooks/` for API calls
4. Add feature components in `src/components/features/<feature>/`
5. Update Sidebar navigation if needed
