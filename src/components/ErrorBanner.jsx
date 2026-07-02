export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;

  return (
    <div className="error-banner flex items-center justify-between gap-3 mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="shrink-0 text-red-700 font-bold px-1"
        aria-label="Dismiss error"
      >
        ×
      </button>
    </div>
  );
}
