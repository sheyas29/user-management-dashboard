const SORTABLE_COLUMNS = [
  { key: 'firstName', label: 'First Name' },
  { key: 'lastName', label: 'Last Name' },
  { key: 'email', label: 'Email' },
  { key: 'department', label: 'Department' },
];

export default function UserTable({
  users,
  onEdit,
  onDelete,
  sortBy,
  sortDirection,
  onSort,
}) {
  function handleHeaderClick(key) {
    // Clicking the active column flips direction; clicking a new column starts at asc.
    if (sortBy === key) {
      onSort(key, sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  }

  function sortIndicator(key) {
    if (sortBy !== key) return '';
    return sortDirection === 'asc' ? ' \u25B2' : ' \u25BC';
  }

  return (
    <div>
      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">ID</th>
            {SORTABLE_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                className="py-2 px-4 border-b cursor-pointer select-none"
                onClick={() => handleHeaderClick(key)}
              >
                {label}
                {sortIndicator(key)}
              </th>
            ))}
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center text-gray-500">
                No users match your search/filter.
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td className="py-2 px-4 border-b">{user.id}</td>
                <td className="py-2 px-4 border-b">{user.firstName}</td>
                <td className="py-2 px-4 border-b">{user.lastName}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.department}</td>
                <td className="py-2 px-4 border-b">
                  <button className="btn-edit" onClick={() => onEdit(user)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => onDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
