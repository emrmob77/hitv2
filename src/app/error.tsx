'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="rounded-lg border border-red-500 bg-red-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-red-900">Something went wrong!</h2>
        <p className="mb-4 text-red-700">{error.message}</p>
        <pre className="mb-4 overflow-auto rounded bg-red-100 p-4 text-left text-xs">
          {error.stack}
        </pre>
        <button
          onClick={reset}
          className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
