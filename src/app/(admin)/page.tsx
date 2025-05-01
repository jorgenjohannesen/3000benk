'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Participant } from '@/lib/data';
import { createParticipant, updateParticipantAction, deleteParticipantAction, getParticipantsWithSort } from '@/lib/actions';
import { formatTime, parseTimeInput, getCurrentTimeISOString } from '@/lib/utils';

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'startNumber' | 'startTime' | 'finishTime'>('startNumber');

  // Handle loading and redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Load participants
  useEffect(() => {
    if (status === 'authenticated') {
      loadParticipants();
    }
  }, [status, sortBy]);

  const loadParticipants = async () => {
    setIsLoading(true);
    try {
      const data = await getParticipantsWithSort(sortBy);
      setParticipants(data);
    } catch (error) {
      console.error('Failed to load participants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission for new participant
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Process time inputs
    const startTimeInput = formData.get('startTime') as string;
    if (startTimeInput) {
      const parsedTime = parseTimeInput(startTimeInput);
      if (parsedTime) {
        formData.set('startTime', parsedTime);
      } else {
        alert('Invalid start time format. Please use HH:MM:SS');
        return;
      }
    }
    
    const finishTimeInput = formData.get('finishTime') as string;
    if (finishTimeInput) {
      const parsedTime = parseTimeInput(finishTimeInput);
      if (parsedTime) {
        formData.set('finishTime', parsedTime);
      } else {
        alert('Invalid finish time format. Please use HH:MM:SS');
        return;
      }
    }

    const result = await createParticipant(formData);
    if (result.success) {
      form.reset();
      loadParticipants();
    } else {
      alert(`Failed to create participant: ${JSON.stringify(result.error)}`);
    }
  };

  // Handle form submission for editing
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedParticipant) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // Process time inputs
    const startTimeInput = formData.get('startTime') as string;
    if (startTimeInput) {
      const parsedTime = parseTimeInput(startTimeInput);
      if (parsedTime) {
        formData.set('startTime', parsedTime);
      } else {
        alert('Invalid start time format. Please use HH:MM:SS');
        return;
      }
    }
    
    const finishTimeInput = formData.get('finishTime') as string;
    if (finishTimeInput) {
      const parsedTime = parseTimeInput(finishTimeInput);
      if (parsedTime) {
        formData.set('finishTime', parsedTime);
      } else {
        alert('Invalid finish time format. Please use HH:MM:SS');
        return;
      }
    }
    
    const result = await updateParticipantAction(selectedParticipant.id, formData);
    
    if (result.success) {
      setIsEditing(false);
      setSelectedParticipant(null);
      loadParticipants();
    } else {
      alert(`Failed to update participant: ${JSON.stringify(result.error)}`);
    }
  };

  // Handle deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      const result = await deleteParticipantAction(id);
      if (result.success) {
        loadParticipants();
      } else {
        alert('Failed to delete participant');
      }
    }
  };

  // Handle recording finish time
  const handleRecordFinish = async (participant: Participant) => {
    const now = getCurrentTimeISOString();
    const formData = new FormData();
    
    // Preserve existing data
    formData.set('name', participant.name);
    if (participant.startNumber) formData.set('startNumber', participant.startNumber.toString());
    if (participant.startTime) formData.set('startTime', participant.startTime);
    if (participant.category) formData.set('category', participant.category);
    if (participant.notes) formData.set('notes', participant.notes);
    
    // Set finish time to now
    formData.set('finishTime', now);
    
    const result = await updateParticipantAction(participant.id, formData);
    
    if (result.success) {
      loadParticipants();
    } else {
      alert('Failed to record finish time');
    }
  };

  if (status === 'loading' || isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Event Admin</h1>
        <p className="text-gray-600">Logged in as {session?.user?.name}</p>
      </header>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left column - Add/Edit Form */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">
            {isEditing ? 'Edit Participant' : 'Add New Participant'}
          </h2>
          
          <form onSubmit={isEditing ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={isEditing && selectedParticipant ? selectedParticipant.name : ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="startNumber" className="block text-sm font-medium text-gray-700">
                Start Number
              </label>
              <input
                type="number"
                id="startNumber"
                name="startNumber"
                defaultValue={isEditing && selectedParticipant?.startNumber ? selectedParticipant.startNumber : ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                type="text"
                id="category"
                name="category"
                defaultValue={isEditing && selectedParticipant?.category ? selectedParticipant.category : ''}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time (HH:MM:SS)
              </label>
              <input
                type="text"
                id="startTime"
                name="startTime"
                placeholder="HH:MM:SS"
                defaultValue={
                  isEditing && selectedParticipant?.startTime
                    ? formatTime(selectedParticipant.startTime)
                    : ''
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="finishTime" className="block text-sm font-medium text-gray-700">
                Finish Time (HH:MM:SS)
              </label>
              <input
                type="text"
                id="finishTime"
                name="finishTime"
                placeholder="HH:MM:SS"
                defaultValue={
                  isEditing && selectedParticipant?.finishTime
                    ? formatTime(selectedParticipant.finishTime)
                    : ''
                }
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={isEditing && selectedParticipant?.notes ? selectedParticipant.notes : ''}
                className="mt-1 block h-20 w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              ></textarea>
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isEditing ? 'Save Changes' : 'Add Participant'}
              </button>
              
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedParticipant(null);
                  }}
                  className="rounded-md bg-gray-200 py-2 px-4 text-gray-800 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Right column - Participant List */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Participants</h2>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="startNumber">Sort by Start Number</option>
              <option value="name">Sort by Name</option>
              <option value="startTime">Sort by Start Time</option>
              <option value="finishTime">Sort by Finish Time</option>
            </select>
          </div>

          {participants.length === 0 ? (
            <p className="text-center text-gray-500">No participants yet</p>
          ) : (
            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      #
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Start Time
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Finish Time
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {participants.map((participant) => (
                    <tr key={participant.id}>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                        {participant.startNumber || '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{participant.name}</td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                        {formatTime(participant.startTime)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-900">
                        {formatTime(participant.finishTime)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedParticipant(participant);
                              setIsEditing(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(participant.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                          {!participant.finishTime && (
                            <button
                              onClick={() => handleRecordFinish(participant)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Finish
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 