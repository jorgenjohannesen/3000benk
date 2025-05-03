'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { DataTable } from "@/components/ui/data-table"
import { Row } from "@tanstack/react-table"
import { toast } from "sonner";

const columns = [
  {
    accessorKey: "name",
    header: "Navn",
  },
  {
    accessorKey: "benchKg",
    header: "Benkpress (kg)",
    cell: ({ row }: { row: Row<Participant> }) => {
      return <span>{row.original.benchKg || 0}</span>;
    },
  },
  {
    accessorKey: "startTime",
    header: "Starttid",
    cell: ({ row }: { row: Row<Participant> }) => {
      const startTime = calculateStartTime(row.original.benchKg || 0);
      return <span>{startTime}</span>;
    },
  },
];

function calculateStartTime(benchKg: number): string {
  const baseTime = new Date('2025-05-02T13:30:00Z');
  const minutesToAdd = Math.floor((3000 - benchKg) / 10);
  const startTime = new Date(baseTime.getTime() + minutesToAdd * 60000);
  return startTime.toLocaleTimeString('nb-NO', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Oslo'
  });
}

export default function StartingTimesPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadParticipants() {
      try {
        const response = await fetch('/api/participants');
        if (!response.ok) throw new Error('Failed to fetch participants');
        const data = await response.json();
        setParticipants(data);
      } catch (error) {
        console.error('Kunne ikke laste deltakere:', error);
        toast.error('Kunne ikke laste deltakere');
      } finally {
        setLoading(false);
      }
    }

    loadParticipants();
  }, []);

  const maleParticipants = participants
    .filter(participant => participant.gender === 'male')
    .sort((a, b) => (b.benchKg || 0) - (a.benchKg || 0));

  const femaleParticipants = participants
    .filter(participant => participant.gender === 'female')
    .sort((a, b) => (b.benchKg || 0) - (a.benchKg || 0));

  const strongestMale = maleParticipants[0];
  const strongestFemale = femaleParticipants[0];

  // Only show male participants with a bench press value
  const filteredMaleParticipants = maleParticipants.filter(
    (p) => p.benchKg !== null && p.benchKg !== undefined
  );
  // Sort by bench press descending
  const sortedMaleParticipants = [...filteredMaleParticipants].sort((a, b) => (b.benchKg || 0) - (a.benchKg || 0));
  const strongestMaleBench = sortedMaleParticipants[0]?.benchKg || 0;

  // Only show participants with a bench press value
  const filteredFemaleParticipants = femaleParticipants.filter(
    (p) => p.benchKg !== null && p.benchKg !== undefined
  );
  // Sort by bench press descending
  const sortedFemaleParticipants = [...filteredFemaleParticipants].sort((a, b) => (b.benchKg || 0) - (a.benchKg || 0));
  const strongestFemaleBench = sortedFemaleParticipants[0]?.benchKg || 0;

  function formatOffset(seconds: number) {
    if (seconds <= 0) return '0 sekunder bak';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (min > 0) return `${min} min ${sec} sekunder bak`;
    return `${sec} sekunder bak`;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span className="text-blue-700 font-medium">Laster...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Starttider</h1>

      {/* Men's Section */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Herreklasse</h2>
        {strongestMale && (
          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 mb-8">
            <p className="text-blue-700">
                <span className="font-semibold">Den sterkeste mannen:</span> {strongestMale.name} ({strongestMale.benchKg} kg) starter først!
            </p>
          </div>
        )}
        <DataTable
          columns={[
            {
              accessorKey: 'name',
              header: 'Navn',
            },
            {
              accessorKey: 'gender',
              header: 'Kjønn',
              cell: ({ row }) => {
                const gender = row.getValue('gender') as string;
                const genderMap: { [key: string]: string } = {
                  male: 'Mann',
                  female: 'Kvinne',
                  other: 'Annet',
                };
                return genderMap[gender] || gender;
              },
            },
            {
              accessorKey: 'benchKg',
              header: 'Benkpress (kg)',
              cell: ({ row }) => {
                const benchKg = row.getValue('benchKg') as number;
                return benchKg ? `${benchKg} kg` : '-';
              },
            },
            {
              id: 'offset',
              header: 'Startforskjell',
              cell: ({ row }) => {
                const benchKg = row.getValue('benchKg') as number;
                const offset = (strongestMaleBench - (benchKg || 0)) * 3;
                return formatOffset(offset);
              },
            },
          ]}
          data={sortedMaleParticipants}
        />
      </div>

      {/* Women's Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dameklasse</h2>
        {strongestFemale && (
          <div className="bg-pink-100 border-l-4 border-pink-500 p-4 mb-8">
            <p className="text-pink-700">
              <span className="font-semibold">Den sterkeste kvinnen:</span> {strongestFemale.name} ({strongestFemale.benchKg} kg) starter først!
            </p>
          </div>
        )}
        <DataTable
          columns={[
            {
              accessorKey: 'name',
              header: 'Navn',
            },
            {
              accessorKey: 'gender',
              header: 'Kjønn',
              cell: ({ row }) => {
                const gender = row.getValue('gender') as string;
                const genderMap: { [key: string]: string } = {
                  male: 'Mann',
                  female: 'Kvinne',
                  other: 'Annet',
                };
                return genderMap[gender] || gender;
              },
            },
            {
              accessorKey: 'benchKg',
              header: 'Benkpress (kg)',
              cell: ({ row }) => {
                const benchKg = row.getValue('benchKg') as number;
                return benchKg ? `${benchKg} kg` : '-';
              },
            },
            {
              id: 'offset',
              header: 'Startforskjell',
              cell: ({ row }) => {
                const benchKg = row.getValue('benchKg') as number;
                const offset = (strongestFemaleBench - (benchKg || 0)) * 3;
                return formatOffset(offset);
              },
            },
          ]}
          data={sortedFemaleParticipants}
        />
      </div>
    </div>
  );
} 