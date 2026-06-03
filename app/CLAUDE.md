# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Architecture

**Three-layer architecture** with one-way data flow (top to bottom only):

| Layer | Runs On | Components | May Import | Must NOT Import |
|-------|---------|------------|------------|-----------------|
| **Frontend** | Browser | Components, Hooks, States | React, Zod, Jotai, Actions | Drizzle, Integrations, server-only |
| **Backend** | Server | Actions, Routes | Integrations, auth utilities | React, Jotai, direct DB access |
| **Infrastructure** | Server | Integrations, Models | Drizzle, external APIs | React, Actions, Hooks |

## Project Structure

```
app/
  /(landing-page)/     # Public pages (NO auth)
  /(app)/              # Authenticated pages (LOGIN REQUIRED)
  /admin/              # Admin pages (LOGIN + ADMIN ROLE)
  /auth/               # Auth pages (signin, signup, etc.)
  /api/                # API routes
db/                    # Schema + migrations
lib/                   # Utilities, auth, testing libs
shared/                # Models + Integrations
components/ui/         # shadcn/ui components
```

### Behavior Structure

Features are organized by behavior:

```
app/[page]/behaviors/[behavior-name]/
  [behavior-name].action.ts      # Server action (atomic)
  route.ts                       # Route endpoint (streaming)
  use-[behavior-name].ts         # React hook
  state.ts                       # Behavior-specific state (optional)
  tests/
    [behavior-name].spec.ts      # E2E test
    [behavior-name].action.test.ts
    [behavior-name].route.test.ts
```

A behavior has either an action OR a route, not both.

## File Naming

| Type | Pattern |
|------|---------|
| Server actions | `[name].action.ts` |
| Routes | `route.ts` |
| React hooks | `use-[name].ts` |
| Components | `[Name].tsx` |
| E2E tests | `[name].spec.ts` |
| Action tests | `[name].action.test.ts` |
| Route tests | `[name].route.test.ts` |
| State files | `state.ts` |

## Commands

```bash
# Dev
npm run dev

# Testing
npm run test             # Unit tests
npm run spec             # Playwright E2E tests
```

## Testing

**Philosophy**: Test real code with real database, minimal mocking.

**Rules**:
- NO mocking in Playwright tests
- NO `toHaveBeenCalled` — test outcomes, not implementation
- USE test database, not mocks
- Start with ONE test, expand later
- Use PreDB/PostDB for deterministic state

## Authentication

**Supabase Auth** via `@supabase/ssr`:
- Clients: `lib/supabase/server.ts`, `lib/supabase/client.ts`
- Middleware: `lib/supabase/middleware.ts` guards `/(app)/*` and `/admin/*`

## Design System

Before writing any UI code:
- Check `components/` subdirectories for existing components
- Use semantic color tokens (`bg-primary`, `text-muted-foreground`) — never hardcode colors
- Use shadcn/ui primitives before creating custom components

## Package Management

Default: **npm**. Project was scaffolded by `gpl init` with `--pm` flag preserving choice.
