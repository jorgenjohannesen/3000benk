"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Participant } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { formatTime } from "@/lib/utils"

export function createColumns(
  handleDelete: (id: string) => void,
  handleEdit: (participant: Participant) => void
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
        const genderMap: { [key: string]: string } = {
          male: "Mann",
          female: "Kvinne",
          other: "Annet"
        };
        return genderMap[gender] || gender;
      }
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
      id: "actions",
      cell: ({ row }) => {
        const participant = row.original;
        return (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(participant)}>
              Rediger
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(participant.id)}>
              Slett
            </Button>
          </div>
        );
      },
    },
  ];
} 