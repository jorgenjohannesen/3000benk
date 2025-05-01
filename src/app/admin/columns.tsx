"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Participant } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"

export function createColumns(
  handleDelete: (id: string) => Promise<void>,
  setEditingParticipant: (participant: Participant | null) => void
): ColumnDef<Participant>[] {
  return [
    {
      accessorKey: "name",
      header: "Navn",
    },
    {
      accessorKey: "gender",
      header: "Kjønn",
      cell: ({ row }) => {
        const gender = row.getValue("gender") as string;
        return gender === "male" ? "Mann" : gender === "female" ? "Kvinne" : "Annet";
      },
    },
    {
      accessorKey: "benchKg",
      header: "Benkpress (kg)",
      cell: ({ row }) => {
        const benchKg = row.getValue("benchKg") as number;
        return benchKg ? `${benchKg} kg` : "-";
      },
    },
    {
      accessorKey: "runTimeSeconds",
      header: "Løpetid",
      cell: ({ row }) => {
        const runTimeSeconds = row.getValue("runTimeSeconds") as number;
        return runTimeSeconds ? formatTime(runTimeSeconds) : "-";
      },
    },
    {
      accessorKey: "bibNumber",
      header: "Startnummer",
      cell: ({ row }) => {
        const bibNumber = row.getValue("bibNumber") as number;
        return bibNumber || "-";
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const participant = row.original;
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingParticipant(participant)}
            >
              Rediger
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(participant.id)}
            >
              Slett
            </Button>
          </div>
        );
      },
    },
  ];
} 