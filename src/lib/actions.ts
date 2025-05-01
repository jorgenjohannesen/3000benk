'use server';

import { z } from 'zod';
import { 
  addParticipant, 
  updateParticipant, 
  deleteParticipant, 
  getParticipants, 
  Participant 
} from './data';
import { revalidatePath } from 'next/cache';
import { v4 as uuid } from 'uuid';

// Schema for participant validation
const participantSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  startNumber: z.number().optional(),
  startTime: z.string().optional(),
  finishTime: z.string().optional(),
  category: z.string().optional(),
  notes: z.string().optional(),
});

// Add a new participant
export async function createParticipant(formData: FormData) {
  const name = formData.get('name') as string;
  const startNumber = formData.get('startNumber') ? parseInt(formData.get('startNumber') as string) : undefined;
  const startTime = formData.get('startTime') as string || undefined;
  const finishTime = formData.get('finishTime') as string || undefined;
  const category = formData.get('category') as string || undefined;
  const notes = formData.get('notes') as string || undefined;

  try {
    // Validate data
    participantSchema.parse({
      name,
      startNumber,
      startTime,
      finishTime,
      category,
      notes,
    });

    // Create participant
    const participant: Participant = {
      id: uuid(),
      name,
      startNumber,
      startTime,
      finishTime,
      category,
      notes,
    };

    await addParticipant(participant);
    revalidatePath('/admin');
    revalidatePath('/leaderboard');
    revalidatePath('/startlist');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }
    return { success: false, error: 'Failed to create participant' };
  }
}

// Update a participant
export async function updateParticipantAction(id: string, formData: FormData) {
  const name = formData.get('name') as string;
  const startNumber = formData.get('startNumber') ? parseInt(formData.get('startNumber') as string) : undefined;
  const startTime = formData.get('startTime') as string || undefined;
  const finishTime = formData.get('finishTime') as string || undefined;
  const category = formData.get('category') as string || undefined;
  const notes = formData.get('notes') as string || undefined;

  try {
    // Validate data
    participantSchema.parse({
      name,
      startNumber,
      startTime,
      finishTime,
      category,
      notes,
    });

    // Update participant
    await updateParticipant(id, {
      name,
      startNumber,
      startTime,
      finishTime,
      category,
      notes,
    });
    
    revalidatePath('/admin');
    revalidatePath('/leaderboard');
    revalidatePath('/startlist');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.flatten().fieldErrors };
    }
    return { success: false, error: 'Failed to update participant' };
  }
}

// Delete a participant
export async function deleteParticipantAction(id: string) {
  try {
    await deleteParticipant(id);
    revalidatePath('/admin');
    revalidatePath('/leaderboard');
    revalidatePath('/startlist');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to delete participant' };
  }
}

// Get participants with optional sorting
export async function getParticipantsWithSort(sortBy?: 'startTime' | 'finishTime' | 'startNumber' | 'name') {
  const participants = await getParticipants();
  
  if (!sortBy) return participants;
  
  return participants.sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    
    if (sortBy === 'startNumber') {
      const aNum = a.startNumber || 0;
      const bNum = b.startNumber || 0;
      return aNum - bNum;
    }
    
    if (sortBy === 'startTime' || sortBy === 'finishTime') {
      const aTime = a[sortBy] || '';
      const bTime = b[sortBy] || '';
      return aTime.localeCompare(bTime);
    }
    
    return 0;
  });
} 