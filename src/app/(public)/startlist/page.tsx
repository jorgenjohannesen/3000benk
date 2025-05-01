import { getParticipants } from '@/lib/data';
import { formatTime } from '@/lib/utils';

export const revalidate = 10; // Revalidate every 10 seconds

export default async function StartlistPage() {
  // Get all participants
  const participants = await getParticipants();
  
  // Sort by start number, then by name
  const sortedParticipants = [...participants].sort((a, b) => {
    const aNum = a.startNumber || 0;
    const bNum = b.startNumber || 0;
    
    if (aNum === bNum) {
      return a.name.localeCompare(b.name);
    }
    
    return aNum - bNum;
  });

  // Group by category if available
  const categorized = sortedParticipants.reduce((acc, participant) => {
    const category = participant.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(participant);
    return acc;
  }, {} as Record<string, typeof participants>);

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Event Start List</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleTimeString()}</p>
      </header>

      {Object.keys(categorized).length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <p className="text-lg text-gray-500">No participants available yet</p>
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
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Start Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {participants.map((participant) => (
                      <tr key={participant.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">
                          {participant.startNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{participant.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {formatTime(participant.startTime)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900">
                          {participant.finishTime 
                            ? <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">Finished</span>
                            : participant.startTime 
                              ? <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">Started</span>
                              : <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800">Not Started</span>
                          }
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