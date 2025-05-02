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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newParticipant, setNewParticipant] = useState<Partial<Participant>>({
    name: '',
    gender: 'male',
    benchKg: null,
    runTimeSeconds: null
  });
  const [runMinutes, setRunMinutes] = useState('');
  const [runSeconds, setRunSeconds] = useState('');

  useEffect(() => {
    loadParticipants();
  }, []);

  useEffect(() => {
    if (editingParticipant) {
      setRunMinutes(editingParticipant.runTimeSeconds ? Math.floor(editingParticipant.runTimeSeconds / 60).toString() : '');
      setRunSeconds(editingParticipant.runTimeSeconds ? (editingParticipant.runTimeSeconds % 60).toString() : '');
    } else {
      setRunMinutes('');
      setRunSeconds('');
    }
  }, [editingParticipant, isDialogOpen]);

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
    const totalSeconds = (parseInt(runMinutes) || 0) * 60 + (parseInt(runSeconds) || 0);
    const formData = new FormData();
    formData.append('name', newParticipant.name);
    formData.append('gender', newParticipant.gender || 'male');
    if (newParticipant.benchKg) formData.append('benchKg', newParticipant.benchKg.toString());
    if (totalSeconds > 0) formData.append('runTimeSeconds', totalSeconds.toString());
    
    try {
      const result = await handleAddParticipant(formData);
      if (result.success) {
        setNewParticipant({
          name: '',
          gender: 'male',
          benchKg: null,
          runTimeSeconds: null
        });
        setRunMinutes('');
        setRunSeconds('');
        setIsDialogOpen(false);
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
    const totalSeconds = (parseInt(runMinutes) || 0) * 60 + (parseInt(runSeconds) || 0);
    const formData = new FormData();
    formData.append('name', editingParticipant.name);
    formData.append('gender', editingParticipant.gender);
    if (editingParticipant.benchKg) formData.append('benchKg', editingParticipant.benchKg.toString());
    if (totalSeconds > 0) formData.append('runTimeSeconds', totalSeconds.toString());
    
    try {
      const result = await handleUpdateParticipant(editingParticipant.id, formData);
      if (result.success) {
        setEditingParticipant(null);
        setRunMinutes('');
        setRunSeconds('');
        setIsDialogOpen(false);
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

  const handleOpenEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setEditingParticipant(null);
    setNewParticipant({
      name: '',
      gender: 'male',
      benchKg: null,
      runTimeSeconds: null
    });
    setRunMinutes('');
    setRunSeconds('');
    setIsDialogOpen(false);
  };

  const columns = createColumns(handleDelete, handleOpenEdit);

  if (loading) {
    return <div>Laster...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Administrasjon</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsDialogOpen(true)}>Legg til deltaker</Button>
          <CSVUpload onUploadComplete={loadParticipants} />
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingParticipant ? 'Rediger deltaker' : 'Legg til ny deltaker'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
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
              <Label htmlFor="runTime">Løpetid</Label>
              <div className="flex gap-2">
                <Input
                  id="runMinutes"
                  type="number"
                  min="0"
                  placeholder="minutter"
                  value={runMinutes}
                  onChange={e => setRunMinutes(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-24"
                />
                <span>:</span>
                <Input
                  id="runSeconds"
                  type="number"
                  min="0"
                  max="59"
                  placeholder="sekunder"
                  value={runSeconds}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9]/g, '');
                    if (parseInt(val) > 59) val = '59';
                    setRunSeconds(val);
                  }}
                  className="w-24"
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end">
              {editingParticipant ? (
                <>
                  <Button onClick={handleEdit}>Lagre endringer</Button>
                  <Button variant="outline" onClick={handleCloseDialog}>Avbryt</Button>
                </>
              ) : (
                <>
                  <Button onClick={handleAdd}>Legg til deltaker</Button>
                  <Button variant="outline" onClick={handleCloseDialog}>Avbryt</Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DataTable columns={columns} data={participants} />
    </div>
  );
} 