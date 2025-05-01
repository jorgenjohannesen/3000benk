import { put, list, del } from '@vercel/blob';
import { unstable_noStore as noStore } from 'next/cache';

export interface Participant {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  bibNumber?: string; // Optional bib number
  benchKg: number | null;
  runTimeSeconds: number | null; // Store run time in seconds
}

const BLOB_STORE_KEY = 'participants.json'; // Your blob file name

export async function getParticipants(): Promise<Participant[]> {
  noStore(); // Opt out of caching for dynamic data
  try {
    // List all blobs to find our file
    const { blobs } = await list();
    const participantBlob = blobs.find(blob => blob.pathname === BLOB_STORE_KEY);
    
    if (!participantBlob) {
      return [];
    }
    
    // Fetch the blob content
    const response = await fetch(participantBlob.url);
    const text = await response.text();
    
    if (!text) return [];
    return JSON.parse(text) as Participant[];
  } catch (error: any) {
    console.error('Error fetching participants:', error);
    return []; // Return empty array on error
  }
}

export async function saveParticipants(participants: Participant[]): Promise<void> {
  try {
    const json = JSON.stringify(participants, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    await put(BLOB_STORE_KEY, blob, {
      access: 'public',
      addRandomSuffix: false,
    });
  } catch (error) {
    console.error('Error saving participants:', error);
    throw new Error('Failed to save participants.');
  }
}

export async function addParticipant(participantData: Omit<Participant, 'id' | 'benchKg' | 'runTimeSeconds'>): Promise<Participant> {
  const participants = await getParticipants();
  const newParticipant: Participant = {
    ...participantData,
    id: crypto.randomUUID(),
    benchKg: null,
    runTimeSeconds: null,
  };
  const updatedParticipants = [...participants, newParticipant];
  await saveParticipants(updatedParticipants);
  return newParticipant;
}

export async function updateParticipant(id: string, data: Partial<Pick<Participant, 'name' | 'bibNumber' | 'benchKg' | 'runTimeSeconds'>>): Promise<Participant | null> {
  const participants = await getParticipants();
  let updatedParticipant: Participant | null = null;
  const updatedParticipants = participants.map(p => {
    if (p.id === id) {
      updatedParticipant = { ...p, ...data };
      return updatedParticipant;
    }
    return p;
  });

  if (updatedParticipant) {
    await saveParticipants(updatedParticipants);
  }
  return updatedParticipant;
}

export async function deleteParticipant(id: string): Promise<void> {
  const participants = await getParticipants();
  const updatedParticipants = participants.filter(p => p.id !== id);
  await saveParticipants(updatedParticipants);
} 