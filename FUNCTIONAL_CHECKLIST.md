# Functional checklist — ShoppingList (Phase 1)

## Lists

- [x] Create a list (title required) // 2025-10-30: implemented POST /lists API endpoint and CreateListForm component
- [x] Read / list all my lists // 2025-10-30: implemented GET /lists API endpoint and useLists hook with list display
- [x] Update a list title // 2025-10-30: implemented PATCH /lists/:id API endpoint and EditListForm component
- [x] Delete a list // 2025-10-30: implemented DELETE /lists/:id API endpoint and useDeleteList hook
- [x] Search lists by title // 2025-11-01: implemented animated search bar with icon toggle and title filtering

## Items (inside a list) - Dedicated page navigation

- [x] Navigate to list details page when clicking on a list card // 2025-10-31: implemented dynamic route /list/[id] with navigation
- [x] Display all items for the selected list on dedicated page // 2025-10-31: implemented GET /items/list/:listId API and display
- [x] Add an item (title, qty required; unit/note/category optional) on list page // 2025-10-31: implemented POST /items API and CreateItemForm component
- [x] Update an item (title, qty, unit, note, category) on list page // 2025-10-31: implemented PATCH /items/:id API and EditItemForm component
- [x] Delete an item from list page // 2025-10-31: implemented DELETE /items/:id API and delete functionality
- [x] Mark an item as purchased (checked) on list page // 2025-10-31: implemented PATCH /items/:id/toggle API and toggle functionality
- [x] Uncheck an item (unchecked) on list page // 2025-10-31: same as above, toggle handles both

## Validation rules (functional)

- [x] Prevent adding the same item twice in the same list (title-based) // 2025-11-01: implemented duplicate validation in backend (create & update) with 409 error handling in frontend

## Acceptance / UI

- [x] Clear user feedback for each action (success / error) // 2025-11-01: implemented clear error messages with Alert.alert for all item operations
- [x] Clear error when attempting to add duplicates (item or user) // 2025-11-01: implemented 409 conflict error handling with specific duplicate item messages

# Functional checklist — ShoppingList (Phase 2)

## Authentication

- [x] Allow user sign up with email + password (front flow) // 2025-11-14: implemented Supabase auth with signUp service, useSignUp hook, and sign-up screen
- [x] Allow user sign in with email + password (front flow) // 2025-11-14: implemented signIn service, useSignIn hook, and sign-in screen with auth routing
- [x] Store session tokens securely on client (Expo SecureStore) // 2025-11-14: implemented custom storage adapter using Expo SecureStore in supabase client
- [x] Protect backend endpoints by validating JWT from Supabase // 2025-11-14: implemented AuthGuard with Supabase JWT verification, applied to lists, items, and categories routes
- [x] Provide sign-out (revoke session client-side) // 2025-11-14: implemented signOut service and useSignOut hook
- [x] Provide password reset (via Supabase built-in) // 2025-11-14: implemented resetPassword service and useResetPassword hook
- [x] Use authenticated user instead of MOCK_USER_ID // 2025-11-14: updated all API calls to use authenticated user from JWT tokens
- [x] Root layout auth state management // 2025-11-14: implemented auth state listener and automatic redirect to sign-in when not authenticated
- [x] Clear any local user/session state in the app (e.g. `user`, `session`). // 2025-11-14: useSignOut clears session, user, and full React Query cache
- [x] Clear or reset cached data (React Query: clear queries for lists/items). // 2025-11-14: useSignOut resets all query caches
- [x] Redirect the user to a public screen (e.g. login / welcome) after logout. // 2025-11-14: sign out redirects to /sign-in via router.replace()
- [x] Ensure private screens cannot be accessed without a valid session (both frontend guard and backend AuthGuard). // 2025-11-14: automatic redirect + guards on both FE and BE
- [x] After app restart, if no valid session is found, user must stay logged out. // 2025-11-14: session not present on reload keeps user logged out
- [ ] (Optional) Email verification flow (Supabase built-in)
