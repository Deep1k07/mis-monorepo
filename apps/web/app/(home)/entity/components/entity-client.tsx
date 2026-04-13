"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createColumns, defaultEntityColumnVisibility } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllBa, useEntities } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";

export function EntityClient() {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const baFilter = get("ba");
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    set({ page: newPage });
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

  const filterSlot = mounted ? (
    <Select
      value={baFilter || "all"}
      onValueChange={(value) => {
        set({ ba: value === "all" ? undefined : value, page: 1 });
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue>
          {baFilter
            ? bams?.find((b) => b._id === baFilter)?.username
            : "All Business Associates"}
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
      initialColumnVisibility={defaultEntityColumnVisibility}
    />
  );
}
