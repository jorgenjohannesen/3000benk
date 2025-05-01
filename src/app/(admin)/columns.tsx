"use client"

import { type ColumnDef } from "@tanstack/react-table"
import { Participant } from "@/lib/data"
import { formatTime } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface ColumnsProps {
  setSelectedParticipant: (participant: Participant) => void
  setIsEditDialogOpen: (open: boolean) => void
  handleDelete: (id: string) => void
}

export const createColumns = ({ setSelectedParticipant, setIsEditDialogOpen, handleDelete }: ColumnsProps): ColumnDef<Participant>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "bibNumber",
    header: "Bib Number",
  },
  {
    accessorKey: "benchKg",
    header: "Bench Press (kg)",
    cell: ({ row }) => {
      const benchKg = row.getValue("benchKg")
      return benchKg ? `${benchKg} kg` : "-"
    },
  },
  {
    accessorKey: "runTimeSeconds",
    header: "Run Time",
    cell: ({ row }) => {
      const runTimeSeconds = row.getValue("runTimeSeconds")
      return runTimeSeconds ? formatTime(runTimeSeconds as number) : "-"
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const participant = row.original
      return (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedParticipant(participant)
              setIsEditDialogOpen(true)
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(participant.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    },
  },
] 