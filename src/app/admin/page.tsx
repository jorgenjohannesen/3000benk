'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { getParticipantsWithSort, handleAddParticipant, handleUpdateParticipant, handleDeleteParticipant } from '@/lib/actions';
import { DataTable } from "@/components/ui/data-table"
import { createColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CSVUpload } from "@/components/csv-upload"

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [newParticipant, setNewParticipant] = useState<Partial<Participant>>({
    name: '',
    gender: 'male',
    benchKg: null,
    runTimeSeconds: null,
    bibNumber: undefined
  });

  useEffect(() => {
    loadParticipants();
  }, []);

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

  const handleAdd = async () => {
    if (!newParticipant.name) {
      alert('Vennligst fyll ut alle påkrevde felt');
      return;
    }

    const formData = new FormData();
    formData.append('name', newParticipant.name);
    formData.append('gender', newParticipant.gender || 'male');
    if (newParticipant.bibNumber) formData.append('bibNumber', newParticipant.bibNumber);
    if (newParticipant.benchKg) formData.append('benchKg', newParticipant.benchKg.toString());
    if (newParticipant.runTimeSeconds) formData.append('runTimeSeconds', newParticipant.runTimeSeconds.toString());
    
    try {
      const result = await handleAddParticipant(formData);
      if (result.success) {
        setNewParticipant({
          name: '',
          gender: 'male',
          benchKg: null,
          runTimeSeconds: null,
          bibNumber: undefined
        });
        loadParticipants();
      } else {
        alert('Kunne ikke legge til deltaker: ' + JSON.stringify(result.error));
      }
    } catch (error) {
      console.error('Kunne ikke legge til deltaker:', error);
    }
  };

  const handleEdit = async () => {
    if (!editingParticipant?.name) {
      alert('Vennligst fyll ut alle påkrevde felt');
      return;
    }

    const formData = new FormData();
    formData.append('name', editingParticipant.name);
    formData.append('gender', editingParticipant.gender);
    if (editingParticipant.bibNumber) formData.append('bibNumber', editingParticipant.bibNumber);
    if (editingParticipant.benchKg) formData.append('benchKg', editingParticipant.benchKg.toString());
    if (editingParticipant.runTimeSeconds) formData.append('runTimeSeconds', editingParticipant.runTimeSeconds.toString());
    
    try {
      const result = await handleUpdateParticipant(editingParticipant.id, formData);
      if (result.success) {
        setEditingParticipant(null);
        loadParticipants();
      } else {
        alert('Kunne ikke oppdatere deltaker: ' + JSON.stringify(result.error));
      }
    } catch (error) {
      console.error('Kunne ikke oppdatere deltaker:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Er du sikker på at du vil slette denne deltakeren?')) {
      try {
        const result = await handleDeleteParticipant(id);
        if (result.success) {
          loadParticipants();
        } else {
          alert('Kunne ikke slette deltaker');
        }
      } catch (error) {
        console.error('Kunne ikke slette deltaker:', error);
      }
    }
  };

  const columns = createColumns(handleDelete, setEditingParticipant);

  if (loading) {
    return <div>Laster...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrasjon</h1>
        <CSVUpload onUploadComplete={loadParticipants} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{editingParticipant ? 'Rediger deltaker' : 'Legg til ny deltaker'}</h2>
          <div className="space-y-2">
            <Label htmlFor="name">Navn *</Label>
            <Input
              id="name"
              value={editingParticipant?.name || newParticipant.name || ''}
              onChange={(e) => {
                if (editingParticipant) {
                  setEditingParticipant({ ...editingParticipant, name: e.target.value });
                } else {
                  setNewParticipant({ ...newParticipant, name: e.target.value });
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Kjønn *</Label>
            <Select
              value={editingParticipant?.gender || newParticipant.gender}
              onValueChange={(value) => {
                if (editingParticipant) {
                  setEditingParticipant({ ...editingParticipant, gender: value as 'male' | 'female' | 'other' });
                } else {
                  setNewParticipant({ ...newParticipant, gender: value as 'male' | 'female' | 'other' });
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Velg kjønn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Mann</SelectItem>
                <SelectItem value="female">Kvinne</SelectItem>
                <SelectItem value="other">Annet</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="benchKg">Benkpress (kg)</Label>
            <Input
              id="benchKg"
              type="number"
              min="0"
              value={editingParticipant?.benchKg || newParticipant.benchKg || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                if (editingParticipant) {
                  setEditingParticipant({ ...editingParticipant, benchKg: value });
                } else {
                  setNewParticipant({ ...newParticipant, benchKg: value });
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="runTimeSeconds">Løpetid (sekunder)</Label>
            <Input
              id="runTimeSeconds"
              type="number"
              min="0"
              value={editingParticipant?.runTimeSeconds || newParticipant.runTimeSeconds || ''}
              onChange={(e) => {
                const value = e.target.value ? parseInt(e.target.value) : null;
                if (editingParticipant) {
                  setEditingParticipant({ ...editingParticipant, runTimeSeconds: value });
                } else {
                  setNewParticipant({ ...newParticipant, runTimeSeconds: value });
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bibNumber">Startnummer</Label>
            <Input
              id="bibNumber"
              type="text"
              value={editingParticipant?.bibNumber || newParticipant.bibNumber || ''}
              onChange={(e) => {
                const value = e.target.value || undefined;
                if (editingParticipant) {
                  setEditingParticipant({ ...editingParticipant, bibNumber: value });
                } else {
                  setNewParticipant({ ...newParticipant, bibNumber: value });
                }
              }}
            />
          </div>
          <div className="flex gap-4">
            {editingParticipant ? (
              <>
                <Button onClick={handleEdit}>Lagre endringer</Button>
                <Button variant="outline" onClick={() => setEditingParticipant(null)}>Avbryt</Button>
              </>
            ) : (
              <Button onClick={handleAdd}>Legg til deltaker</Button>
            )}
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={participants} />
    </div>
  );
} 