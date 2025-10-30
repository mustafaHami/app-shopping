# Shopping List Project

This monorepo contains a NestJS backend (API) and an Expo/React Native frontend (mobile app).

---

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Backend (API)](#backend-api)
- [Frontend (App)](#frontend-app)
- [Connecting the Backend to the Database](#connecting-the-backend-to-the-database)
- [Testing Backend-Frontend Communication](#testing-backend-frontend-communication)
- [Troubleshooting](#troubleshooting)

---

## Project Structure

```
api/        # NestJS backend (src, prisma, tests...)
app/        # React Native app with Expo Router (src, app, components...)
```

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (for backend database; can use Supabase)
- (optional) Android/iOS simulator, or physical device, for frontend testing

---

## Backend (API)

### Available Commands (run in `/api`)

- `npm install` — Install dependencies
- `npm run start` — Start backend API (development mode, default port: 3000)
- `npm run start:dev` — Start with hot reloading
- `npm run test` — Run unit tests
- `npm run test:e2e` — Run end-to-end (E2E) tests
- `npm run lint` — Lint API codebase
- `npm run format` — Format API code
- `npx prisma migrate dev` — Run latest DB migrations (see `/api/prisma/schema.prisma`)

### Environment Setup

- Configure your database connection in `/api/prisma/.env` (set `DATABASE_URL`)
- Example for Supabase:
  ```env
  DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
  ```

---

## Frontend (App)

### Available Commands (run in `/app`)

- `npm install` — Install dependencies
- `npm run start` — Launch Expo dev server
- `npm run android` — Launch app in Android emulator
- `npm run ios` — Launch app in iOS simulator
- `npm run web` — Launch web version (browser)
- `npm run lint` — Lint app code

### How it Connects to the Backend

- All API URLs are centralized in `/app/src/constants/api.ts`
- The URL automatically switches for Android/iOS/web (see file for logic)

---

## Connecting the Backend to the Database

- By default, the backend connects to Postgres using the URL in `DATABASE_URL`.
- You can use your own Postgres DB, or create one for free at [Supabase](https://supabase.io).
- After setting your database URL, run:
  ```bash
  cd api
  npx prisma migrate dev
  ```
  This will create/touch tables as specified in `/api/prisma/schema.prisma`.

**Check Connection:**

- If the backend starts without error, and `npx prisma db pull` works, your DB connection is good.
- The backend server must show `Started to port: 3000` in the logs.

---

## Testing Backend-Frontend Communication

- The frontend contains a special "API Test" tab.
- When you run both backend and app (see above), opening this tab will show you a message from the backend root route (`/`).
- If you see an error or no message, check:
  - Backend server is running
  - URL in `/app/src/constants/api.ts` is correct for your environment
  - Device/emulator can access your backend server (see Android notes for `10.0.2.2`)

---

## Troubleshooting

- **Android emulator cannot reach backend?** Use `http://10.0.2.2:3000` instead of `localhost`.
- **Database errors?** Double-check credentials and DB URL in `/api/prisma/.env`, and try `npx prisma migrate dev`.
- **Port conflicts?** Make sure nothing else uses port 3000.
- **CORS/browser errors?** The backend in `main.ts` enables CORS by default; expand as needed for your frontend URL.

---

For detailed development guidelines and rules, see `/app/.cursor/rules/frontend-feature-organization.mdc` and related files.
