'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
  const { data: session, status } = useSession();
  const router = useRouter();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

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

    if (status === 'authenticated') {
      loadParticipants();
    }
  }, [status]);

  const handleAdd = async (formData: FormData) => {
    const result = await handleAddParticipant(formData);
    if (result.success) {
      setIsAddDialogOpen(false);
      const data = await getParticipantsWithSort();
      setParticipants(data);
    }
  };

  const handleEdit = async (formData: FormData) => {
    if (!selectedParticipant) return;
    const result = await handleUpdateParticipant(selectedParticipant.id, formData);
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

  const columns = createColumns({
    setSelectedParticipant,
    setIsEditDialogOpen,
    handleDelete,
  });

  if (status === 'loading' || loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Participants</h1>
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
                <Label htmlFor="runTimeSeconds">Run Time (seconds)</Label>
                <Input id="runTimeSeconds" name="runTimeSeconds" type="number" />
              </div>
              <Button type="submit">Add Participant</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <DataTable columns={columns} data={participants} />

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
                <Label htmlFor="edit-runTimeSeconds">Run Time (seconds)</Label>
                <Input id="edit-runTimeSeconds" name="runTimeSeconds" type="number" defaultValue={selectedParticipant.runTimeSeconds || ''} />
              </div>
              <Button type="submit">Update Participant</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 