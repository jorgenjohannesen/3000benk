import Link from 'next/link';
import { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link
                href="/"
                className="text-lg font-bold"
              >
                Event Manager
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/startlist"
                className="rounded-md px-3 py-2 text-sm hover:bg-gray-700"
              >
                Start List
              </Link>
              <Link
                href="/leaderboard"
                className="rounded-md px-3 py-2 text-sm hover:bg-gray-700"
              >
                Leaderboard
              </Link>
              <Link
                href="/admin"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm hover:bg-blue-700"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>
      {children}
    </div>
  );
} 