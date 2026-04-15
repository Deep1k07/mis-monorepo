"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createColumns, defaultApplicationColumnVisibility } from "./columns";
import {
  useApplications,
  useAllCabsList,
  useAllBa,
  useCountries,
} from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/searchable-select";

export function ApplicationClient() {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const cabCode = get("cabCode");
  const baFilter = get("ba");
  const countryFilter = get("country");

  const { cabs } = useAllCabsList();
  const { bams } = useAllBa();
  const { countries } = useCountries();

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    set({ page: newPage });
  };

  const handleCabCodeChange = (value: string | null) => {
    set({ cabCode: value === "all" ? "" : (value ?? ""), page: 1 });
  };

  const handleBaChange = (value: string | null) => {
    set({ ba: !value || value === "all" ? undefined : value, page: 1 });
  };

  const handleCountryChange = (value: string | null) => {
    set({ country: !value || value === "all" ? undefined : value, page: 1 });
  };

  const columns = useMemo(
    () =>
      createColumns((app) => {
        router.push(`/application/view/${app._id}`);
      }),
    [router],
  );

  const {
    data,
    totalPages,
    total,
    isLoading: loading,
  } = useApplications(
    page,
    search,
    cabCode || undefined,
    baFilter || undefined,
    countryFilter || undefined,
  );

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
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={cabCode || null}
                onValueChange={handleCabCodeChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="CAB Code" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {cabs.map((cab: any) => (
                    <SelectItem key={cab._id} value={cab.cabCode}>
                      {cab.cabCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <SearchableSelect
                value={baFilter}
                onChange={handleBaChange}
                options={
                  bams?.map((b) => ({ value: b._id, label: b.username })) ?? []
                }
                placeholder="Business Associate"
                searchPlaceholder="Search BA..."
                allLabel="All Business Associates"
                triggerClassName="w-[240px]"
              />
              <SearchableSelect
                value={countryFilter}
                onChange={handleCountryChange}
                options={
                  countries?.map((c) => ({ value: c.code, label: c.name })) ??
                  []
                }
                placeholder="Country"
                searchPlaceholder="Search country..."
                allLabel="All Countries"
                triggerClassName="w-[200px]"
              />
            </div>
          }
          initialColumnVisibility={defaultApplicationColumnVisibility}
          storageKey="application-list-columns"
        />
      )}
    </>
  );
}
