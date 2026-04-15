"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export type ApplicationDef = {
  _id: string;
  entity?: string;
  entity_id?: string;
  entity_name?: string;
  business_associate?: { _id: string; username: string } | string;
  cab_code: string;
  standards?: { code: string; name: string }[];
  scope: string;
  certificateStatus: string;
  qualityStatus: string;
  scopeStatus: string;
  baStatus: string;
  createdAt?: string;
  audit1?: string;
  audit2?: string;
  initial_issue?: string;
  current_issue?: string;
  certificate_number?: string;
  valid_until?: string;
  first_surveillance?: string;
  second_surveillance?: string;
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
    id: "entity_id",
    header: "Entity ID",
    cell: ({ row }) => {
      return <span>{row.original.entity_id ?? "-"}</span>;
    },
  },
  {
    id: "entity_name",
    header: "Entity Name",
    cell: ({ row }) => {
      const name = row.original.entity_name ?? "-";
      return (
        <span className="block max-w-[200px] truncate" title={name}>
          {name}
        </span>
      );
    },
  },
  {
    accessorKey: "certificate_number",
    header: "Certificate No.",
    cell: ({ row }) => {
      const value = row.getValue("certificate_number") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value}</span>;
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
      const ba = row.original.business_associate;
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
    accessorKey: "initial_issue",
    header: "Initial Issue",
    cell: ({ row }) => {
      const value = row.getValue("initial_issue") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value.split("T")[0] ?? value}</span>;
    },
  },
  {
    accessorKey: "current_issue",
    header: "Current Issue",
    cell: ({ row }) => {
      const value = row.getValue("current_issue") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value.split("T")[0] ?? value}</span>;
    },
  },
  {
    accessorKey: "valid_until",
    header: "Valid Until",
    cell: ({ row }) => {
      const value = row.getValue("valid_until") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value.split("T")[0] ?? value}</span>;
    },
  },
  {
    accessorKey: "audit1",
    header: "Audit 1",
    cell: ({ row }) => {
      const value = row.getValue("audit1") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value.split("T")[0] ?? value}</span>;
    },
  },
  {
    accessorKey: "audit2",
    header: "Audit 2",
    cell: ({ row }) => {
      const value = row.getValue("audit2") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value.split("T")[0] ?? value}</span>;
    },
  },
  {
    accessorKey: "first_surveillance",
    header: "1st Surveillance",
    cell: ({ row }) => {
      const value = row.getValue("first_surveillance") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value.split("T")[0] ?? value}</span>;
    },
  },
  {
    accessorKey: "second_surveillance",
    header: "2nd Surveillance",
    cell: ({ row }) => {
      const value = row.getValue("second_surveillance") as string | undefined;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{value.split("T")[0] ?? value}</span>;
    },
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => {
      const app = row.original;
      return (
        <button
          onClick={() => onView(app)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      );
    },
  },
];

export const defaultApplicationColumnVisibility: Record<string, boolean> = {
  entity_id: true,
  entity_name: true,
  cab_code: true,
  business_associate: true,
  standards: true,
  scopeStatus: true,
  qualityStatus: true,
  certificateStatus: true,
  createdAt: true,
  email: false,
  certificate_number: false,
  initial_issue: false,
  current_issue: false,
  valid_until: false,
  audit1: false,
  audit2: false,
  first_surveillance: false,
  second_surveillance: false,
};
