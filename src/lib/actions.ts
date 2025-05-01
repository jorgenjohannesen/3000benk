'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { Participant } from './data';
import { redirect } from 'next/navigation';
import { put, list, del } from "@vercel/blob";

// Zod schema for validation
const ParticipantSchema = z.object({
    name: z.string().min(1, "Name is required"),
    gender: z.enum(['male', 'female', 'other']),
    bibNumber: z.string().optional(),
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
    const { blobs } = await list({ prefix: "participants/" })
    const participants: Participant[] = []

    for (const blob of blobs) {
        const response = await fetch(blob.url)
        const data = await response.json()
        participants.push(data)
    }

    return participants.sort((a, b) => {
        if (a.benchKg !== b.benchKg) {
            return (b.benchKg || 0) - (a.benchKg || 0)
        }
        return a.name.localeCompare(b.name)
    })
}

export async function handleAddParticipant(formData: FormData) {
    const name = formData.get("name") as string
    const gender = formData.get("gender") as "male" | "female" | "other"
    const bibNumber = formData.get("bibNumber") as string
    const benchKg = formData.get("benchKg") ? Number(formData.get("benchKg")) : null
    const runTimeSeconds = formData.get("runTimeSeconds") ? Number(formData.get("runTimeSeconds")) : null

    const validation = ParticipantSchema.safeParse({
        name,
        gender,
        bibNumber,
        benchKg,
        runTimeSeconds,
    })

    if (!validation.success) {
        return { success: false, error: validation.error.format() }
    }

    const participant: Participant = {
        id: crypto.randomUUID(),
        name,
        gender,
        bibNumber,
        benchKg,
        runTimeSeconds,
    }

    await put(`participants/${participant.id}.json`, JSON.stringify(participant), {
        access: "public",
    })

    revalidatePath('/admin');
    revalidatePath('/startlist');
    revalidatePath('/leaderboard');

    return { success: true, data: participant }
}

export async function handleUpdateParticipant(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const gender = formData.get("gender") as "male" | "female" | "other"
    const bibNumber = formData.get("bibNumber") as string
    const benchKg = formData.get("benchKg") ? Number(formData.get("benchKg")) : null
    const runTimeSeconds = formData.get("runTimeSeconds") ? Number(formData.get("runTimeSeconds")) : null

    const validation = ParticipantSchema.safeParse({
        name,
        gender,
        bibNumber,
        benchKg,
        runTimeSeconds,
    })

    if (!validation.success) {
        return { success: false, error: validation.error.format() }
    }

    const participant: Participant = {
        id,
        name,
        gender,
        bibNumber,
        benchKg,
        runTimeSeconds,
    }

    await put(`participants/${id}.json`, JSON.stringify(participant), {
        access: "public",
        allowOverwrite: true
    })

    revalidatePath('/admin');
    revalidatePath('/startlist');
    revalidatePath('/leaderboard');

    return { success: true, data: participant }
}

export async function handleDeleteParticipant(id: string) {
    await del(`participants/${id}.json`)
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