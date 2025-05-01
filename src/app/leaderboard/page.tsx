'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { getParticipantsWithSort } from '@/lib/actions';
import { formatTime } from '@/lib/utils';
import { DataTable } from "@/components/ui/data-table"
import { createColumns } from "./columns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

type SortField = keyof Participant | 'score';

export default function LeaderboardPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const calculateScore = (participant: Participant) => {
    if (!participant.benchKg || !participant.runTimeSeconds) return Infinity;
    return participant.runTimeSeconds - (participant.benchKg * 3);
  };

  const filteredAndSortedParticipants = participants
    .filter(participant => genderFilter === 'all' || participant.gender === genderFilter)
    .sort((a, b) => {
      if (sortField === 'score') {
        const scoreA = calculateScore(a);
        const scoreB = calculateScore(b);
        return sortDirection === 'asc' ? scoreA - scoreB : scoreB - scoreA;
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
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
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
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => handleSort('name')}
            className={sortField === 'name' ? 'bg-gray-100' : ''}
          >
            Name {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSort('benchKg')}
            className={sortField === 'benchKg' ? 'bg-gray-100' : ''}
          >
            Bench Press {sortField === 'benchKg' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSort('runTimeSeconds')}
            className={sortField === 'runTimeSeconds' ? 'bg-gray-100' : ''}
          >
            Run Time {sortField === 'runTimeSeconds' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleSort('score')}
            className={sortField === 'score' ? 'bg-gray-100' : ''}
          >
            Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Button>
        </div>
      </div>

      <DataTable columns={columns} data={filteredAndSortedParticipants} />
    </div>
  );
} 