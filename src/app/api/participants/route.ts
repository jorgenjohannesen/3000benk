/****************************************************************************************
 * FILE:  app/api/participants/route.ts
 *       – list + create
 ****************************************************************************************/
import { NextResponse, NextRequest } from 'next/server';
import { z } from 'zod';
import { getParticipants, addParticipant } from '@/lib/data';

/* ---------- validation -------------------------------------------------- */

const CreateSchema = z.object({
  name:   z.string().min(1, 'Name is required'),
  gender: z.enum(['male', 'female', 'other']).default('other'),
  benchKg: z.coerce.number().min(0).nullable().optional(),
  // choose ONE of the run‑time fields
  runTimeSeconds: z.coerce.number().int().positive().optional(),
  runTimeInput:   z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine(
      (v) => !v || /^\d+$/.test(v) || /^\d{1,2}:\d{2}(?:\.\d+)?$/.test(v),
      { message: 'runTimeInput must be SS or MM:SS(.ms)' },
    ),
});

function toSeconds(input: string): number {
  if (input.includes(':')) {
    const [m, s] = input.split(':');
    return parseInt(m, 10) * 60 + parseFloat(s);
  }
  return parseFloat(input);
}

/* ---------- handlers ---------------------------------------------------- */

// GET /api/participants ----------------------------------------------------
export async function GET(_req: NextRequest) {
  const participants = await getParticipants();
  return NextResponse.json(participants);
}

// POST /api/participants ---------------------------------------------------
export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { name, gender, benchKg, runTimeSeconds, runTimeInput } = parsed.data;

  try {
    const participant = await addParticipant({
      name,
      gender,
      benchKg: benchKg ?? 0,
      runTimeSeconds: runTimeSeconds ?? (runTimeInput ? toSeconds(runTimeInput) : null),
    });
    return NextResponse.json(participant, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create participant' }, { status: 500 });
  }
} 