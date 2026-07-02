export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search by name, email, or department..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="search-bar w-full sm:w-72 rounded border border-gray-300 px-3 py-1.5 text-sm"
    />
  );
}
