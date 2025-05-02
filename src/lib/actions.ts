'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Participant, getParticipants, addParticipant, updateParticipant, deleteParticipant } from './data';

// Zod schema for validation
const ParticipantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    gender: z.enum(['male', 'female', 'other']),
    benchKg: z.number().nullable(),
    runTimeSeconds: z.number().nullable(),
});

const BenchSchema = z.object({
    id: z.string(),
    benchKg: z.coerce.number().min(0, "Bench KG must be positive").nullable(), // coerce converts string input
});

const RunTimeSchema = z.object({
    id: z.string(),
    // Accept MM:SS format or just seconds
    runTimeInput: z.string().refine((val) => {
        if (val === null || val === '') return true; // Allow empty input
        if (/^\d+$/.test(val)) return true; // Allow raw seconds
        return /^\d{1,2}:\d{2}(\.\d+)?$/.test(val); // Allow MM:SS or MM:SS.ms
    }, { message: "Invalid time format (use MM:SS or seconds)" }).nullable(),
});

export async function getParticipantsWithSort(): Promise<Participant[]> {
    const participants = await getParticipants();
    return participants.sort((a, b) => {
        if (a.benchKg !== b.benchKg) {
            return (b.benchKg || 0) - (a.benchKg || 0)
        }
        return a.name.localeCompare(b.name)
    });
}

export async function handleAddParticipant(formData: FormData) {
    const name = formData.get("name") as string
    const gender = formData.get("gender") as "male" | "female" | "other"
    const benchKg = formData.get("benchKg") ? Number(formData.get("benchKg")) : null
    const runTimeSeconds = formData.get("runTimeSeconds") ? Number(formData.get("runTimeSeconds")) : null

    const validation = ParticipantSchema.safeParse({
        name,
        gender,
        benchKg,
        runTimeSeconds,
    })

    if (!validation.success) {
        return { success: false, error: validation.error.format() }
    }

    const participant: Omit<Participant, 'id'> = {
        name,
        gender,
        benchKg,
        runTimeSeconds,
    }
    const newParticipant = await addParticipant(participant);
    revalidatePath('/admin');
    revalidatePath('/startlist');
    revalidatePath('/leaderboard');
    return { success: true, data: newParticipant }
}

export async function handleUpdateParticipant(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const gender = formData.get("gender") as "male" | "female" | "other"
    const benchKg = formData.get("benchKg") ? Number(formData.get("benchKg")) : null
    const runTimeSeconds = formData.get("runTimeSeconds") ? Number(formData.get("runTimeSeconds")) : null

    const validation = ParticipantSchema.safeParse({
        name,
        gender,
        benchKg,
        runTimeSeconds,
    })

    if (!validation.success) {
        return { success: false, error: validation.error.format() }
    }

    const updated = await updateParticipant(id, { name, gender, benchKg, runTimeSeconds });
    revalidatePath('/admin');
    revalidatePath('/startlist');
    revalidatePath('/leaderboard');
    return { success: true, data: updated }
}

export async function handleDeleteParticipant(id: string) {
    await deleteParticipant(id);
    revalidatePath('/admin');
    revalidatePath('/startlist');
    revalidatePath('/leaderboard');
    return { success: true }
}

export async function handleUpdateBench(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const benchKg = formData.get('benchKg') ? Number(formData.get('benchKg')) : null;

    const participant = await handleUpdateParticipant(id, formData);
    if (!participant.success) {
        return { message: 'Failed to update bench result.', errors: participant.error };
    }

    revalidatePath('/admin');
    revalidatePath('/startlist');
    revalidatePath('/leaderboard');
    return { message: 'Bench result updated.', errors: {} };
}

export async function handleUpdateRunTime(prevState: any, formData: FormData) {
    const id = formData.get('id') as string;
    const runTimeSeconds = formData.get('runTimeSeconds') ? Number(formData.get('runTimeSeconds')) : null;

    const participant = await handleUpdateParticipant(id, formData);
    if (!participant.success) {
        return { message: 'Failed to update run time.', errors: participant.error };
    }

    revalidatePath('/admin');
    revalidatePath('/leaderboard');
    return { message: 'Run time updated.', errors: {} };
} 