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
    if (sortBy !== key) return null;
    return (
      <span className="ml-1 text-indigo-600">
        {sortDirection === 'asc' ? '\u25B2' : '\u25BC'}
      </span>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="py-2.5 px-4 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">
              ID
            </th>
            {SORTABLE_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => handleHeaderClick(key)}
                className="py-2.5 px-4 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide cursor-pointer select-none hover:text-gray-700"
              >
                {label}
                {sortIndicator(key)}
              </th>
            ))}
            <th className="py-2.5 px-4 text-left font-semibold text-gray-500 text-xs uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="py-8 px-4 text-center text-gray-400 text-sm"
              >
                No users match your search or filters.
              </td>
            </tr>
          ) : (
            users.map((user, index) => (
              <tr
                key={user.id}
                className={`border-b border-gray-100 last:border-b-0 hover:bg-indigo-50/40 transition-colors ${
                  index % 2 === 1 ? 'bg-gray-50/50' : ''
                }`}
              >
                <td className="py-2.5 px-4 text-gray-400 font-mono text-xs tabular-nums">
                  {user.id}
                </td>
                <td className="py-2.5 px-4 text-gray-800">{user.firstName}</td>
                <td className="py-2.5 px-4 text-gray-800">{user.lastName}</td>
                <td className="py-2.5 px-4 text-gray-600">{user.email}</td>
                <td className="py-2.5 px-4 text-gray-600">
                  {user.department || '—'}
                </td>
                <td className="py-2.5 px-4">
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      className="text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded px-2 py-1"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(user.id)}
                      className="text-xs font-medium text-red-600 hover:bg-red-50 rounded px-2 py-1"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
