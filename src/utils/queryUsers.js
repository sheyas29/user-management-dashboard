// utils/queryUsers.js
// Pure, framework-agnostic helpers for search, filter, sort, and pagination.
// Kept separate from components (no React, no state) so each function is
// trivial to unit test in isolation with plain arrays in / arrays out.

const SEARCHABLE_FIELDS = ['firstName', 'lastName', 'email', 'department'];

// Matches `query` against every searchable field (OR across fields).
export function searchUsers(users, query) {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return users;
  return users.filter((user) =>
    SEARCHABLE_FIELDS.some((field) =>
      (user[field] || '').toLowerCase().includes(trimmed)
    )
  );
}

// filters = { firstName, lastName, email, department }, empty strings ignored.
// Unlike search, this is AND across fields — every non-empty filter must match.
export function filterUsers(users, filters) {
  const activeFilters = Object.entries(filters).filter(
    ([, value]) => value.trim() !== ''
  );
  if (activeFilters.length === 0) return users;
  return users.filter((user) =>
    activeFilters.every(([field, value]) =>
      (user[field] || '').toLowerCase().includes(value.trim().toLowerCase())
    )
  );
}

// sortDirection: 'asc' | 'desc'. Returns a new array — never mutates input.
export function sortUsers(users, sortBy, sortDirection) {
  if (!sortBy) return users;
  const direction = sortDirection === 'desc' ? -1 : 1;
  return [...users].sort((a, b) => {
    const aVal = (a[sortBy] || '').toString().toLowerCase();
    const bVal = (b[sortBy] || '').toString().toLowerCase();
    if (aVal < bVal) return -1 * direction;
    if (aVal > bVal) return 1 * direction;
    return 0;
  });
}

export function paginateUsers(users, page, pageSize) {
  const start = (page - 1) * pageSize;
  return users.slice(start, start + pageSize);
}

export function getTotalPages(totalItems, pageSize) {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}
