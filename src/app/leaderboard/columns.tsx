import { ColumnDef } from "@tanstack/react-table"
import { Participant } from "@/lib/data"
import { formatTime } from "@/lib/utils"

export function createColumns(): ColumnDef<Participant>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "gender",
      header: "Gender",
    },
    {
      accessorKey: "benchKg",
      header: "Bench Press (kg)",
      cell: ({ row }) => {
        const benchKg = row.getValue("benchKg") as number;
        return benchKg ? `${benchKg} kg` : "-";
      },
    },
    {
      accessorKey: "runTimeSeconds",
      header: "Run Time",
      cell: ({ row }) => {
        const runTimeSeconds = row.getValue("runTimeSeconds") as number;
        return runTimeSeconds ? formatTime(runTimeSeconds) : "-";
      },
    },
    {
      id: "score",
      header: "Score",
      cell: ({ row }) => {
        const benchKg = row.getValue("benchKg") as number;
        const runTimeSeconds = row.getValue("runTimeSeconds") as number;
        
        if (!benchKg || !runTimeSeconds) return "-";
        
        const score = runTimeSeconds - (benchKg * 3);
        return formatTime(score);
      },
    },
  ]
} 