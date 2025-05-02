import { promises as fs } from 'fs';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'participants.json');

export interface Participant {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  benchKg: number | null; // allow float
  runTimeSeconds: number | null; // Store run time in seconds
}

export async function getParticipants(): Promise<Participant[]> {
  try {
    const data = await fs.readFile(DATA_PATH, 'utf-8');
    return JSON.parse(data) as Participant[];
  } catch (err) {
    // If file doesn't exist, return empty array
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
}

export async function saveParticipants(participants: Participant[]): Promise<void> {
  await fs.writeFile(DATA_PATH, JSON.stringify(participants, null, 2), 'utf-8');
}

export async function addParticipant(participantData: Omit<Participant, 'id'>): Promise<Participant> {
  const participants = await getParticipants();
  const newParticipant: Participant = {
    ...participantData,
    id: crypto.randomUUID(),
  };
  participants.push(newParticipant);
  await saveParticipants(participants);
  return newParticipant;
}

export async function updateParticipant(id: string, data: Partial<Pick<Participant, 'name' | 'benchKg' | 'runTimeSeconds' | 'gender'>>): Promise<Participant | null> {
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