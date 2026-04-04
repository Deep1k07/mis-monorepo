"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

export type PermissionDef = {
  _id: string;
  name: string;
  description: string;
  category: string;
  status: string;
  type: string;
  createdAt?: string;
};

export const createPermissionColumns = (
  onEdit: (permission: PermissionDef) => void,
): ColumnDef<PermissionDef>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.getValue("name")}
      </span>
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
        {row.getValue("description")}
      </span>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
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
