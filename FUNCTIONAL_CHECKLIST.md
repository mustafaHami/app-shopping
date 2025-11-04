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

## Sharing / Members

- [ ] Invite/add a user to a list via their email
- [ ] List members of a list
- [ ] Remove a member from a list

## Validation rules (functional)

- [ ] Prevent adding the same item twice in the same list (title-based)
- [ ] Prevent adding the same user twice in the same list (email-based)

## Acceptance / UI

- [ ] Clear user feedback for each action (success / error)
- [ ] Clear error when attempting to add duplicates (item or user)
