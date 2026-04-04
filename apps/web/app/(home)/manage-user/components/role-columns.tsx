"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

export type RoleDef = {
  _id: string;
  role: string;
  description: string;
  permissions: any[];
  status: string;
  type: string;
  reportingRole?: any;
  cabCode?: string[];
  region?: string[];
  createdAt?: string;
};

export const createRoleColumns = (
  onEdit: (role: RoleDef) => void,
): ColumnDef<RoleDef>[] => [
  {
    accessorKey: "role",
    header: "Role Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("role")}</span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => (
      <span
        className="block max-w-[250px] truncate"
        title={row.getValue("description")}
      >
        {row.getValue("description") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const permissions = row.getValue("permissions") as any[];
      return (
        <span className="text-muted-foreground">
          {permissions?.length ?? 0}
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
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="capitalize text-muted-foreground">
        {row.getValue("type")}
      </span>
    ),
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
    cell: ({ row }) => (
      <button
        onClick={() => onEdit(row.original)}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
    ),
  },
];
