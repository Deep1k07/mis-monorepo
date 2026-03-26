"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export type EntityDef = {
  _id: string;
  entity_id: string;
  entity_name: string;
  entity_name_english?: string;
  entity_trading_name?: string;
  email: string;
  website?: string;
  drive_link?: string;
  direct_price?: string;
  busuness_associate?: string;
  status: string;
  isDirectClient?: boolean;
  main_site_address?: {
    street: string;
    city?: string;
    state?: string;
    country: string;
    postal_code?: string;
  }[];
  additional_site_address?: {
    street: string;
    city?: string;
    state?: string;
    country: string;
    postal_code?: string;
  }[];
  createdAt?: string;
};

export const createColumns = (
  onView: (entity: EntityDef) => void,
): ColumnDef<EntityDef>[] => [
    {
      accessorKey: "entity_id",
      header: "Entity ID",
    },
    {
      accessorKey: "entity_name",
      header: "Name",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "isEntityEmailVerifiedStatus",
      header: "Email Status",
      cell: ({ row }) => {
        const status = row.getValue("isEntityEmailVerifiedStatus") as string;
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${status === "verified"
                ? "bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20"
                : status === "pending"
                  ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20"
                  : status === "by-pass"
                    ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                    : "bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20"
              }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: "isDirectClient",
      header: "Type",
      cell: ({ row }) => {
        const isDirect = row.getValue("isDirectClient");
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${isDirect
                ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20"
                : "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20"
              }`}
          >
            {isDirect ? "Client" : "BAM"}
          </span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | undefined;
        return <div className="text-muted-foreground">{date?.split("T")[0] ?? "-"}</div>;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const entity = row.original;
        return (
          <button
            onClick={() => onView(entity)}
            className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="View details"
          >
            <Eye className="h-4 w-4" />
          </button>
        );
      },
    },
  ];
