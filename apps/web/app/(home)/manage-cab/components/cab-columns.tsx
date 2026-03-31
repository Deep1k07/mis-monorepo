"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

export type CabDef = {
  _id: string;
  cabCode: string;
  cbCode: string;
  cbName: string;
  abCode: string;
  abName: string;
  status: string;
  description: string;
  standards?: any[];
  createdAt?: string;
};

export const createCabColumns = (
  onEdit: (cab: CabDef) => void,
): ColumnDef<CabDef>[] => [
  {
    accessorKey: "cabCode",
    header: "CAB Code",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {row.getValue("cabCode")}
      </span>
    ),
  },
  {
    accessorKey: "cbCode",
    header: "CB Code",
  },
  {
    accessorKey: "cbName",
    header: "CB Name",
  },
  {
    accessorKey: "abCode",
    header: "AB Code",
  },
  {
    accessorKey: "abName",
    header: "AB Name",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
            status === "active"
              ? "bg-green-50 text-green-700 ring-green-600/20"
              : "bg-red-50 text-red-700 ring-red-600/20"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "standards",
    header: "Standards",
    cell: ({ row }) => {
      const standards = row.getValue("standards") as any[] | undefined;
      return (
        <span className="text-muted-foreground">
          {standards?.length ?? 0}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | undefined;
      return (
        <span className="text-muted-foreground">
          {date?.split("T")[0] ?? "-"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const cab = row.original;
      return (
        <button
          onClick={() => onEdit(cab)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      );
    },
  },
];
