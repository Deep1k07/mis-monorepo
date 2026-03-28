"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createColumns } from "./columns";
import { useApplications } from "@/utils/apis";

export function ApplicationClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const columns = useMemo(
    () =>
      createColumns((app) => {
        router.push(`/application/view/${app._id}`);
      }),
    [router],
  );

  const { data, totalPages, total, isLoading: loading } = useApplications(page);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          Loading...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={data}
          pageCount={totalPages}
          page={page}
          total={total}
          onPageChange={handlePageChange}
        />
      )}
    </>
  );
}
