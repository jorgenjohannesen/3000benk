import { ColumnDef } from "@tanstack/react-table"
import { Participant } from "@/lib/data"
import { formatTime } from "@/lib/utils"
import { Medal } from "lucide-react"

export function createColumns(): ColumnDef<Participant & { score: number }>[] {
  return [
    {
      id: "placement",
      header: "Plass",
      cell: ({ row }) => {
        const index = row.index + 1;
        let color = '';
        if (index === 1) color = 'text-yellow-500';
        if (index === 2) color = 'text-gray-400';
        if (index === 3) color = 'text-amber-700';
        return (
          <span className={`font-bold text-lg ${color}`}>{index}</span>
        );
      },
    },
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
      accessorKey: "score",
      header: "Poeng",
      cell: ({ row }) => {
        const score = row.getValue("score") as number;
        return score ? score.toFixed(2) : "-";
      },
    },
  ];
} 