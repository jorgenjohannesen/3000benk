'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { getParticipantsWithSort } from '@/lib/actions';
import { formatTime } from '@/lib/utils';
import { DataTable } from "@/components/ui/data-table"
import { createColumns } from "./columns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Metadata } from "next"
import Link from "next/link"
import { Countdown } from "@/components/countdown"
import Image from "next/image"
import Confetti from 'react-confetti';

type SortField = keyof Participant | 'score';

export default function HomePage() {
  const [showConfetti, setShowConfetti] = useState(true);
  const [showPopup, setShowPopup] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Set window size on client only
    function handleResize() {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Stop confetti after 5 seconds
    if (showConfetti) {
      const timer = setTimeout(() => setShowConfetti(false), 30000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  return (
    <div className="relative min-h-screen">
      {showConfetti && dimensions.width > 0 && dimensions.height > 0 && (
        <Confetti width={dimensions.width} height={dimensions.height} recycle={false} numberOfPieces={400} />
      )}
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/3000benk.jpg"
          alt="3000 Benk Konkurranse"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" /> {/* Semi-transparent overlay */}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold text-white mb-4">3000 Benk</h1>
              <p className="text-xl text-white/90 mb-6">
                Den ultimate testen av styrke og utholdenhet
              </p>
              <div className="bg-yellow-100/90 border-l-4 border-yellow-500 p-4 mb-8">
                <p className="text-yellow-700">
                  <span className="font-semibold">Regjerende Mester:</span> Erlend Aanesland Dahle
                </p>
              </div>
              <Countdown />
            </div>

            <div className="bg-white/90 rounded-lg shadow-lg p-8 mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Konkurranseregler</h2>
              <ol className="space-y-4 text-gray-700">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">1</span>
                  <span>Den sterkeste løfteren (høyest benkpress) starter først. Hver påfølgende deltaker starter basert på sin benkpress-ytelse.</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">2</span>
                  <span>Dette er en jaktstart - når den første deltakeren begynner å løpe, er løpet i gang!</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold mr-4">3</span>
                  <span>Din sluttid registreres fra når du begynner å løpe. Den første som krysser mållinjen vinner!</span>
                </li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Link 
                href="/leaderboard" 
                className="bg-white/90 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Resultatliste</h3>
                <p className="text-gray-600">Se nåværende plasseringer og konkurranseresultater</p>
              </Link>
              <Link 
                href="/starting-times" 
                className="bg-white/90 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
              >
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Starttider</h3>
                <p className="text-gray-600">Se når hver deltaker starter basert på sin benkpress</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 