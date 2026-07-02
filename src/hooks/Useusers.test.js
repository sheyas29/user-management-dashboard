// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUser, deleteUser, getUsers, updateUser } from '../services/api';
import useUsers from './useUsers';

vi.mock('../services/api', () => ({
  getUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
}));

vi.mock('../utils/parseUser', () => ({
  // Identity mapping is enough here — we're testing the hook's own logic,
  // not parseUser's transformation (that belongs in its own test file).
  mapApiUserToUser: (apiUser) => apiUser,
}));

const seedUsers = [
  {
    id: 1,
    firstName: 'Alice',
    lastName: 'Nguyen',
    email: 'alice@acme.com',
    department: 'Engineering',
  },
  {
    id: 2,
    firstName: 'Bob',
    lastName: 'Ortiz',
    email: 'bob@acme.com',
    department: 'Sales',
  },
];

// Waits for the initial fetchUsers() effect to settle before a test
// interacts with add/edit/delete.
async function renderLoadedHook(initialUsers = seedUsers) {
  getUsers.mockResolvedValueOnce(initialUsers);
  const rendered = renderHook(() => useUsers());
  await waitFor(() => expect(rendered.result.current.loading).toBe(false));
  return rendered;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('initial fetch', () => {
  it('starts in a loading state with no users', () => {
    getUsers.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useUsers());
    expect(result.current.loading).toBe(true);
    expect(result.current.users).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('loads and maps users on success', async () => {
    const { result } = await renderLoadedHook();
    expect(result.current.users).toEqual(seedUsers);
    expect(result.current.error).toBeNull();
  });

  it('sets error and stops loading on fetch failure, leaving users empty', async () => {
    const fetchError = new Error('network down');
    getUsers.mockRejectedValueOnce(fetchError);
    const { result } = renderHook(() => useUsers());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe(fetchError);
    expect(result.current.users).toEqual([]);
  });
});

describe('addUser', () => {
  it('optimistically appends the new user before the API call resolves', async () => {
    const { result } = await renderLoadedHook();
    createUser.mockReturnValue(new Promise(() => {})); // still pending

    act(() => {
      result.current.addUser({
        firstName: 'Carla',
        lastName: 'Diaz',
        email: 'carla@acme.com',
        department: 'Design',
      });
    });

    expect(result.current.users).toHaveLength(3);
    expect(result.current.users[2]).toMatchObject({
      firstName: 'Carla',
      id: 11,
    });
  });

  it('assigns sequential ids starting one past the highest fetched id', async () => {
    const { result } = await renderLoadedHook(); // seed users end at id 2, but floor is 10
    createUser.mockResolvedValue({});

    await act(async () => {
      await result.current.addUser({
        firstName: 'Carla',
        lastName: 'Diaz',
        email: 'c@acme.com',
        department: '',
      });
    });
    await act(async () => {
      await result.current.addUser({
        firstName: 'Dev',
        lastName: 'Patel',
        email: 'd@acme.com',
        department: '',
      });
    });

    const newIds = result.current.users.slice(2).map((u) => u.id);
    expect(newIds).toEqual([11, 12]);
  });

  it('seeds the id counter above existing ids when fetched users already exceed 11', async () => {
    const { result } = await renderLoadedHook([
      {
        id: 15,
        firstName: 'X',
        lastName: 'Y',
        email: 'x@acme.com',
        department: '',
      },
    ]);
    createUser.mockResolvedValue({});

    await act(async () => {
      await result.current.addUser({
        firstName: 'New',
        lastName: 'User',
        email: 'n@acme.com',
        department: '',
      });
    });

    expect(result.current.users[1].id).toBe(16);
  });

  it('rolls back and sets actionError when createUser fails', async () => {
    const { result } = await renderLoadedHook();
    createUser.mockRejectedValueOnce(new Error('fail'));

    await act(async () => {
      await result.current.addUser({
        firstName: 'Carla',
        lastName: 'Diaz',
        email: 'c@acme.com',
        department: '',
      });
    });

    expect(result.current.users).toHaveLength(2); // rolled back
    expect(result.current.actionError).toBe(
      'Failed to add user. Please try again.'
    );
  });

  it('reclaims the id after a failed add so the next successful add has no gap', async () => {
    const { result } = await renderLoadedHook();
    createUser.mockRejectedValueOnce(new Error('fail'));
    await act(async () => {
      await result.current.addUser({
        firstName: 'Fails',
        lastName: 'Once',
        email: 'f@acme.com',
        department: '',
      });
    });

    createUser.mockResolvedValueOnce({});
    await act(async () => {
      await result.current.addUser({
        firstName: 'Succeeds',
        lastName: 'Now',
        email: 's@acme.com',
        department: '',
      });
    });

    expect(result.current.users.at(-1)).toMatchObject({
      firstName: 'Succeeds',
      id: 11,
    });
  });

  it('clearActionError resets actionError to null', async () => {
    const { result } = await renderLoadedHook();
    createUser.mockRejectedValueOnce(new Error('fail'));
    await act(async () => {
      await result.current.addUser({
        firstName: 'X',
        lastName: 'Y',
        email: 'x@acme.com',
        department: '',
      });
    });
    expect(result.current.actionError).not.toBeNull();

    act(() => result.current.clearActionError());
    expect(result.current.actionError).toBeNull();
  });
});

describe('modify', () => {
  it('optimistically merges the update into the matching user', async () => {
    const { result } = await renderLoadedHook();
    updateUser.mockResolvedValue({});

    await act(async () => {
      await result.current.modify(1, { department: 'Marketing' });
    });

    expect(result.current.users.find((u) => u.id === 1).department).toBe(
      'Marketing'
    );
  });

  it('rolls back to the previous values and sets actionError on failure', async () => {
    const { result } = await renderLoadedHook();
    updateUser.mockRejectedValueOnce(new Error('fail'));

    await act(async () => {
      await result.current.modify(1, { department: 'Marketing' });
    });

    expect(result.current.users.find((u) => u.id === 1)).toEqual(seedUsers[0]);
    expect(result.current.actionError).toBe(
      'Failed to update user. Please try again.'
    );
  });

  it('leaves other users untouched', async () => {
    const { result } = await renderLoadedHook();
    updateUser.mockResolvedValue({});

    await act(async () => {
      await result.current.modify(1, { department: 'Marketing' });
    });

    expect(result.current.users.find((u) => u.id === 2)).toEqual(seedUsers[1]);
  });
});

describe('removeUser', () => {
  it('optimistically removes the user before the API call resolves', async () => {
    const { result } = await renderLoadedHook();
    deleteUser.mockReturnValue(new Promise(() => {}));

    act(() => {
      result.current.removeUser(1);
    });

    expect(result.current.users.map((u) => u.id)).toEqual([2]);
  });

  it('restores the user at its original index on failure', async () => {
    const threeUsers = [
      ...seedUsers,
      {
        id: 3,
        firstName: 'Carla',
        lastName: 'Diaz',
        email: 'c@acme.com',
        department: 'Design',
      },
    ];
    const { result } = await renderLoadedHook(threeUsers);
    deleteUser.mockRejectedValueOnce(new Error('fail'));

    await act(async () => {
      await result.current.removeUser(2); // the middle user
    });

    expect(result.current.users.map((u) => u.id)).toEqual([1, 2, 3]);
    expect(result.current.actionError).toBe(
      'Failed to delete user. Please try again.'
    );
  });

  it('calls deleteUser with the given id', async () => {
    const { result } = await renderLoadedHook();
    deleteUser.mockResolvedValue({});

    await act(async () => {
      await result.current.removeUser(2);
    });

    expect(deleteUser).toHaveBeenCalledWith(2);
  });
});
