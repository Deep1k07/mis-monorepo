"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createDraftColumns } from "./columns";
import { useDraftApplications } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DraftApplicationClient() {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const scopeStatus = get("scopeStatus");

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    set({ page: newPage });
  };

  const handleScopeStatusChange = (value: string | null) => {
    set({ scopeStatus: value === "all" ? "" : (value ?? ""), page: 1 });
  };

  const columns = useMemo(
    () =>
      createDraftColumns((app) => {
        router.push(`/application/draft/view/${app._id}`);
      }),
    [router],
  );

  const {
    data,
    totalPages,
    total,
    isLoading: loading,
  } = useDraftApplications(page, search, scopeStatus || undefined);

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
          filterSlot={
            <Select
              value={scopeStatus || null}
              onValueChange={handleScopeStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Scope Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      )}
    </>
  );
}
