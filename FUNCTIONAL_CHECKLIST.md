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

# Functional checklist — ShoppingList (Phase 3)

## list sharing + member management + invitations.

### 1. Members screen (for list owner)

- [x] Add a "Members" button in the list detail screen. // 2025-11-19: added people icon in header
- [x] Create a screen that displays:
  - [x] Members (email + role). Members is all member accepted invitation. // 2025-11-19: members screen shows members list
  - [x] Invitations (email + status: pending/declined) // 2025-11-19: invitations section shows all invitations
  - [x] Change role (reader <-> writer) // 2025-11-19: swap icon button to change role
  - [x] Add member // 2025-11-19: FAB button opens invite modal
    - [x] Owner can search a user by email. // 2025-11-19: email input in invite modal
    - [x] If found, owner can send an invitation with a selected role (reader/writer). // 2025-11-19: role selector and send button
- [x] The list creator is implicitly the owner (not stored as a role, not editable). // 2025-11-19: owner stored in list.ownerId, not as ListMember
- [x] Prevent:
  - [x] inviting a user who is already a member // 2025-11-19: backend validation in members.service
  - [x] re-sending an invitation that is still pending // 2025-11-19: backend validation in members.service
- [x] Remove a member (should lose immediate access to the list) // 2025-11-19: trash icon removes member

### 2. Invitations (for invited user)

- [x] Add an "Invitations" screen showing invitations: // 2025-11-19: created invitations tab screen
  - [x] list name // 2025-11-19: shows list title in card
  - [x] proposed role // 2025-11-19: role badge shown (READER/WRITER)
  - [x] status // 2025-11-19: status badge with color coding
- [x] Each invitation must have: // 2025-11-19: buttons shown for pending invitations
  - [x] Accept button // 2025-11-19: green accept button with icon
  - [x] Decline button // 2025-11-19: decline button with confirmation
- [x] Accept → user becomes a member with assigned role, invitation → accepted. // 2025-11-19: backend creates ListMember on accept
- [x] Decline → invitation → declined. User is NOT added to the list. // 2025-11-19: only updates status, no member created
- [x] After choosing one of the two options, We delete the invitation. of the list. // 2025-11-19: invitation deleted from DB after accept/decline

### 3. Permissions in UI

- [x] Reader: // 2025-11-23: permissions enforced in backend and frontend
  - [x] Cannot add/edit/delete items // 2025-11-23: UI hidden, backend checks permission
  - [x] Cannot check/uncheck items // 2025-11-23: checkbox disabled for readers
- [x] Writer: // 2025-11-23: full item access granted
  - [x] Full access to items (except managing members) // 2025-11-23: can add/edit/delete/check items
- [x] Owner: // 2025-11-23: all permissions granted
  - [x] Everything + manage members // 2025-11-23: members button only visible to owner

### 4. Improve list view to visually differentiate Own group and Shared group

On the main lists screen, the user should see both:

- [x] Lists they created (owner) and Lists shared with them (where they are reader or writer) // 2025-11-23: backend returns all accessible lists with userRole
- [x] Badges on each list (e.g. "Owner", "Shared • Reader", "Shared • Writer"), and showing the owner for shared lists. // 2025-11-23: badges added to list cards
- [x] Add three sections ("All","My lists" and "Shared with me"), // 2025-11-23: added filter tabs to quickly switch between all/my/shared lists

## Phase 4 – UX & Speed Optimizations

### Lists Screen

- [x] Replace visible edit/delete buttons with **swipe-left actions** on each list card // 2025-11-29: implemented swipe actions with Swipeable - Primary actions when swiping: **Edit**, **Delete**
- [x] Ensure the **entire list card is tappable** and opens the list items // 2025-11-29: TouchableOpacity wraps entire card
- [x] Keep the UI visually clean by hiding destructive actions (Delete) behind swipe // 2025-11-29: actions hidden until swipe

### Items Screen (Inside a List)

