'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { getParticipantsWithSort } from '@/lib/actions';
import { formatTime } from '@/lib/utils';
import { DataTable } from "@/components/ui/data-table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Row } from "@tanstack/react-table"

export default function StartingTimesPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>('all');

  useEffect(() => {
    async function loadParticipants() {
      try {
        const data = await getParticipantsWithSort();
        setParticipants(data);
      } catch (error) {
        console.error('Failed to load participants:', error);
      } finally {
        setLoading(false);
      }
    }

    loadParticipants();
  }, []);

  const calculateStartTime = (participant: Participant, maxBench: number) => {
    if (!participant.benchKg) return "-";
    const delay = (maxBench - participant.benchKg) * 3;
    return formatTime(delay);
  };

  const filteredParticipants = participants
    .filter(participant => genderFilter === 'all' || participant.gender === genderFilter)
    .sort((a, b) => (b.benchKg || 0) - (a.benchKg || 0));

  const maxBench = Math.max(...participants.map(p => p.benchKg || 0));

  const columns = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "gender",
      header: "Gender",
    },
    {
      accessorKey: "benchKg",
      header: "Bench Press (kg)",
      cell: ({ row }: { row: Row<Participant> }) => {
        const benchKg = row.getValue("benchKg") as number;
        return benchKg ? `${benchKg} kg` : "-";
      },
    },
    {
      id: "startTime",
      header: "Start Time",
      cell: ({ row }: { row: Row<Participant> }) => {
        const participant = row.original;
        return calculateStartTime(participant, maxBench);
      },
    },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Starting Times</h1>
        <Select value={genderFilter} onValueChange={setGenderFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Genders</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <p className="text-gray-600">
          The strongest lifter ({(participants.find(p => p.benchKg === maxBench)?.name || "Unknown")} with {maxBench} kg) starts first.
          Everyone else starts 3 seconds later for each kilogram less.
        </p>
      </div>

      <DataTable columns={columns} data={filteredParticipants} />
    </div>
  );
} 