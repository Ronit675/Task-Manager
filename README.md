# Team Task Manager

Full-stack MERN task manager for teams. Users can sign up, create projects, add members, assign tasks, and track status and overdue work from a single dashboard.

## Stack

- React + Vite frontend
- Express REST API
- MongoDB + Mongoose
- JWT authentication
- Role-based access at the project level: `ADMIN` and `MEMBER`

## Features

- Signup and login
- Protected dashboard
- Project creation and status management
- Team member invite/update by email
- Task creation, assignment, priority, and status tracking
- Dashboard summary for total tasks, assigned tasks, overdue tasks, and status buckets

## Role rules

- `ADMIN`
  - Create projects
  - Update project metadata and project status
  - Add or update project members
  - Create tasks
  - Update any task in the project
- `MEMBER`
  - View projects they belong to
  - View project tasks
  - Update the status of tasks assigned to them

## Environment

Create a `.env` file in the project root:

```env
PORT=5001
MONGODB_URI=
JWT_SECRET=replace-with-a-long-random-string
CLIENT_URL=http://localhost:5173
```

Frontend API base URL defaults to `/api` in local development and is proxied by Vite to `http://localhost:5001`.

If you want a different backend URL, create `.env.local` for Vite:

```env
VITE_API_URL=http://localhost:5001/api
```

For Railway, set these environment variables in the Railway dashboard instead of committing `.env`:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=replace-with-a-long-random-string
CLIENT_URL=https://your-railway-domain.up.railway.app
NODE_ENV=production
```

## Scripts

- `npm run dev` starts the Vite frontend
- `npm run server` starts the Express API
- `npm run server:watch` starts the Express API with file watching
- `npm run start` starts the Express API
- `npm run lint` runs ESLint on frontend and backend files
- `npm run build` builds the frontend

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start MongoDB locally.

3. In one terminal, start the API:

```bash
npm run server
```

4. In another terminal, start the frontend:

```bash
npm run dev
```

5. Open the Vite URL printed in the terminal, usually `http://localhost:5173`.

## Railway deployment

This repository is set up for a single Railway service that serves both the API and the built React app from Express.

1. Push your code to GitHub and create a new Railway project from that repository.
2. Add these Railway variables:

```env
MONGODB_URI=your-mongodb-atlas-connection-string
JWT_SECRET=replace-with-a-long-random-string
CLIENT_URL=https://your-railway-domain.up.railway.app
NODE_ENV=production
```

3. Set the Railway build and start commands:

```bash
npm run build
npm run start
```

4. Deploy and verify:
  - `GET /api/health` should return `{"status":"ok"}`
  - Visiting the Railway domain should load the frontend

5. If you use a custom domain, add that domain to `CLIENT_URL`.

## API summary

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `POST /api/projects/:projectId/members`
- `GET /api/projects/:projectId/tasks`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/tasks/:taskId`
