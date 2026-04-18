"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export type FinalSurveillanceDef = {
  _id: string;
  entity_id?: string;
  entity_name?: string;
  isDirectClient?: boolean;
  business_associate?: { _id: string; username: string } | string;
  cab_code: string;
  standards?: { code: string; name: string }[];
  scope?: string;
  scopeStatus?: string;
  qualityStatus?: string;
  Surveillancestatus?: string;
  survApplied?: string;
  createdAt?: string;
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    completed: "bg-green-50 text-green-700 ring-green-600/20",
  };
  const style = styles[status] ?? "bg-gray-50 text-gray-700 ring-gray-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${style}`}
    >
      {status}
    </span>
  );
};

export const createFinalSurveillanceColumns = (
  onView: (row: FinalSurveillanceDef) => void,
): ColumnDef<FinalSurveillanceDef>[] => [
  {
    id: "entity_id",
    header: "Entity ID",
    cell: ({ row }) => <span>{row.original.entity_id ?? "-"}</span>,
  },
  {
    id: "entity_name",
    header: "Entity Name",
    cell: ({ row }) => {
      const name = row.original.entity_name ?? "-";
      return (
        <span className="block max-w-[220px] truncate" title={name}>
          {name}
        </span>
      );
    },
  },
  {
    accessorKey: "cab_code",
    header: "CAB Code",
  },
  {
    id: "business_associate",
    header: "BA Name",
    cell: ({ row }) => {
      if (row.original.isDirectClient)
        return <span className="text-muted-foreground">Direct Client</span>;
      const ba = row.original.business_associate;
      if (!ba) return <span className="text-muted-foreground">-</span>;
      return <span>{typeof ba === "object" ? ba.username : ba}</span>;
    },
  },
  {
    accessorKey: "standards",
    header: "Standards",
    cell: ({ row }) => {
      const standards = row.original.standards;
      if (!standards || standards.length === 0)
        return <span className="text-muted-foreground">-</span>;
      return <span>{standards.map((s) => s.code).join(", ")}</span>;
    },
  },
  {
    accessorKey: "qualityStatus",
    header: "Quality Status",
    cell: ({ row }) => statusBadge(row.original.qualityStatus ?? "pending"),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <div className="text-muted-foreground">
          {date?.split("T")[0] ?? "-"}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => (
      <button
        onClick={() => onView(row.original)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        title="View details"
      >
        <Eye className="h-4 w-4" />
      </button>
    ),
  },
];
