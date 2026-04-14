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
              <Select
                value={baFilter || "all"}
                onValueChange={handleBaChange}
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
              <Select
                value={countryFilter || "all"}
                onValueChange={handleCountryChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Country">
                    {countryFilter
                      ? (countries?.find((c) => c.code === countryFilter)
                          ?.name ?? countryFilter)
                      : "All Countries"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {countries?.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
          initialColumnVisibility={defaultApplicationColumnVisibility}
          storageKey="application-list-columns"
        />
      )}
    </>
  );
}
