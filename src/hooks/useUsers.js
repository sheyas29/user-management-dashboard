import { useEffect, useState } from 'react';
import { createUser, deleteUser, getUsers, updateUser } from '../services/api';
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
    const response = await createUser(user);
    setUsers((prev) => [...prev, { ...user, id: response.id }]);
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
    const response = await deleteUser(userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  }
  return { users, loading, error, removeUser, addUser, modify };
}

export default useUsers;
