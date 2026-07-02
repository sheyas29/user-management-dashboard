export default function SearchBar({ value, onChange }) {
  return (
    <input
      type="text"
      placeholder="Search by name, email, or department..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="search-bar w-full sm:w-72 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
    />
  );
}
