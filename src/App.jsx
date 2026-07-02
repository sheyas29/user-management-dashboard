import './App.css';
import UserForm from './components/UserForm';
import UserTable from './components/UserTable';
import useUsers from './hooks/useUsers';

function App() {
  const { users, loading, error, removeUser, addUser, modify } = useUsers();
  return (
    <>
      {loading ? (
        <p>Loading content...</p>
      ) : error ? (
        <p className="error">Could not load content: {error.message}</p>
      ) : (
        <UserTable users={users} onDelete={removeUser} onEdit={modify} />
      )}
      <UserForm onAdd={addUser} />
    </>
  );
}

export default App;
