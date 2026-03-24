"use client";

import { ColumnDef } from "@tanstack/react-table";
import { EntityActions } from "./entity-actions";

import { Button } from "@/components/ui/button";

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
};

export const columns: ColumnDef<EntityDef>[] = [
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <div
          className={`capitalize ${status === "active" || status === "approved" ? "text-green-600" : "text-amber-600"}`}
        >
          {status}
        </div>
      );
    },
  },
  {
    accessorKey: "isDirectClient",
    header: "Type",
    cell: ({ row }) => {
      return <div>{row.getValue("isDirectClient") ? "Client" : "BAM"}</div>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      return <div>{row.getValue("createdAt")?.toString().split("T")[0]}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const entity = row.original;

      return <EntityActions entity={entity} />;
    },
  },
];
