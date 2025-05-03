'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { formatTime } from '@/lib/utils';
import { DataTable } from "@/components/ui/data-table"
import { createColumns } from "./columns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { toast } from "sonner";

type SortField = keyof Participant | 'score';

export default function LeaderboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const calculateScore = (participant: Participant) => {
    if (!participant.benchKg || !participant.runTimeSeconds) return 0;
    return participant.runTimeSeconds - participant.benchKg*3;
  };

  const filteredParticipants = participants.filter(
    (p) => p.benchKg !== null && p.benchKg !== undefined && p.runTimeSeconds !== null && p.runTimeSeconds !== undefined
  );

  const womenParticipants = filteredParticipants
    .filter(participant => participant.gender === 'female')
    .map(participant => ({
      ...participant,
      score: calculateScore(participant)
    }))
    .sort((a, b) => {
      if (sortField === 'score') {
        return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
      }
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const openClassParticipants = filteredParticipants
    .filter(participant => participant.gender !== 'female')
    .map(participant => ({
      ...participant,
      score: calculateScore(participant)
    }))
    .sort((a, b) => {
      if (sortField === 'score') {
        return sortDirection === 'asc' ? a.score - b.score : b.score - a.score;
      }
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortDirection === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const columns = createColumns();

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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Resultatliste</h1>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleSort('name')}
            className={sortField === 'name' ? 'bg-gray-100' : ''}
          >
            Navn {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSort('benchKg')}
            className={sortField === 'benchKg' ? 'bg-gray-100' : ''}
          >
            Benkpress {sortField === 'benchKg' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSort('runTimeSeconds')}
            className={sortField === 'runTimeSeconds' ? 'bg-gray-100' : ''}
          >
            Løpetid {sortField === 'runTimeSeconds' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSort('score')}
            className={sortField === 'score' ? 'bg-gray-100' : ''}
          >
            Poeng {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Kvinneklasse</h2>
          <DataTable columns={columns} data={womenParticipants} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Åpen klasse</h2>
          <DataTable columns={columns} data={openClassParticipants} />
        </div>
      </div>
    </div>
  );
} 