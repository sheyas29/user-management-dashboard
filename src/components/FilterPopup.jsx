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
    <div
      className="filter-popup-overlay fixed inset-0 bg-gray-900/30 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="filter-popup bg-white rounded-lg shadow-lg border border-gray-200 p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Filter Users
        </h3>
        <div className="space-y-3">
          {Object.keys(EMPTY_FILTERS).map((field) => (
            <label key={field} className="block text-sm text-gray-600">
              {FIELD_LABELS[field]}
              <input
                name={field}
                value={draft[field]}
                onChange={handleChange}
                className="mt-1 w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
