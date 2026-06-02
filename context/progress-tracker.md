# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Completed: Feature 01-install-package, Feature 02-prepare-test-asset

## Current Goal

- Develop backend and WebSocket connection (Feature 03-setup-backend).

## Completed

- Feature: 01-install-package (Installed `hono`, `@supabase/supabase-js`, `ioredis`, `lucide-react`, and initialized `shadcn/ui` with Tailwind CSS v4 support)
- Feature: 02-prepare-test-asset (Built full-scene HTML5 Canvas 2D simulator using `TXjh2o.png`, mapped 19x19 walkable/obstacle collision grid, added keyboard control pilot avatar with smooth LERP interpolation, and click-detecting TodoList interactive whiteboard)
- Feature: 03-setup-backend (Separated Standalone Node.js Hono Server with Clean Architecture, Awilix DI, ioredis queue, and Supabase integration)

## In Progress

- None.

## Next Up

- (Next feature spec defined in the project road map)


## Open Questions

- None.

## Architecture Decisions

- Stack packages confirmed and initialized:
  - Framework: Next.js 16.2.7
  - Backend integration: `hono`
  - Database: `@supabase/supabase-js`
  - Message Queue: `ioredis`
  - UI Styling and Components: Tailwind CSS v4 + `shadcn/ui` (nova style)

## Session Notes

- Packages successfully installed, shadcn initialized, and project build passes cleanly. Ready to proceed to next task.
