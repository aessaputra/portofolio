# API Route Inventory (Pre-refactor)

## Authentication
- ~~`POST /api/auth/send-magic-link`~~ (replaced by server actions)
- `POST /api/auth/check-admin-email`
- `POST /api/auth/logout`
- `GET /api/auth/session`
- `GET`/`POST /api/auth/[...nextauth]`

## Public Content
- `GET /api/projects`
- `GET /api/articles`
- `GET /api/certifications`

## Admin Namespaces
- ~~`/api/admin/home-content`~~ (replaced by feature server actions)
- ~~`/api/admin/about-content`~~ (replaced by feature server actions)
- `/api/admin/projects`
- ~~`/api/admin/projects/upload-image`~~ (replaced by server actions)
- ~~`/api/admin/articles`~~ (replaced by server actions)
- ~~`/api/admin/certifications`~~ (replaced by server actions)
- ~~`/api/admin/certifications/upload-image`~~ (replaced by server actions)
- `/api/admin/profile-image/upload`
- `/api/admin/profile-image/delete`
- `/api/admin/ssl-certificates`

During the refactor, each endpoint should be evaluated for consolidation into feature-specific server modules or Server Actions where appropriate.
