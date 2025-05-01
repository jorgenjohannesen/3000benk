import { getParticipants, Participant } from '@/lib/data';
import { formatTime, calculateElapsedTime } from '@/lib/utils';

export const revalidate = 10; // Revalidate every 10 seconds

export default async function LeaderboardPage() {
  // Get all participants
  const participants = await getParticipants();
  
  // Filter to only those with both start and finish times
  const finishedParticipants = participants.filter(
    (p) => p.startTime && p.finishTime
  );
  
  // Sort by elapsed time
  const sortedParticipants = [...finishedParticipants].sort((a, b) => {
    const timeA = calculateDuration(a);
    const timeB = calculateDuration(b);
    return timeA - timeB;
  });

  // Group by category if available
  const categorized = sortedParticipants.reduce<Record<string, Participant[]>>(
    (acc, participant) => {
      const category = participant.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(participant);
      return acc;
    },
    {}
  );

  // Calculate duration in seconds for sorting
  function calculateDuration(participant: Participant): number {
    if (!participant.startTime || !participant.finishTime) return Infinity;
    
    try {
      const start = new Date(participant.startTime).getTime();
      const finish = new Date(participant.finishTime).getTime();
      return (finish - start) / 1000;
    } catch (error) {
      return Infinity;
    }
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Event Leaderboard</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleTimeString()}</p>
      </header>

      {Object.keys(categorized).length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <p className="text-lg text-gray-500">No results available yet</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(categorized).map(([category, participants]) => (
            <div key={category} className="rounded-lg border bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold">{category}</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Position
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Start Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Finish Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {participants.map((participant, index) => (
                      <tr key={participant.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {participant.startNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{participant.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {formatTime(participant.startTime)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {formatTime(participant.finishTime)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-bold text-gray-900">
                          {calculateElapsedTime(participant.startTime, participant.finishTime)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 