- [x] Add a **Quick Add** row at the top of the items list // 2025-11-29: quick add input field with add button - Single text field: user types the item name and confirms
- [x] When using Quick Add, create the item with: // 2025-11-29: implemented in handleQuickAdd - [x] **Default quantity = 1** // 2025-11-29: hardcoded quantity: 1 - [x] Empty category / notes by default // 2025-11-29: only title and quantity sent
- [x] Add a **"More" / "Details"** action for each item // 2025-11-30: details button (ellipsis icon) next to quick add button - Opens the existing **full item form** // 2025-11-30: EditItemForm now handles both create and edit modes - The **item name is pre-filled** from the quick add // 2025-11-30: item title pre-filled when details button clicked
- [x] Replace current visible edit/delete icon buttons with **swipe-left actions** on each item // 2025-11-29: ItemCard component with Swipeable - Primary actions when swiping: **Edit**, **Delete**
- [x] Keep the existing behavior: checked items move to the bottom section // 2025-11-29: uncheckedItems and checkedItems separated - [x] Option to **collapse / expand purchased items** to reduce scrolling // 2025-11-29: purchasedExpanded state with collapsible section
- [x] On opening a list, **auto-focus the Quick Add field** so the keyboard is ready to type // 2025-11-29: useFocusEffect with timeout + ref.focus()
- [x] Add a small **+ / - quantity control** directly on each item (left side) to quickly increase or decrease quantity without opening the details view // 2025-11-29: ItemCard with quantity controls, updateQuantity hook and API endpoint

### Onboarding & Defaults

- [x] Set **default quantity to 1** when the user does not explicitly choose a quantity // 2025-11-29: CreateItemForm has default '1' value
- [x] Option: create a **default list** (e.g. "My shopping list") automatically for new users // 2025-11-30: auto-creates "My Shopping List" on signup - Reduces steps before adding the first item

# Functional checklist — ShoppingList (Phase 5)

## Item Image Attachments

### Image Picker & Camera

- [x] Allow user to select an image from the device gallery when adding/editing an item // 2025-11-30: implemented ImagePickerModal with expo-image-picker
- [x] Allow user to capture an image using the device camera when adding/editing an item // 2025-11-30: implemented camera launch in ImagePickerModal
- [x] Present a clear choice between gallery and camera when the user wants to attach an image // 2025-11-30: modal with two clear options (Camera/Gallery)

### Item Detail View ("More" / Edit Form)

- [x] Add an "Attach Image" button or section in the item edit form // 2025-11-30: implemented image section at top of EditItemForm
- [x] If an image is already attached: // 2025-11-30: full image management implemented
  - [x] Display the image in the edit form (preview) // 2025-11-30: full width image preview with rounded corners
  - [x] Provide a "Replace Image" action (opens gallery/camera picker) // 2025-11-30: replace button with swap icon
  - [x] Provide a "Remove Image" action (clears the image from the item) // 2025-11-30: remove button with trash icon and confirmation
- [x] If no image is attached: // 2025-11-30: implemented placeholder UI
  - [x] Show a placeholder or empty state // 2025-11-30: dashed border placeholder with image icon
  - [x] Provide an "Add Image" action (opens gallery/camera picker) // 2025-11-30: tappable placeholder opens ImagePickerModal

### Items List View

- [x] Display a small **thumbnail** on the left side of each item card when an image is attached // 2025-11-30: 48x48 rounded thumbnail in ItemCard
- [x] Display a small **placeholder square** on the left side when no image is attached // 2025-11-30: 48x48 dashed placeholder square
- [x] Make the placeholder tappable to quickly open the image picker (gallery/camera choice) // 2025-11-30: placeholder opens ImagePickerModal for quick image attach
- [x] Ensure the thumbnail/placeholder doesn't interfere with existing layout (checkbox, title, quantity controls) // 2025-11-30: properly positioned before checkbox with correct spacing

### Backend & Storage

- [x] Store the image URL or file path in the database (Item model) // 2025-11-30: added imageUrl field to Item model via Prisma migration
- [x] Handle image upload to a storage service (e.g., Supabase Storage, AWS S3, Cloudinary) // 2025-11-30: implemented Supabase Storage integration with uploadImage/deleteImage methods
- [x] Return the image URL in the API responses for items (GET /items, GET /items/:id) // 2025-11-30: imageUrl included in all item responses
- [x] Allow image deletion from storage when the user removes or replaces an image // 2025-11-30: deleteImage endpoint and automatic cleanup on replace

### Validation & UX

- [x] Limit image file size (e.g., max 5MB or 10MB) to prevent performance issues // 2025-11-30: 10MB limit enforced in backend with BadRequestException
- [x] Show a loading indicator while the image is being uploaded // 2025-11-30: loading state in submit button during upload
- [x] Display an error message if the upload fails (network issue, file too large, etc.) // 2025-11-30: Alert.alert for upload errors with error messages
- [x] Ensure images are optimized or compressed before upload (optional but recommended for performance) // 2025-11-30: expo-image-picker quality set to 0.8 and allowsEditing for cropping
