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

export default function HomePage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Welcome to 3000 Benk</h1>
        
        <div className="prose">
          <h2>Competition Rules</h2>
          <ol>
            <li>Each participant starts with a 1RM bench press</li>
            <li>For every kilogram lifted, you get 3 seconds head start</li>
            <li>The strongest lifter starts first</li>
            <li>For every kilogram less than the strongest, you start 3 seconds later</li>
            <li>First to the finish line wins!</li>
          </ol>

          <h2>How to Participate</h2>
          <p>
            Check the <a href="/leaderboard">leaderboard</a> to see current standings and your <a href="/starting-times">starting time</a>.
          </p>
        </div>
      </div>
    </div>
  );
} 