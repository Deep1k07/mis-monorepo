"use client";

import { DataTable } from "@/components/data-table";
import { columns, EntityDef } from "./columns";

interface EntityClientProps {
  data: EntityDef[];
}

export function EntityClient({ data }: EntityClientProps) {
  return <DataTable columns={columns} data={data} />;
}
