import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const participants = await prisma.participant.findMany();
  return NextResponse.json(participants);
} 