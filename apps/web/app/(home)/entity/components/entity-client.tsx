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

export function EntityClient() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [baFilter, setBaFilter] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
  } = useEntities(page, baFilter);

  console.log("hjasfvhjsdbf", data);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        {mounted && (
          <Select
            value={baFilter}
            onValueChange={(value) => {
              setBaFilter(value === "all" ? "" : (value ?? ""));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by Business Associate">
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
        )}
      </div>
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
