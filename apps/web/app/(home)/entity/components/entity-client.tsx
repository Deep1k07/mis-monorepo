"use client";

import { useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createColumns, defaultEntityColumnVisibility } from "./columns";
import { SearchableSelect } from "@/components/searchable-select";
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
    <SearchableSelect
      value={baFilter}
      onChange={(value) => {
        set({ ba: value ?? undefined, page: 1 });
      }}
      options={bams?.map((b) => ({ value: b._id, label: b.username })) ?? []}
      placeholder="Business Associate"
      searchPlaceholder="Search BA..."
      allLabel="All Business Associates"
      triggerClassName="w-[240px]"
    />
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
      storageKey="entity-list-columns"
    />
  );
}
