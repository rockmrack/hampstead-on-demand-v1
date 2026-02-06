export const metadata = {
  title: "Offline — Hampstead On Demand",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-stone-200 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-stone-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M18.364 5.636a9 9 0 11-12.728 0M12 9v4m0 4h.01"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-medium text-stone-900">
          You&apos;re offline
        </h1>
        <p className="mt-3 text-stone-600">
          It looks like you&apos;ve lost your internet connection. Please check
          your connection and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-8 inline-flex items-center justify-center rounded-lg bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
