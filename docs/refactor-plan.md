# Portfolio Refactor Plan

## Goals

- Clear separation of concerns between public experience and admin tooling.
- All public content sourced dynamically from centralized database tables managed via admin.
- Feature-based folder layout to improve scalability and maintainability.
- Remove unused code, dependencies, and configuration drift.
- Preserve current visual design and behaviour.

## Target Directory Structure

```
src/
  app/
    (public)/
      layout.tsx
      routes/...
    (admin)/
      layout.tsx
      routes/...
    api/ (transition to server actions where feasible)
  shared/
    ui/            # design system primitives (Button, Input, Card, etc.)
    lib/           # cross-cutting utilities (env, logger, storage)
    config/        # feature toggles, constants
  entities/
    projects/
      model.ts     # typed entity definitions
      repository.ts
      mappers.ts
    articles/
    certifications/
    home/
    about/
  features/
    projects/
      public/
        components/
        routes/
      admin/
        components/
        routes/
      api/
        actions.ts
    articles/
    certifications/
    auth/
      components/
      hooks/
      server/
  processes/
    auth/
      middleware.ts
      guards.ts
    uploads/
  docs/
    baseline/
    decisions/
```

## Refactor Phases

### Phase 1 – Foundations

- Move shared utilities (auth, env, R2) under `shared/lib`.
- Introduce `entities` layer with Drizzle mappers for each table.
- Convert public pages to Server Components consuming entity repositories.
- Centralise NextAuth configuration + guards in `features/auth/server`.

### Phase 2 – Public Content Harmonisation

- Home/About/Projects/Articles/Certifications pages fetch from repositories rather than hard-coded data.
- Create `features/*/public/components` to house display UI, with data injected via props.
- Add loading/error states leveraging Suspense where appropriate.

### Phase 3 – Admin Workflow Cleanup

- ✅ Relocated admin route group to `app/(admin)/admin` and updated imports/middleware to follow the new structure.
- ✅ Introduced `features/certifications/admin` module with shared UI, type mappers, and request helpers as the first feature extraction.
- ✅ Added `features/projects/admin` helpers and refactored admin project screens to consume entity-backed APIs.
- ✅ Extracted article source management into `features/articles/admin` with shared form helpers and API utilities powering the admin list.
- ✅ Added `features/home/admin` with form helpers + API wrappers and refactored the admin home editor to consume them.
- ✅ Introduced `features/about/admin` and reworked the about editor to share typed form helpers + API utilities.
- ✅ Centralised shared admin UI primitives (Button, ConfirmationDialog, ProfileImageEditor) under `shared/ui` and feature modules.
- ✅ Migrated home/about admin updates to feature-level server actions with shared entity payloads.
- ✅ Shifted projects and certifications admin mutations to server actions with cache revalidation.
- ✅ Article source mutations now run through server actions; remaining REST posts limited to image upload endpoints.
- ✅ Profile image upload/delete now uses feature-level server actions shared across Home/About editors.
- Deduplicate forms using shared form controls in `shared/ui/forms`.
- Ensure all create/update/delete operations use typed server actions that update the same repositories powering public pages.

### Phase 4 – API & Middleware Rationalisation

- Replace bespoke REST endpoints with feature-level server actions invoked from admin components. Keep REST only where external clients rely on it (documented in API inventory).
- Align middleware with new route groups (`(public)`, `(admin)`, `(auth)`), using guard utilities.

### Phase 5 – Cleanup & Verification

- Remove deprecated components (Clerk remnants, backup sign-in screens, unused admin variants. etc).
- Prune dependency tree (`npm prune`, manual verification).
- Run `baseline:capture` to record post-refactor visuals and compare with initial baseline.
- Update README with new architecture overview and operational instructions.

## Open Questions

- Should public API endpoints remain for third-party consumption? (If yes, keep separate controller layer.)
- Are there any static assets (e.g. resume download) that must stay file-based rather than DB entries?
- Do we need multi-admin support beyond allow-listed addresses? (Impacts auth design.)

Document updates will accompany each phase with ADR entries under `docs/decisions/`.
