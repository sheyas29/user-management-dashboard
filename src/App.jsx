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

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

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
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">
              User Management
            </h1>
            {!loading && !error && (
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {visibleUsers.length}{' '}
                {visibleUsers.length === 1 ? 'user' : 'users'}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Search, filter, and manage users pulled from the JSONPlaceholder
            API.
          </p>
        </header>

        <ErrorBanner message={actionError} onDismiss={clearActionError} />

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-gray-200 bg-white py-16">
            <p className="text-sm text-gray-500">Loading content…</p>
          </div>
        ) : error ? (
          <p className="error rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load content: {error.message}
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b border-gray-200 bg-gray-50/60">
                <div className="flex-1 min-w-0">
                  <SearchBar
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="relative self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setShowFilterPopup(true)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    <svg
                      className="h-4 w-4 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-6.757a2.25 2.25 0 00-.659-1.591L2.659 5.22A2.25 2.25 0 012 3.629V1.34a.75.75 0 01.628-.74z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Filter
                    {activeFilterCount > 0 && (
                      <span className="inline-flex items-center justify-center rounded-full bg-gray-900 text-white text-[11px] leading-none h-4 min-w-4 px-1">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {showFilterPopup && (
                    <FilterPopup
                      filters={filters}
                      onApply={handleFilterApply}
                      onClose={() => setShowFilterPopup(false)}
                    />
                  )}
                </div>
              </div>

              {pagedUsers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-1 py-16 px-4 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    No users found
                  </p>
                  <p className="text-sm text-gray-500">
                    Try adjusting your search or filters.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <UserTable
                    users={pagedUsers}
                    onDelete={removeUser}
                    onEdit={(user) => setEditingUser(user)}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </div>
              )}

              <div className="border-t border-gray-200">
                <Pagination
                  page={safePage}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  totalItems={visibleUsers.length}
                  onPageChange={setPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            </div>

            <div className="lg:sticky lg:top-8">
              <UserForm
                key={editingUser ? editingUser.id : 'new'}
                onAdd={handleAdd}
                onEditSubmit={handleEditSubmit}
                initialUser={editingUser}
                onCancelEdit={() => setEditingUser(null)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
