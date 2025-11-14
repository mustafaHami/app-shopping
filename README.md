# Shopping List App

A full-stack shopping list application built with React Native (Expo) and NestJS.

## Features

### Phase 1 (Completed)
- ✅ Create, read, update, and delete shopping lists
- ✅ Add, edit, and delete items within lists
- ✅ Mark items as purchased/unpurchased
- ✅ Search lists by title
- ✅ Organize items by categories
- ✅ Duplicate item validation

### Phase 2 (Authentication - Completed)
- ✅ User authentication with email/password (Supabase)
- ✅ Secure session storage (Expo SecureStore)
- ✅ Protected API endpoints with JWT validation
- ✅ Sign up, sign in, and sign out functionality
- ✅ Password reset flow

## Tech Stack

### Frontend
- **React Native** with Expo Router
- **TypeScript**
- **TanStack Query** (React Query) for data fetching
- **React Hook Form** for form management
- **Zod** for schema validation
- **Supabase** for authentication
- **Expo SecureStore** for secure token storage

### Backend
- **NestJS** framework
- **Prisma ORM** for database management
- **PostgreSQL** database
- **Supabase** for JWT validation

## Prerequisites

- Node.js 20.19.2 or higher
- npm or yarn
- PostgreSQL database
- Supabase account and project

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd shopping-list
```

### 2. Backend Setup

```bash
cd api

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your configuration:
# - DATABASE_URL: Your PostgreSQL connection string
# - SUPABASE_URL: Your Supabase project URL
# - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key

# Run database migrations
npx prisma migrate dev

# Start the development server
npm run dev
```

The API will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env and add your configuration:
# - EXPO_PUBLIC_SUPABASE_URL: Your Supabase project URL
# - EXPO_PUBLIC_SUPABASE_ANON_KEY: Your Supabase anon/public key
# - EXPO_PUBLIC_API_URL: Your backend API URL (default: http://localhost:3000)

# Start the Expo development server
npm start
```

### 4. Supabase Configuration

1. Create a new Supabase project at https://supabase.com
2. Go to Project Settings > API
3. Copy the following values to your `.env` files:
   - **Project URL** → `SUPABASE_URL` (backend) and `EXPO_PUBLIC_SUPABASE_URL` (frontend)
   - **anon/public key** → `EXPO_PUBLIC_SUPABASE_ANON_KEY` (frontend)
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (backend)

4. Enable Email Auth in Supabase:
   - Go to Authentication > Providers
   - Enable "Email" provider
   - Configure email templates if needed

## Project Structure

### Frontend (`/app`)

```
app/
├── app/                      # Expo Router file-based routing
│   ├── (tabs)/              # Tab navigation
│   ├── list/[id].tsx        # List details page
│   └── _layout.tsx          # Root layout
├── src/
│   ├── features/            # Feature-based organization
│   │   ├── auth/           # Authentication feature
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── schemas/
│   │   │   ├── services/
│   │   │   └── types.ts
│   │   ├── lists/          # Lists feature
│   │   ├── items/          # Items feature
│   │   └── categories/     # Categories feature
│   ├── components/          # Global reusable components
│   ├── constants/           # Global constants
│   ├── hooks/              # Global custom hooks
│   └── lib/                # Third-party library configurations
│       └── supabase.ts     # Supabase client setup
```

### Backend (`/api`)

```
api/
├── src/
│   ├── auth/               # Authentication module
│   │   ├── guards/         # Auth guards
│   │   │   └── auth.guard.ts
│   │   ├── decorators/     # Custom decorators
│   │   │   └── current-user.decorator.ts
│   │   ├── auth.module.ts
│   │   └── supabase.service.ts
│   ├── lists/              # Lists module
│   ├── items/              # Items module
│   ├── categories/         # Categories module
│   ├── prisma/             # Prisma module
│   └── main.ts
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Database migrations
```

## Available Scripts

### Backend

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Lint code
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Create and apply migrations

### Frontend

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser
- `npm run lint` - Lint code

## API Endpoints

All endpoints require authentication (Bearer token in Authorization header).

### Authentication
- `POST /auth/signup` - Sign up new user
- `POST /auth/signin` - Sign in user
- `POST /auth/signout` - Sign out user

### Lists
- `GET /lists` - Get all lists for the authenticated user
- `GET /lists/:id` - Get a specific list
- `POST /lists` - Create a new list
- `PATCH /lists/:id` - Update a list
- `DELETE /lists/:id` - Delete a list

### Items
- `GET /items/list/:listId` - Get all items for a list
- `GET /items/:id` - Get a specific item
- `POST /items` - Create a new item
- `PATCH /items/:id` - Update an item
- `PATCH /items/:id/toggle` - Toggle item purchased status
- `DELETE /items/:id` - Delete an item

### Categories
- `GET /categories` - Get all categories

## Authentication Flow

1. User signs up or signs in through the app
2. Supabase returns a JWT access token
3. Token is stored securely using Expo SecureStore
4. Token is automatically attached to all API requests
5. Backend validates token using Supabase Admin API
6. User information is extracted and available in controllers via `@CurrentUser()` decorator

## Development Notes

- The app uses Expo Router for file-based routing
- State management is handled with TanStack Query
- All forms use React Hook Form with Zod validation
- Backend follows feature-based architecture
- Database access is through Prisma ORM
- Authentication is stateless using JWT tokens

## License

[Your License Here]
