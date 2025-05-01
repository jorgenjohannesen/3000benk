import { ColumnDef } from "@tanstack/react-table"
import { Participant } from "@/lib/data"
import { formatTime } from "@/lib/utils"

export function createColumns(): ColumnDef<Participant & { score: number }>[] {
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
      accessorKey: "score",
      header: "Poeng",
      cell: ({ row }) => {
        const score = row.getValue("score") as number;
        return score ? score.toFixed(2) : "-";
      },
    },
  ]
} 