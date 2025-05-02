'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { handleAddParticipant } from '@/lib/actions';

interface CSVRow {
  name: string;
  gender: string;
  benchKg: number;
}

interface CSVUploadProps {
  onUploadComplete: () => Promise<void>;
}

export function CSVUpload({ onUploadComplete }: CSVUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStatus('Behandler CSV-fil...');

    try {
      const text = await file.text();
      const rows = text.split('\n').map(row => row.trim()).filter(row => row);
      
      // Skip header row
      const dataRows = rows.slice(1);
      
      let successCount = 0;
      let errorCount = 0;

      for (const row of dataRows) {
        const [name, gender, benchKg] = row.split(',').map(item => item.trim());
        
        if (!name || !gender || !benchKg) {
          errorCount++;
          continue;
        }

        const participantData = {
          name,
          gender: gender.toLowerCase(),
          benchKg: parseInt(benchKg),
          runTimeSeconds: 0
        };

        const formData = new FormData();
        Object.entries(participantData).forEach(([key, value]) => {
          formData.append(key, value?.toString() || '');
        });

        const result = await handleAddParticipant(formData);
        if (result.success) {
          successCount++;
        } else {
          errorCount++;
        }
      }

      setStatus(`${successCount} deltakere lagt til, ${errorCount} feil.`);
      await onUploadComplete();
    } catch (error) {
      console.error('Feil ved behandling av CSV-fil:', error);
      setStatus('Det oppstod en feil ved behandling av filen.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => document.getElementById('csv-upload')?.click()}
          disabled={isProcessing}
        >
          {isProcessing ? 'Behandler...' : 'Last opp CSV'}
        </Button>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isProcessing}
        />
      </div>
      {status && (
        <p className="text-sm text-gray-600">{status}</p>
      )}
      <div className="text-sm text-gray-500">
        <p>CSV-format:</p>
        <pre className="mt-1 p-2 bg-gray-100 rounded">
          navn,kjønn,benkpress_kg
          <br />
          Eksempel:
          <br />
          Jan Kristian,male,150
        </pre>
      </div>
    </div>
  );
} 