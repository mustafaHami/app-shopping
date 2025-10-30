# Functional checklist — ShoppingList (Phase 1)

## Lists

- [x] Create a list (title required) // 2025-10-30: implemented POST /lists API endpoint and CreateListForm component
- [x] Read / list all my lists // 2025-10-30: implemented GET /lists API endpoint and useLists hook with list display
- [x] Update a list title // 2025-10-30: implemented PATCH /lists/:id API endpoint and EditListForm component
- [x] Delete a list // 2025-10-30: implemented DELETE /lists/:id API endpoint and useDeleteList hook

## Items (inside a list)

- [ ] Add an item (title, qty required; unit/note/category optional)
- [ ] List items in a list
- [ ] Update an item (title, qty, unit, note, category)
- [ ] Delete an item

## Checked / unchecked

- [ ] Mark an item as purchased (checked)
- [ ] Uncheck an item (unchecked)

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
