import { prisma } from './prisma';

export interface Participant {
  id: string;
  name: string;
  gender: 'male' | 'female' | 'other';
  benchKg: number | null;
  runTimeSeconds: number | null;
}

export async function getParticipants(): Promise<Participant[]> {
  try {
    const participants = await prisma.participant.findMany({
      orderBy: [
        { benchKg: 'desc' },
        { name: 'asc' }
      ]
    });
    return participants.map((p: { id: string; name: string; gender: string; benchKg: number | null; runTimeSeconds: number | null }) => ({
      id: p.id,
      name: p.name,
      gender: p.gender as 'male' | 'female' | 'other',
      benchKg: p.benchKg,
      runTimeSeconds: p.runTimeSeconds
    }));
  } catch (err) {
    console.error('Error reading participants:', err);
    return [];
  }
}

export async function addParticipant(participantData: Omit<Participant, 'id'>): Promise<Participant> {
  try {
    const newParticipant = await prisma.participant.create({
      data: {
        id: crypto.randomUUID(),
        name: participantData.name,
        gender: participantData.gender,
        benchKg: participantData.benchKg,
        runTimeSeconds: participantData.runTimeSeconds
      }
    });
    return {
      id: newParticipant.id,
      name: newParticipant.name,
      gender: newParticipant.gender as 'male' | 'female' | 'other',
      benchKg: newParticipant.benchKg,
      runTimeSeconds: newParticipant.runTimeSeconds
    };
  } catch (err) {
    console.error('Error adding participant:', err);
    throw err;
  }
}

export async function updateParticipant(id: string, data: Partial<Pick<Participant, 'name' | 'benchKg' | 'runTimeSeconds' | 'gender'>>): Promise<Participant | null> {
  try {
    const updatedParticipant = await prisma.participant.update({
      where: { id },
      data: {
        name: data.name,
        gender: data.gender,
        benchKg: data.benchKg,
        runTimeSeconds: data.runTimeSeconds
      }
    });
    return {
      id: updatedParticipant.id,
      name: updatedParticipant.name,
      gender: updatedParticipant.gender as 'male' | 'female' | 'other',
      benchKg: updatedParticipant.benchKg,
      runTimeSeconds: updatedParticipant.runTimeSeconds
    };
  } catch (err) {
    console.error('Error updating participant:', err);
    return null;
  }
}

export async function deleteParticipant(id: string): Promise<void> {
  try {
    await prisma.participant.delete({
      where: { id }
    });
  } catch (err) {
    console.error('Error deleting participant:', err);
    throw err;
  }
} 