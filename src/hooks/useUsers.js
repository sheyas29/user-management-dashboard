import { useEffect, useRef, useState } from 'react';
import { createUser, deleteUser, getUsers, updateUser } from '../services/api';
import { mapApiUserToUser } from '../utils/parseUser';

function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // initial load failure
  const [actionError, setActionError] = useState(null); // add/edit/delete failure

  // JSONPlaceholder's seed data uses ids 1-10, but always echoes back id:11
  // from POST regardless of how many users already exist — so we mint our
  // own sequential ids locally instead of trusting the API's response.
  const nextIdRef = useRef(11);

  function clearActionError() {
    setActionError(null);
  }

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await getUsers(); //calling getUsers from ../services/api to fetch the user data from the API

        //response is an array of user objects from the API, we need to map it to our desired user format using mapApiUserToUser from ../utils/parseUser
        const usersList = response.map(mapApiUserToUser);
        setUsers(usersList);

        // Seed the counter one past the highest existing id (floor of 10,
        // so it always starts at 11 even if the API returns fewer/odd ids).
        const maxId = usersList.reduce(
          (max, u) => Math.max(max, Number(u.id) || 0),
          10
        );
        nextIdRef.current = maxId + 1;
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  // All three CRUD actions follow the same shape: update local state
  // immediately (optimistic), fire the API call in the background, and roll
  // the state back + surface actionError if the call fails.

  async function addUser(user) {
    const newUser = { ...user, id: nextIdRef.current };
    nextIdRef.current += 1;
    setUsers((prev) => [...prev, newUser]);

    try {
      await createUser(user); // still "send" it, ignoring the echoed id — JSONPlaceholder always returns id:11 regardless
    } catch (err) {
      setUsers((prev) => prev.filter((u) => u.id !== newUser.id)); // rollback
      nextIdRef.current -= 1; // reclaim the id so a failed add doesn't leave a gap
      setActionError('Failed to add user. Please try again.');
    }
  }

  async function modify(userId, user) {
    let previousUser;
    setUsers((prev) => {
      previousUser = prev.find((u) => u.id === userId);
      return prev.map((u) => (u.id === userId ? { ...u, ...user } : u));
    });

    try {
      await updateUser(userId, user);
    } catch (err) {
      setUsers((prev) => prev.map((u) => (u.id === userId ? previousUser : u))); // rollback
      setActionError('Failed to update user. Please try again.');
    }
  }

  async function removeUser(userId) {
    let removedUser, removedIndex;
    setUsers((prev) => {
      removedIndex = prev.findIndex((u) => u.id === userId);
      removedUser = prev[removedIndex];
      return prev.filter((u) => u.id !== userId);
    });

    try {
      await deleteUser(userId);
    } catch (err) {
      setUsers((prev) => {
        const restored = [...prev];
        restored.splice(removedIndex, 0, removedUser); // put it back where it was
        return restored;
      });
      setActionError('Failed to delete user. Please try again.');
    }
  }

  return {
    users,
    loading,
    error,
    actionError,
    clearActionError,
    removeUser,
    addUser,
    modify,
  };
}

export default useUsers;
