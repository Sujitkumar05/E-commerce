# Admin frontend structure

The admin interface is implemented as a separate feature area inside the existing Angular application. The customer storefront routes and pages remain separate.

## Routes
- `/admin/login` — admin sign-in screen
- `/admin/dashboard` — operational overview
- `/admin/products` — product catalogue and stock preview
- `/admin/categories` — category overview
- `/admin/orders` — order and fulfilment overview
- `/admin/customers` — customer overview
- `/admin/reports` — reporting preview
- `/admin/settings` — store settings and security readiness

## Folder rules
- `src/app/features/admin/layouts/admin-layout/`: admin-only shell, sidebar and top navigation
- `src/app/features/admin/pages/<page>/`: page-specific TypeScript, HTML and SCSS files
- `src/app/core/guards/admin.guard.ts`: UI route guard checking the authenticated role
- `src/app/core/auth/auth.service.ts`: current shared demo authentication service

Keep admin-specific components and styles under `features/admin`; do not place them in the storefront component folders. Shared authentication remains in `core`.

## Important delivery limitation
This is a frontend scaffold with sample data. The demo login is `admin@dista.demo` / `AdminDemo123!`. These credentials are embedded in frontend code for local preview only and are NOT secure production authentication. Before client production delivery, connect the login to a backend, enforce authorization on every protected API, use secure session/token handling, replace sample data with APIs, and implement real CRUD, audit logging and tests. The admin guard is a navigation aid, not a security boundary.
