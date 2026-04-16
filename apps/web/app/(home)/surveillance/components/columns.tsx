"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

export type SurveillanceDef = {
  _id: string;
  entity_id?: string;
  entity_name?: string;
  business_associate?: { _id: string; username: string } | string;
  cab_code: string;
  standards?: { code: string; name: string }[];
  Surveillancestatus?: string;
  due_date?: string;
  remainingDays?: number | null;
  first_surveillance?: string;
  second_surveillance?: string;
};

const statusBadge = (status: string) => {
  const styles: Record<string, string> = {
    upcoming: "bg-blue-50 text-blue-700 ring-blue-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    inprogress: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    completed: "bg-green-50 text-green-700 ring-green-600/20",
    suspended: "bg-red-50 text-red-700 ring-red-600/20",
    withdrawn: "bg-red-50 text-red-700 ring-red-600/20",
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

const remainingBadge = (days: number | null | undefined) => {
  if (days === null || days === undefined)
    return <span className="text-muted-foreground">-</span>;
  const label =
    days < 0
      ? `${Math.abs(days)} days overdue`
      : days === 0
        ? "Due today"
        : `${days} days`;
  const style =
    days < 0
      ? "bg-red-50 text-red-700 ring-red-600/20"
      : days <= 30
        ? "bg-amber-50 text-amber-700 ring-amber-600/20"
        : "bg-green-50 text-green-700 ring-green-600/20";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}
    >
      {label}
    </span>
  );
};

export const createSurveillanceColumns = (
  onView: (row: SurveillanceDef) => void,
): ColumnDef<SurveillanceDef>[] => [
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
    id: "business_associate",
    header: "BA Name",
    cell: ({ row }) => {
      const ba = row.original.business_associate;
      if (!ba) return <span className="text-muted-foreground">-</span>;
      return <span>{typeof ba === "object" ? ba.username : ba}</span>;
    },
  },
  {
    accessorKey: "cab_code",
    header: "CAB Code",
  },
  {
    accessorKey: "standards",
    header: "Standard Code",
    cell: ({ row }) => {
      const standards = row.original.standards;
      if (!standards || standards.length === 0)
        return <span className="text-muted-foreground">-</span>;
      return <span>{standards.map((s) => s.code).join(", ")}</span>;
    },
  },
  {
    id: "remainingDays",
    header: "Remaining Days",
    cell: ({ row }) => remainingBadge(row.original.remainingDays),
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const value = row.original.due_date;
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span>{String(value).split("T")[0]}</span>;
    },
  },
  {
    accessorKey: "Surveillancestatus",
    header: "Status",
    cell: ({ row }) =>
      statusBadge(row.original.Surveillancestatus ?? "upcoming"),
  },
  {
    id: "actions",
    header: "",
    enableHiding: false,
    cell: ({ row }) => {
      const item = row.original;
      return (
        <button
          onClick={() => onView(item)}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          title="View details"
        >
          <Eye className="h-4 w-4" />
        </button>
      );
    },
  },
];
