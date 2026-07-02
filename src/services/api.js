import axios from 'axios';

// Create an Axios instance with the base URL for JSONPlaceholder API
const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
});

// Fetch all users
export async function getUsers() {
  const response = await api.get('/users');
  return response.data;
}

// Create a new user
export async function createUser(user) {
  const response = await api.post('/users', user);
  return response.data;
}

// Update a user by ID
export async function updateUser(userId, user) {
  const response = await api.put(`/users/${userId}`, user);
  return response.data;
}

//JSONPlaceholder's DELETE actually returns an empty object {} regardless of what you deleted — not particularly useful data, but returning response.data anyway is harmless and consistent with the other functions.
export async function deleteUser(userId) {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
}
