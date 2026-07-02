import './App.css';
import UserTable from './components/UserTable';
import useUsers from './hooks/useUsers';

function App() {
  const { users, loading, error, removeUser } = useUsers();
  return (
    <>
      {loading ? (
        <p>Loading content...</p>
      ) : error ? (
        <p className="error">Could not load content: {error.message}</p>
      ) : (
        <UserTable users={users} onDelete={removeUser} />
      )}
    </>
  );
}

export default App;
