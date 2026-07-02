import { useMemo, useState } from 'react';
import './App.css';
import ErrorBanner from './components/ErrorBanner';
import FilterPopup from './components/FilterPopup';
import Pagination from './components/Pagination';
import SearchBar from './components/SearchBar';
import UserForm from './components/UserForm';
import UserTable from './components/UserTable';
import useUsers from './hooks/useUsers';
import {
  filterUsers,
  getTotalPages,
  paginateUsers,
  searchUsers,
  sortUsers,
} from './utils/queryUsers';

const EMPTY_FILTERS = {
  firstName: '',
  lastName: '',
  email: '',
  department: '',
};

function App() {
  const {
    users,
    loading,
    error,
    actionError,
    clearActionError,
    removeUser,
    addUser,
    modify,
  } = useUsers();
  const [editingUser, setEditingUser] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Recomputed only when an input actually changes — avoids re-filtering/sorting
  // on every unrelated re-render (e.g. while a form field is being typed into).
  const visibleUsers = useMemo(() => {
    const searched = searchUsers(users, searchQuery);
    const filtered = filterUsers(searched, filters);
    return sortUsers(filtered, sortBy, sortDirection);
  }, [users, searchQuery, filters, sortBy, sortDirection]);

  const totalPages = getTotalPages(visibleUsers.length, pageSize);
  // Clamp so that e.g. narrowing a search from page 3 down to 1 page of
  // results doesn't leave the view stuck on an empty page 3.
  const safePage = Math.min(page, totalPages);
  const pagedUsers = paginateUsers(visibleUsers, safePage, pageSize);

  function handleSearchChange(value) {
    setSearchQuery(value);
    setPage(1);
  }

  function handleFilterApply(newFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  function handleSort(key, direction) {
    setSortBy(key);
    setSortDirection(direction);
  }

  function handlePageSizeChange(size) {
    setPageSize(size);
    setPage(1);
  }

  function handleAdd(details) {
    addUser(details);
  }

  function handleEditSubmit(details) {
    modify(editingUser.id, details);
    setEditingUser(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 px-3 sm:px-6 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            User Management Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Search, filter, and manage users pulled from the JSONPlaceholder
            API.
          </p>
        </header>

        <ErrorBanner message={actionError} onDismiss={clearActionError} />

        {loading ? (
          <p className="text-sm text-gray-500">Loading content...</p>
        ) : error ? (
          <p className="error rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            Could not load content: {error.message}
          </p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="controls-bar flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-4 border-b border-gray-200">
              <SearchBar value={searchQuery} onChange={handleSearchChange} />
              <button
                type="button"
                onClick={() => setShowFilterPopup(true)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 self-start sm:self-auto"
              >
                Filter
              </button>
            </div>

            {showFilterPopup && (
              <FilterPopup
                filters={filters}
                onApply={handleFilterApply}
                onClose={() => setShowFilterPopup(false)}
              />
            )}

            <UserTable
              users={pagedUsers}
              onDelete={removeUser}
              onEdit={(user) => setEditingUser(user)}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSort={handleSort}
            />

            <Pagination
              page={safePage}
              pageSize={pageSize}
              totalPages={totalPages}
              totalItems={visibleUsers.length}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}

        <UserForm
          onAdd={handleAdd}
          onEditSubmit={handleEditSubmit}
          initialUser={editingUser}
          onCancelEdit={() => setEditingUser(null)}
        />
      </div>
    </div>
  );
}

export default App;
