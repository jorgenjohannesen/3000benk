import { put, list, del } from '@vercel/blob';

// Define types for our data
export type Participant = {
  id: string;
  name: string;
  startNumber?: number;
  startTime?: string;
  finishTime?: string;
  category?: string;
  notes?: string;
};

// Blob key for our data
const PARTICIPANTS_BLOB_KEY = 'participants.json';

// Get all participants
export async function getParticipants(): Promise<Participant[]> {
  try {
    const { blobs } = await list();
    const participantsBlob = blobs.find(blob => blob.pathname === PARTICIPANTS_BLOB_KEY);
    
    if (!participantsBlob) {
      return [];
    }
    
    const response = await fetch(participantsBlob.url);
    const data = await response.json();
    return data as Participant[];
  } catch (error) {
    console.error("Error getting participants:", error);
    return [];
  }
}

// Save all participants
export async function saveParticipants(participants: Participant[]) {
  try {
    const json = JSON.stringify(participants, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    await put(PARTICIPANTS_BLOB_KEY, blob, { access: 'public' });
    return true;
  } catch (error) {
    console.error("Error saving participants:", error);
    return false;
  }
}

// Add a new participant
export async function addParticipant(participant: Participant) {
  const participants = await getParticipants();
  participants.push(participant);
  return saveParticipants(participants);
}

// Update a participant
export async function updateParticipant(id: string, updatedParticipant: Partial<Participant>) {
  const participants = await getParticipants();
  const index = participants.findIndex(p => p.id === id);
  
  if (index === -1) {
    return false;
  }
  
  participants[index] = { 
    ...participants[index], 
    ...updatedParticipant,
    id // Ensure id doesn't change
  };
  
  return saveParticipants(participants);
}

// Delete a participant
export async function deleteParticipant(id: string) {
  const participants = await getParticipants();
  const filteredParticipants = participants.filter(p => p.id !== id);
  
  if (filteredParticipants.length === participants.length) {
    return false; // No participant was removed
  }
  
  return saveParticipants(filteredParticipants);
} 