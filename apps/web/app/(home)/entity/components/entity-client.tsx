"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createColumns } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllBa, useEntities } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";

export function EntityClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [baFilter, setBaFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const columns = useMemo(
    () =>
      createColumns((entity) => {
        router.push(`/entity/view/${entity.entity_id}`);
      }),
    [router],
  );

  const { bams } = useAllBa();
  const {
    data,
    totalPages,
    total,
    isLoading: loading,
  } = useEntities(page, baFilter, search);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const filterSlot = mounted ? (
    <Select
      value={baFilter}
      onValueChange={(value) => {
        setBaFilter(value === "all" ? "" : (value ?? ""));
        setPage(1);
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue placeholder="All Business Associates">
          {baFilter
            ? (bams?.find((b) => b._id === baFilter)?.username ??
              "All Business Associates")
            : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Business Associates</SelectItem>
        {bams?.map((ba) => (
          <SelectItem key={ba._id} value={ba._id}>
            {ba.username}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : null;

  return loading ? (
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
      filterSlot={filterSlot}
    />
  );
}
