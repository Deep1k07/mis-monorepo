"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";

export type BaDef = {
  _id: string;
  username: string;
  userId?: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  cab?: {
    _id: string;
    contact_name: string;
    registration_authority: string;
    registration_number: string;
    registration_date?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postal_code?: string;
    };
    currency?: string;
    gst?: string;
    certificateLanguage?: string;
    otherCertificateLanguage?: string;
    cab?: any[];
    website?: string;
  };
  createdAt?: string;
};

export const createBaColumns = (
  onEdit: (ba: BaDef) => void,
): ColumnDef<BaDef>[] => [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("username")}</span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span
        className="block max-w-[200px] truncate"
        title={row.getValue("email")}
      >
        {row.getValue("email")}
      </span>
    ),
  },
  {
    id: "contact_name",
    header: "Contact Name",
    cell: ({ row }) => (
      <span>{row.original.cab?.contact_name || "-"}</span>
    ),
  },
  {
    id: "registration_number",
    header: "Reg. Number",
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.cab?.registration_number || "-"}
      </span>
    ),
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
              : status === "pending"
                ? "bg-yellow-50 text-yellow-700 ring-yellow-600/20"
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
