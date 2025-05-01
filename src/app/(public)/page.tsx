import Link from 'next/link';
import { getParticipants } from '@/lib/data';

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  const participants = await getParticipants();
  const totalParticipants = participants.length;
  const finishedParticipants = participants.filter(p => p.finishTime).length;
  
  return (
    <div className="container mx-auto p-4">
      <div className="py-12 text-center">
        <h1 className="mb-4 text-4xl font-bold">Event Manager</h1>
        <p className="mx-auto mb-8 max-w-lg text-xl text-gray-600">
          Track participants, start times, and results for your event
        </p>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Participants</h2>
          <p className="text-3xl font-bold text-blue-600">{totalParticipants}</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Finished</h2>
          <p className="text-3xl font-bold text-green-600">{finishedParticipants}</p>
        </div>
        
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">In Progress</h2>
          <p className="text-3xl font-bold text-yellow-600">
            {totalParticipants - finishedParticipants}
          </p>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Link href="/startlist">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border bg-white p-6 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md">
            <h2 className="mb-2 text-2xl font-semibold">Start List</h2>
            <p className="text-gray-600">View the list of participants and their start times</p>
          </div>
        </Link>
        
        <Link href="/leaderboard">
          <div className="flex h-40 flex-col items-center justify-center rounded-lg border bg-white p-6 text-center shadow-sm transition hover:border-blue-500 hover:shadow-md">
            <h2 className="mb-2 text-2xl font-semibold">Leaderboard</h2>
            <p className="text-gray-600">See current results and rankings</p>
          </div>
        </Link>
      </div>

      <div className="mb-12 rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Admin Access</h2>
        <p className="mb-4 text-gray-600">
          Manage participants, update times, and view results in the admin area.
        </p>
        <Link
          href="/admin"
          className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Go to Admin
        </Link>
      </div>
    </div>
  );
} 