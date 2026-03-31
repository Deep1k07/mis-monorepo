"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

export type StandardDef = {
  _id: string;
  mssCode: string;
  schemeName: string;
  standardCode: string;
  status: string;
  certificationBody?: {
    _id: string;
    cabCode: string;
    cbCode: string;
    cbName: string;
  };
  createdAt?: string;
};

export const createStandardColumns = (
  onEdit: (standard: StandardDef) => void,
): ColumnDef<StandardDef>[] => [
  {
    accessorKey: "mssCode",
    header: "MSS Code",
    cell: ({ row }) => (
      <span className="font-mono font-medium">
        {row.getValue("mssCode")}
      </span>
    ),
  },
  {
    accessorKey: "schemeName",
    header: "Scheme Name",
  },
  {
    accessorKey: "standardCode",
    header: "Standard Code",
  },
  {
    accessorKey: "certificationBody",
    header: "CAB",
    cell: ({ row }) => {
      const cb = row.getValue("certificationBody") as any;
      if (!cb) return <span className="text-muted-foreground">-</span>;
      return (
        <span>
          {cb.cabCode} - {cb.cbName}
        </span>
      );
    },
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
      const standard = row.original;
      return (
        <button
          onClick={() => onEdit(standard)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </button>
      );
    },
  },
];
