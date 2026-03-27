"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/data-table";
import { createColumns, EntityDef } from "./columns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function EntityClient() {
  const router = useRouter();
  const [data, setData] = useState<EntityDef[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [baFilter, setBaFilter] = useState("");
  const [bams, setBams] = useState<{ _id: string; username: string }[]>([]);
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

  useEffect(() => {
    async function fetchBAMs() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/ba/get-all`,
          { credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          setBams(data);
        }
      } catch (error) {
        console.error("Failed to fetch business associates", error);
      }
    }
    fetchBAMs();
  }, []);

  const fetchEntities = useCallback(async (currentPage: number, ba: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: "10",
      });
      if (ba) params.set("busuness_associate", ba);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/entity/get-all?${params}`,
        { credentials: "include" },
      );

      if (!res.ok) {
        setData([]);
        return;
      }

      const json = await res.json();
      setData(json.data ?? []);
      setTotalPages(json.totalPages ?? 1);
      setTotal(json.total ?? 0);
      setPage(json.page ?? currentPage);
    } catch (error) {
      console.error("Error fetching entities:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntities(page, baFilter);
  }, [page, baFilter, fetchEntities]);

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
              setBaFilter(value === "all" ? "" : value ?? "");
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by Business Associate">
                {baFilter
                  ? bams.find((b) => b._id === baFilter)?.username ?? "All Business Associates"
                  : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Business Associates</SelectItem>
              {bams.map((ba) => (
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
