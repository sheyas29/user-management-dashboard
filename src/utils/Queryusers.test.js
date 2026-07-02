import { describe, it, expect } from 'vitest';
import {
  searchUsers,
  filterUsers,
  sortUsers,
  paginateUsers,
  getTotalPages,
} from './queryUsers';

const users = [
  { id: 1, firstName: 'Alice', lastName: 'Nguyen', email: 'alice@acme.com', department: 'Engineering' },
  { id: 2, firstName: 'Bob', lastName: 'Ortiz', email: 'bob@acme.com', department: 'Sales' },
  { id: 3, firstName: 'Carla', lastName: 'Nguyen', email: 'carla@acme.com', department: 'Engineering' },
  { id: 4, firstName: 'Dev', lastName: 'Patel', email: 'dev@acme.com', department: '' },
];

describe('searchUsers', () => {
  it('returns all users when the query is empty', () => {
    expect(searchUsers(users, '')).toEqual(users);
  });

  it('returns all users when the query is only whitespace', () => {
    expect(searchUsers(users, '   ')).toEqual(users);
  });

  it('matches case-insensitively', () => {
    const result = searchUsers(users, 'ALICE');
    expect(result).toHaveLength(1);
    expect(result[0].firstName).toBe('Alice');
  });

  it('matches a substring, not just whole words', () => {
    const result = searchUsers(users, 'ngu');
    expect(result.map((u) => u.id)).toEqual([1, 3]);
  });

  it('matches across any searchable field (OR), including email and department', () => {
    expect(searchUsers(users, 'acme.com')).toHaveLength(4);
    expect(searchUsers(users, 'Sales').map((u) => u.id)).toEqual([2]);
  });

  it('trims leading/trailing whitespace from the query before matching', () => {
    const result = searchUsers(users, '  bob  ');
    expect(result.map((u) => u.id)).toEqual([2]);
  });

  it('returns an empty array when nothing matches', () => {
    expect(searchUsers(users, 'zzz-no-match')).toEqual([]);
  });

  it('does not throw on users with an empty-string field', () => {
    expect(() => searchUsers(users, 'engineering')).not.toThrow();
    expect(searchUsers(users, 'engineering').map((u) => u.id)).toEqual([1, 3]);
  });
});

describe('filterUsers', () => {
  const emptyFilters = { firstName: '', lastName: '', email: '', department: '' };

  it('returns all users when every filter is empty', () => {
    expect(filterUsers(users, emptyFilters)).toEqual(users);
  });

  it('treats whitespace-only filter values as inactive', () => {
    expect(filterUsers(users, { ...emptyFilters, firstName: '   ' })).toEqual(users);
  });

  it('applies a single active filter', () => {
    const result = filterUsers(users, { ...emptyFilters, department: 'Engineering' });
    expect(result.map((u) => u.id)).toEqual([1, 3]);
  });

  it('ANDs multiple active filters together', () => {
    const result = filterUsers(users, {
      ...emptyFilters,
      lastName: 'Nguyen',
      firstName: 'Carla',
    });
    expect(result.map((u) => u.id)).toEqual([3]);
  });

  it('returns an empty array when the AND combination matches nobody', () => {
    const result = filterUsers(users, {
      ...emptyFilters,
      firstName: 'Alice',
      department: 'Sales',
    });
    expect(result).toEqual([]);
  });

  it('matches case-insensitively and by substring', () => {
    const result = filterUsers(users, { ...emptyFilters, email: 'ACME' });
    expect(result).toHaveLength(4);
  });

  it('handles filtering on a field that is an empty string on some users', () => {
    const result = filterUsers(users, { ...emptyFilters, department: '' });
    expect(result).toEqual(users);
  });
});

describe('sortUsers', () => {
  it('returns the same array unsorted when sortBy is falsy', () => {
    expect(sortUsers(users, null, 'asc')).toEqual(users);
    expect(sortUsers(users, undefined, 'asc')).toEqual(users);
  });

  it('sorts ascending by default field values, case-insensitively', () => {
    const result = sortUsers(users, 'firstName', 'asc');
    expect(result.map((u) => u.firstName)).toEqual(['Alice', 'Bob', 'Carla', 'Dev']);
  });

  it('sorts descending when sortDirection is "desc"', () => {
    const result = sortUsers(users, 'firstName', 'desc');
    expect(result.map((u) => u.firstName)).toEqual(['Dev', 'Carla', 'Bob', 'Alice']);
  });

  it('treats any sortDirection other than "desc" as ascending', () => {
    const result = sortUsers(users, 'firstName', 'banana');
    expect(result.map((u) => u.firstName)).toEqual(['Alice', 'Bob', 'Carla', 'Dev']);
  });

  it('does not mutate the original array', () => {
    const copy = [...users];
    sortUsers(users, 'firstName', 'desc');
    expect(users).toEqual(copy);
  });

  it('returns a new array reference, not the same one, when sorting', () => {
    const result = sortUsers(users, 'firstName', 'asc');
    expect(result).not.toBe(users);
  });

  it('sorts users with an empty-string field to one end without throwing', () => {
    const result = sortUsers(users, 'department', 'asc');
    expect(result[0].department).toBe('');
  });

  it('breaks ties by preserving relative order for equal values (stable sort)', () => {
    const result = sortUsers(users, 'department', 'asc');
    const engineering = result.filter((u) => u.department === 'Engineering');
    expect(engineering.map((u) => u.id)).toEqual([1, 3]);
  });
});

describe('paginateUsers', () => {
  it('returns the first page correctly', () => {
    expect(paginateUsers(users, 1, 2).map((u) => u.id)).toEqual([1, 2]);
  });

  it('returns the second page correctly', () => {
    expect(paginateUsers(users, 2, 2).map((u) => u.id)).toEqual([3, 4]);
  });

  it('returns an empty array for a page past the end', () => {
    expect(paginateUsers(users, 3, 2)).toEqual([]);
  });

  it('returns everything when pageSize is larger than the list', () => {
    expect(paginateUsers(users, 1, 100)).toEqual(users);
  });

  it('returns an empty array when given an empty list', () => {
    expect(paginateUsers([], 1, 10)).toEqual([]);
  });
});

describe('getTotalPages', () => {
  it('divides evenly when totalItems is a multiple of pageSize', () => {
    expect(getTotalPages(20, 10)).toBe(2);
  });

  it('rounds up when totalItems does not divide evenly', () => {
    expect(getTotalPages(21, 10)).toBe(3);
  });

  it('returns 1 (never 0) when totalItems is 0', () => {
    expect(getTotalPages(0, 10)).toBe(1);
  });

  it('returns 1 when totalItems is less than pageSize', () => {
    expect(getTotalPages(5, 10)).toBe(1);
  });
});
