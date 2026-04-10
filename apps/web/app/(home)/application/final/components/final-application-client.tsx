"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createFinalColumns } from "./columns";
import { useFinalApplications } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";

export function FinalApplicationClient() {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    set({ page: newPage });
  };

  const columns = useMemo(
    () =>
      createFinalColumns((app) => {
        router.push(`/application/final/view/${app._id}`);
      }),
    [router],
  );

  const {
    data,
    totalPages,
    total,
    isLoading: loading,
  } = useFinalApplications(page, search);

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
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
        />
      )}
    </>
  );
}
