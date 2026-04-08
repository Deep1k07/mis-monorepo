"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/auth-store";
import { useBAs } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createBaColumns } from "./ba-columns";
import { BaForm } from "./ba-form";

export function BaList() {
  const router = useRouter();
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const { data, totalPages, total, isLoading, mutate } = useBAs(page, search);

  const columns = useMemo(
    () =>
      createBaColumns((ba) => {
        router.push(`/manage-ba/view/${ba._id}`);
      }),
    [router],
  );

  const actionSlot = hasPermission("ba:create") ? (
    <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
      <Plus className="h-4 w-4" /> Create BA
    </Button>
  ) : null;

  return (
    <>
      {isLoading ? (
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
          onPageChange={(p) => set({ page: p })}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          actionSlot={actionSlot}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Business Associate</DialogTitle>
            <DialogDescription>
              Add a new business associate with account and registration
              details.
            </DialogDescription>
          </DialogHeader>
          <BaForm
            onSuccess={() => {
              setCreateOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
