'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { getParticipantsWithSort } from '@/lib/actions';
import { DataTable } from "@/components/ui/data-table"
import { Row } from "@tanstack/react-table"

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
        const data = await getParticipantsWithSort();
        setParticipants(data);
      } catch (error) {
        console.error('Kunne ikke laste deltakere:', error);
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

  if (loading) {
    return <div>Laster...</div>;
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
              <span className="font-semibold">Den sterkeste mannen:</span> {strongestMale.name} ({strongestMale.benchKg} kg) starter kl. {calculateStartTime(strongestMale.benchKg || 0)}
            </p>
          </div>
        )}
        <DataTable columns={columns} data={maleParticipants} />
      </div>

      {/* Women's Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Dameklasse</h2>
        {strongestFemale && (
          <div className="bg-pink-100 border-l-4 border-pink-500 p-4 mb-8">
            <p className="text-pink-700">
              <span className="font-semibold">Den sterkeste kvinnen:</span> {strongestFemale.name} ({strongestFemale.benchKg} kg) starter kl. {calculateStartTime(strongestFemale.benchKg || 0)}
            </p>
          </div>
        )}
        <DataTable columns={columns} data={femaleParticipants} />
      </div>
    </div>
  );
} 