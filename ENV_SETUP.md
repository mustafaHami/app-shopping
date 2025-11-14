# Environment Variables Setup

This document describes the environment variables required for both the frontend and backend of the Shopping List application.

## Backend Environment Variables (`/api/.env`)

Create a `.env` file in the `/api` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/shopping_list"

# Supabase Configuration
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Server Configuration
PORT=3000
NODE_ENV=development
```

### Where to find these values:

1. **DATABASE_URL**: Your PostgreSQL connection string
   - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`

2. **SUPABASE_URL**: Your Supabase project URL
   - Found in: Supabase Dashboard → Project Settings → API → Project URL

3. **SUPABASE_SERVICE_ROLE_KEY**: Your Supabase service role key (⚠️ Keep this secret!)
   - Found in: Supabase Dashboard → Project Settings → API → Project API keys → service_role
   - **Important**: This key has admin privileges. Never expose it in frontend code or public repositories.

## Frontend Environment Variables (`/app/.env`)

Create a `.env` file in the `/app` directory with the following variables:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"

# API Configuration
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

### Where to find these values:

1. **EXPO_PUBLIC_SUPABASE_URL**: Your Supabase project URL (same as backend)
   - Found in: Supabase Dashboard → Project Settings → API → Project URL

2. **EXPO_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon/public key
   - Found in: Supabase Dashboard → Project Settings → API → Project API keys → anon/public
   - This key is safe to use in frontend code as it has limited permissions

3. **EXPO_PUBLIC_API_URL**: Your backend API URL
   - Development: `http://localhost:3000`
   - For Android emulator: `http://10.0.2.2:3000`
   - Production: Your deployed API URL

## Supabase Setup

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Enable Email Authentication:
   - Go to Authentication → Providers
   - Enable the "Email" provider
4. Copy your API credentials from Project Settings → API
5. Add the credentials to your `.env` files

## Security Notes

- ⚠️ **Never commit `.env` files to version control**
- ⚠️ **Never expose service_role key in frontend code**
- ⚠️ Use `EXPO_PUBLIC_` prefix only for variables that should be accessible in frontend
- ⚠️ Keep service_role key secure - it has full admin access to your Supabase project
- ✅ Use anon/public key in frontend - it's designed for client-side use
- ✅ Add `.env` to your `.gitignore` file

## Testing the Setup

After setting up environment variables:

1. Backend:

   ```bash
   cd api
   npm run dev
   ```

   - Should start without errors
   - Check console for "Listening on port 3000"

2. Frontend:
   ```bash
   cd app
   npm start
   ```

   - Should start without errors
   - Try to sign up/sign in to test authentication

## Troubleshooting

### "Supabase URL and Service Role Key must be provided"

- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set in `/api/.env`
- Make sure there are no typos in variable names
- Restart the backend server after changing `.env`

### "Authorization header missing" or "Invalid token"

- Check that `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set in `/app/.env`
- Make sure you're signed in and token is being sent
- Check that backend `SUPABASE_URL` matches frontend `EXPO_PUBLIC_SUPABASE_URL`
- Restart Expo development server after changing `.env`

### Connection issues on Android emulator

- Change `EXPO_PUBLIC_API_URL` to `http://10.0.2.2:3000` instead of `localhost:3000`
- Android emulator uses `10.0.2.2` to refer to the host machine's localhost
