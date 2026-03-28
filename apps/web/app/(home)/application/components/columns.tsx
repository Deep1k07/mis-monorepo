"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export type ApplicationDef = {
  _id: string;
  entity_id: string;
  entity_name: string;
  cab_code: string;
  busuness_associate?: { _id: string; username: string } | string;
  standards?: { code: string; name: string }[];
  scope: string;
  certificateStatus: string;
  qualityStatus: string;
  baStatus: string;
  createdAt?: string;
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    proceed: "bg-blue-50 text-blue-700 ring-blue-600/20",
    completed: "bg-green-50 text-green-700 ring-green-600/20",
    active: "bg-green-50 text-green-700 ring-green-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    applied: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    hold: "bg-gray-50 text-gray-700 ring-gray-600/20",
    withdrawn: "bg-red-50 text-red-700 ring-red-600/20",
    final: "bg-green-50 text-green-700 ring-green-600/20",
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

export const createColumns = (
  onView: (app: ApplicationDef) => void,
): ColumnDef<ApplicationDef>[] => [
  {
    accessorKey: "entity_id",
    header: "Entity ID",
  },
  {
    accessorKey: "entity_name",
    header: "Entity Name",
  },
  {
    accessorKey: "cab_code",
    header: "CAB Code",
  },
  {
    accessorKey: "busuness_associate",
    header: "BA Name",
    cell: ({ row }) => {
      const ba = row.getValue("busuness_associate") as
        | { _id: string; username: string }
        | string
        | undefined;
      if (!ba) return <span className="text-muted-foreground">-</span>;
      return <span>{typeof ba === "object" ? ba.username : ba}</span>;
    },
  },
  {
    accessorKey: "standards",
    header: "Standards",
    cell: ({ row }) => {
      const standards = row.getValue("standards") as
        | { code: string; name: string }[]
        | undefined;
      if (!standards || standards.length === 0)
        return <span className="text-muted-foreground">-</span>;
      return <span>{standards.map((s) => s.code).join(", ")}</span>;
    },
  },
  {
    accessorKey: "scopeStatus",
    header: "Scope Status",
    cell: ({ row }) => statusBadge(row.getValue("scopeStatus") as string),
  },
  {
    accessorKey: "qualityStatus",
    header: "Quality Status",
    cell: ({ row }) => statusBadge(row.getValue("qualityStatus") as string),
  },
  {
    accessorKey: "certificateStatus",
    header: "Application Status",
    cell: ({ row }) => statusBadge(row.getValue("certificateStatus") as string),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as string | undefined;
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
    cell: ({ row }) => {
      const app = row.original;
      return (
        <button
          onClick={() => onView(app)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      );
    },
  },
];
