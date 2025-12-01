# Environment Setup

## Overview

The app now supports multiple environments (development and production) through environment variables.

## Environment Files

- `.env` - Default & Dev environment (gitignored, local only)
- `.env.production` - Production environment (Railway backend)

## Environment Variables

- `EXPO_PUBLIC_API_URL` - The backend API URL

## Usage

### Development (Local Backend)

Use the default scripts to run with your local backend:

```bash
npm start              # Start Expo with local backend
npm run android        # Run on Android with local backend
npm run ios            # Run on iOS with local backend
npm run web            # Run on web with local backend
```

### Production (Railway Backend)

Use the `:prod` scripts to run with the production backend:

```bash
npm run start:prod     # Start Expo with production backend
npm run android:prod   # Run on Android with production backend
npm run ios:prod       # Run on iOS with production backend
npm run web:prod       # Run on web with production backend
```

## Production Backend URL

Your production backend is deployed at: `https://app-shopping-production.up.railway.app`

## Notes

- When using production backend, make sure it's running and accessible
- The app will automatically use the appropriate URL based on the script you run
- Environment variables are loaded at build time, so you need to restart the dev server when changing them
