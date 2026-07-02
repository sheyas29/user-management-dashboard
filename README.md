# User Management Dashboard

A React + Vite app for viewing, adding, editing, and deleting users against the
[JSONPlaceholder](https://jsonplaceholder.typicode.com) `/users` API, with
client-side search, filter, sort, and pagination.

## Stack

- Vite + React
- Axios for HTTP requests
- Tailwind CSS v4

## Setup & Run

```bash
git clone <this-repo-url>
cd <repo-folder>
npm install
npm run dev
```

The app runs at `http://localhost:5173` by default.

To run the production build locally:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/   → UserTable, UserForm, SearchBar, FilterPopup, Pagination
  hooks/        → useUsers.js (data fetching + CRUD state)
  services/     → api.js (axios calls to JSONPlaceholder)
  utils/        → parseUser.js (API → app shape mapping),
                   queryUsers.js (pure search/filter/sort/paginate helpers)
  App.jsx       → orchestrates state, wires everything together
```

## Assumptions

- **JSONPlaceholder doesn't persist writes.** POST always echoes back `id: 11`
  regardless of payload, and PUT/DELETE don't actually change server data. So
  `addUser`/`modify`/`removeUser` treat the locally-entered form data as the
  source of truth and update local state directly rather than trusting the
  API response body. New users get a client-generated numeric ID by finding the maximum existing ID from the initial API fetch and incrementing it, avoiding collisions since the API's echoed ID isn't usable.
- **`company.name` is used as "Department"**, since JSONPlaceholder's user
  objects don't have a real department field.
- Some seed users (e.g. id 6) have a title prefix in their `name` field
  (e.g. "Mrs. ..."). `splitName` strips known titles (Mr./Mrs./Ms./Dr./Prof.)
  before splitting into first/last name.
- Search matches **any** field (first name, last name, email, department);
  the filter popup matches **all** filled-in fields (AND), letting the two
  features serve different use cases per the spec.
- Sorting is available on name/email/department columns only, not ID. While all IDs are numeric, sorting by ID typically provides less value in a user management context than sorting by name or department.
- Pagination page sizes (10/25/50/100) are implemented per spec, though with
  only ~10 real users from JSONPlaceholder, this mostly demonstrates the
  mechanism rather than having a dramatic practical effect.
- **Error Handling & Optimistic Updates**: I assume network requests might fail. CRUD operations are performed optimistically for responsiveness, but include a state rollback and display an ErrorBanner if the API request fails.
- **Validation**: Client-side validation assumes strict formats for email and requires first name, last name, and department fields to be populated.

## Challenges Faced

- **JSONPlaceholder's fake responses were the biggest source of subtle bugs.**
  POST always returns `id: 11` no matter what you send, so relying on it
  for the new user's id would have caused id collisions on every add. This
  meant designing the hook layer to intentionally _not_ trust the API
  response for data, only for confirming the request was sent.
- **An "add user doesn't show up until a second click" bug** turned out to
  be caused by `await`-ing the (unused) API response before updating local
  state, combined with the form clearing itself immediately on submit. The
  fix was an optimistic update: update the UI state first, fire the API
  call in the background. This was a good reminder that "waiting for the
  network" and "showing the result" don't have to be coupled when the
  network response isn't actually needed.
- **Data quirk in the seed data**: user id 6 has a name like "Mrs. ..." which
  broke a naive `split(' ')` into first/last name. Handled by stripping a
  known set of title prefixes before splitting.
- **Robust Optimistic UI Updates**: Initially, optimistic updates didn't account for API failures. Implementing state rollbacks for failed `addUser`, `modify`, and `removeUser` requests was necessary to prevent the UI from becoming desynchronized with the actual backend state. I wired up an `ErrorBanner` to surface these errors smoothly.
- **Client-Side Validation**: Adding real client-side validation to the `UserForm` required managing complex form state and ensuring the UI provides clear, actionable feedback to the user without being intrusive.

## Testing

- Unit tests cover the custom hooks (`useUsers`) and pure query utilities (`queryUsers.js`) to ensure data manipulation, optimistic updates, state rollbacks, and filtering work as expected.

## Improvements With More Time

- Debounce the search input to avoid re-filtering on every keystroke once
  the user list is larger than a handful of records.
- Extract shared input styling in `UserForm`/`FilterPopup` into a small
  reusable `<TextField>` component to reduce repetition.
