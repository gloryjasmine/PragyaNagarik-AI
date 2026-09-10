import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-slate-50 text-slate-800">
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-600 mb-4">The requested page could not be found.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold">
        Return to PragyaNagrik Portal
      </Link>
    </div>
  );
}
