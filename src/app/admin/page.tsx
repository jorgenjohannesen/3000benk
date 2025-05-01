'use client';

import { useState, useEffect } from 'react';
import { Participant } from '@/lib/data';
import { handleAddParticipant, handleUpdateParticipant, handleDeleteParticipant, getParticipantsWithSort } from '@/lib/actions';
import { formatTime } from '@/lib/utils';
import { DataTable } from "@/components/ui/data-table"
import { createColumns } from "./columns"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function AdminPage() {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Participant>('name');
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

  const handleAdd = async (formData: FormData) => {
    const minutes = formData.get("runMinutes") ? Number(formData.get("runMinutes")) : 0;
    const seconds = formData.get("runSeconds") ? Number(formData.get("runSeconds")) : 0;
    const runTimeSeconds = minutes * 60 + seconds;
    
    const newFormData = new FormData();
    newFormData.append("name", formData.get("name") as string);
    newFormData.append("gender", formData.get("gender") as string);
    newFormData.append("bibNumber", formData.get("bibNumber") as string);
    newFormData.append("benchKg", formData.get("benchKg") as string);
    newFormData.append("runTimeSeconds", runTimeSeconds.toString());

    const result = await handleAddParticipant(newFormData);
    if (result.success) {
      setIsAddDialogOpen(false);
      const data = await getParticipantsWithSort();
      setParticipants(data);
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!selectedParticipant) return;
    
    const minutes = formData.get("runMinutes") ? Number(formData.get("runMinutes")) : 0;
    const seconds = formData.get("runSeconds") ? Number(formData.get("runSeconds")) : 0;
    const runTimeSeconds = minutes * 60 + seconds;
    
    const newFormData = new FormData();
    newFormData.append("name", formData.get("name") as string);
    newFormData.append("gender", formData.get("gender") as string);
    newFormData.append("bibNumber", formData.get("bibNumber") as string);
    newFormData.append("benchKg", formData.get("benchKg") as string);
    newFormData.append("runTimeSeconds", runTimeSeconds.toString());

    const result = await handleUpdateParticipant(selectedParticipant.id, newFormData);
    if (result.success) {
      setIsEditDialogOpen(false);
      const data = await getParticipantsWithSort();
      setParticipants(data);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await handleDeleteParticipant(id);
    if (result.success) {
      const data = await getParticipantsWithSort();
      setParticipants(data);
    }
  };

  const handleSort = (field: keyof Participant) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedParticipants = participants
    .filter(participant => genderFilter === 'all' || participant.gender === genderFilter)
    .sort((a, b) => {
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

  const columns = createColumns({
    setSelectedParticipant,
    setIsEditDialogOpen,
    handleDelete,
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Participants</h1>
        <div className="flex gap-4">
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>Add Participant</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Participant</DialogTitle>
              </DialogHeader>
              <form action={handleAdd} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select name="gender" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bibNumber">Bib Number</Label>
                  <Input id="bibNumber" name="bibNumber" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benchKg">Bench Press (kg)</Label>
                  <Input id="benchKg" name="benchKg" type="number" />
                </div>
                <div className="space-y-2">
                  <Label>Run Time</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Label htmlFor="runMinutes" className="text-sm">Minutes</Label>
                      <Input id="runMinutes" name="runMinutes" type="number" min="0" />
                    </div>
                    <div className="flex-1">
                      <Label htmlFor="runSeconds" className="text-sm">Seconds</Label>
                      <Input id="runSeconds" name="runSeconds" type="number" min="0" max="59" />
                    </div>
                  </div>
                </div>
                <Button type="submit">Add Participant</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
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
        </div>
      </div>

      <DataTable columns={columns} data={filteredAndSortedParticipants} />

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Participant</DialogTitle>
          </DialogHeader>
          {selectedParticipant && (
            <form action={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input id="edit-name" name="name" defaultValue={selectedParticipant.name} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Gender</Label>
                <Select name="gender" defaultValue={selectedParticipant.gender} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-bibNumber">Bib Number</Label>
                <Input id="edit-bibNumber" name="bibNumber" defaultValue={selectedParticipant.bibNumber} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-benchKg">Bench Press (kg)</Label>
                <Input id="edit-benchKg" name="benchKg" type="number" defaultValue={selectedParticipant.benchKg || ''} />
              </div>
              <div className="space-y-2">
                <Label>Run Time</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="edit-runMinutes" className="text-sm">Minutes</Label>
                    <Input 
                      id="edit-runMinutes" 
                      name="runMinutes" 
                      type="number" 
                      min="0" 
                      defaultValue={selectedParticipant.runTimeSeconds ? Math.floor(selectedParticipant.runTimeSeconds / 60) : ''} 
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="edit-runSeconds" className="text-sm">Seconds</Label>
                    <Input 
                      id="edit-runSeconds" 
                      name="runSeconds" 
                      type="number" 
                      min="0" 
                      max="59" 
                      defaultValue={selectedParticipant.runTimeSeconds ? selectedParticipant.runTimeSeconds % 60 : ''} 
                    />
                  </div>
                </div>
              </div>
              <Button type="submit">Update Participant</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 