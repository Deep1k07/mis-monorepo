"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createFinalColumns } from "./columns";
import { useFinalApplications } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QUALITY_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "rejected", label: "Rejected" },
];

export function FinalApplicationClient() {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const qualityStatus = get("qualityStatus");

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    set({ page: newPage });
  };

  const handleQualityStatusChange = (value: string | null) => {
    set({
      qualityStatus: !value || value === "all" ? undefined : value,
      page: 1,
    });
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
  } = useFinalApplications(page, search, qualityStatus || undefined);

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
              value={qualityStatus || "all"}
              onValueChange={handleQualityStatusChange}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue>
                  {qualityStatus
                    ? (QUALITY_STATUS_OPTIONS.find(
                        (o) => o.value === qualityStatus,
                      )?.label ?? qualityStatus)
                    : "Quality Status"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality Statuses</SelectItem>
                {QUALITY_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />
      )}
    </>
  );
}
