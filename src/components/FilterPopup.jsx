import { useState } from 'react';

const EMPTY_FILTERS = {
  firstName: '',
  lastName: '',
  email: '',
  department: '',
};

const FIELD_LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  email: 'Email',
  department: 'Department',
};

export default function FilterPopup({ filters, onApply, onClose }) {
  // Draft state so typing doesn't re-filter the table on every keystroke —
  // only commits to the parent when "Apply" is clicked.
  const [draft, setDraft] = useState(filters);

  function handleChange(e) {
    const { name, value } = e.target;
    setDraft((prev) => ({ ...prev, [name]: value }));
  }

  function handleApply() {
    onApply(draft);
    onClose();
  }

  function handleClear() {
    setDraft(EMPTY_FILTERS);
    onApply(EMPTY_FILTERS);
    onClose();
  }

  return (
    <div className="filter-popup-overlay" onClick={onClose}>
      <div className="filter-popup" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">Filter Users</h3>
        {Object.keys(EMPTY_FILTERS).map((field) => (
          <label key={field} className="block mb-2 text-sm">
            {FIELD_LABELS[field]}
            <input
              name={field}
              value={draft[field]}
              onChange={handleChange}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1"
            />
          </label>
        ))}
        <div className="flex justify-end gap-2 mt-3">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 text-sm border rounded"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-sm border rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-3 py-1 text-sm rounded bg-blue-600 text-white"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
