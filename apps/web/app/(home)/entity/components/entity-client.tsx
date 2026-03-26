"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DataTable } from "@/components/data-table";
import { createColumns, EntityDef } from "./columns";
import { EntityViewModal } from "./entity-actions";

export function EntityClient() {
  const [selectedEntity, setSelectedEntity] = useState<EntityDef | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [data, setData] = useState<EntityDef[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const columns = useMemo(
    () =>
      createColumns((entity) => {
        setSelectedEntity(entity);
        setViewOpen(true);
      }),
    [],
  );

  const fetchEntities = useCallback(async (currentPage: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/entity/get-all?page=${currentPage}&limit=10`,
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
    fetchEntities(page);
  }, [page, fetchEntities]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

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
        />
      )}
      <EntityViewModal
        entity={selectedEntity}
        open={viewOpen}
        onOpenChange={setViewOpen}
      />
    </>
  );
}
