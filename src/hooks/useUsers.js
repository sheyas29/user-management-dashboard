import { useEffect, useState } from 'react';
import { createUser, getUsers, updateUser } from '../services/api';
import { mapApiUserToUser } from '../utils/parseUser';

function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await getUsers(); //calling getUsers from ../services/api to fetch the user data from the API

        //response is an array of user objects from the API, we need to map it to our desired user format using mapApiUserToUser from ../utils/parseUser
        const usersList = response.map(mapApiUserToUser);
        setUsers(usersList);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function addUser(user) {
    const newUser = { ...user, id: crypto.randomUUID() };
    setUsers((prev) => [...prev, newUser]);
    // still "send" it, but ignore the echoed id , becuase it always returns 'id:11' regardless
    createUser(user).catch((error) => {
      // if it fails, at minimum log it — optionally roll back the optimistic add
      console.error('Failed to sync new user to server:', error);
    });
  }
  async function modify(userId, user) {
    const response = await updateUser(userId, user);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, ...user, id: response.id } : u
      )
    );
  }
  async function removeUser(userId) {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }
  return { users, loading, error, removeUser, addUser, modify };
}

export default useUsers;
