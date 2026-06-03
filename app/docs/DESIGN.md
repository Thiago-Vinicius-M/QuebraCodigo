# Design System

Lightweight entry point to the design system for AI workflows. This file contains **zero values** — only file paths. Read the actual source files for current values.

## Where to Find Things

| What | Location |
|------|----------|
| Available components | `app/styleguide/navigation.ts` |
| Design tokens | `app/globals.css` |
| Component source | `components/` (check subdirectories: `ui/`, etc.) |
| Component docs | `app/styleguide/components/[name]/page.tsx` |

## Before Writing UI Code

1. Read `app/styleguide/navigation.ts` — find existing components
2. Check `components/` subdirectories for existing components — never recreate
3. Read `app/globals.css` — use only defined tokens

## Rules

- Never hardcode colors — use CSS variables from globals.css
- Never recreate components — compose from existing
- New shared components must be added to styleguide + navigation.ts
