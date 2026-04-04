"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

export type StandardDef = {
  _id: string;
  mssCode: string;
  schemeName: string;
  standardCode: string;
  version: string;
  status: string;
  predecessor?: { _id: string; standardCode: string; version: string } | null;
  successor?: { _id: string; standardCode: string; version: string } | null;
  certificationBodies?: {
    _id: string;
    cabCode: string;
    cbCode: string;
    cbName: string;
  }[];
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
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate" title={row.getValue("schemeName")}>
        {row.getValue("schemeName")}
      </span>
    ),
  },
  {
    accessorKey: "standardCode",
    header: "Standard Code",
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate" title={row.getValue("standardCode")}>
        {row.getValue("standardCode")}
      </span>
    ),
  },
  {
    accessorKey: "version",
    header: "Version",
    cell: ({ row }) => (
      <span className="font-mono">{row.getValue("version") || "-"}</span>
    ),
  },
  {
    id: "predecessor",
    header: "Predecessor",
    cell: ({ row }) => {
      const p = row.original.predecessor;
      if (!p) return <span className="text-muted-foreground">-</span>;
      return <span className="text-xs">{p.standardCode}:{p.version}</span>;
    },
  },
  {
    id: "certificationBodies",
    header: "CABs",
    cell: ({ row }) => {
      const cbs = row.original.certificationBodies;
      if (!cbs || cbs.length === 0) return <span className="text-muted-foreground">-</span>;
      const label = cbs.map((cb) => cb.cabCode).join(", ");
      const full = cbs.map((cb) => `${cb.cabCode} - ${cb.cbName}`).join(", ");
      return (
        <span className="block max-w-[200px] truncate" title={full}>
          {label}
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
              : status === "expired"
                ? "bg-orange-50 text-orange-700 ring-orange-600/20"
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
