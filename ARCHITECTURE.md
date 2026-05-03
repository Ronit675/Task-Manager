# Architecture

Team Task Manager is a single-service MERN application. Express serves the REST API and, in production, the compiled Vite frontend from `dist/`.

## Backend Flow

```txt
HTTP request
  -> server/app.js
  -> route module
  -> middleware
  -> model/query layer
  -> JSON response
```

The backend is intentionally organized by responsibility:

- `server/routes` defines API endpoints and request orchestration.
- `server/middleware` contains authentication and error handling.
- `server/models` defines MongoDB persistence schemas.
- `server/constants` centralizes domain values shared by schemas and validators.
- `server/utils` contains reusable helpers for auth, access control, and async error forwarding.

## Frontend Flow

```txt
src/main.jsx
  -> src/App.jsx
  -> src/app/router.jsx
  -> page components
  -> apiRequest()
```

The frontend keeps API access in `src/lib/api.js`, authentication state in `src/context`, route protection in `src/components/RouteGuards.jsx`, and route-level screens in `src/Pages`.

## Access Model

- Workspace `admin` users can create projects.
- Project `ADMIN` members can manage project metadata, members, and tasks.
- Project `MEMBER` users can view project work and update assigned task status.
- All project and task routes verify membership before returning project data.

## Production Notes

- Runtime secrets must live in environment variables only.
- `.env` and `dist/` are ignored and should not be committed.
- `npm run check` runs the final local verification gate: lint plus production build.
