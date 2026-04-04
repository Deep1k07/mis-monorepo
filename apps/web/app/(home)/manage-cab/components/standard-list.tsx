"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { useStandards, useAllCabsList } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createStandardColumns, StandardDef } from "./standard-columns";
import { StandardForm } from "./standard-form";

export function StandardList() {
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const cabFilter = get("cab");
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editStandard, setEditStandard] = useState<StandardDef | null>(null);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const { cabs } = useAllCabsList();
  const { data, totalPages, total, isLoading, mutate } = useStandards(
    page,
    cabFilter,
    search,
  );

  const columns = useMemo(
    () =>
      createStandardColumns((standard) => {
        setEditStandard(standard);
      }),
    [],
  );

  const filterSlot = (
    <Select
      value={cabFilter || "all"}
      onValueChange={(value) => {
        set({ cab: value === "all" ? undefined : value, page: 1 });
      }}
    >
      <SelectTrigger className="w-[220px]">
        <SelectValue>
          {cabFilter
            ? cabs?.find((c: any) => c._id === cabFilter)?.cbName
            : "All CABs"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All CABs</SelectItem>
        {cabs?.map((cab: any) => (
          <SelectItem key={cab._id} value={cab._id}>
            {cab.cabCode} - {cab.cbName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const actionSlot = hasPermission("standard:create") ? (
    <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
      <Plus className="h-4 w-4" /> Create Standard
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
          filterSlot={filterSlot}
          actionSlot={actionSlot}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Standard</DialogTitle>
            <DialogDescription>
              Add a new certification standard.
            </DialogDescription>
          </DialogHeader>
          <StandardForm
            onSuccess={() => {
              setCreateOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editStandard}
        onOpenChange={(open) => !open && setEditStandard(null)}
      >
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Standard</DialogTitle>
            <DialogDescription>Update standard details.</DialogDescription>
          </DialogHeader>
          {editStandard && (
            <StandardForm
              mode="edit"
              standardId={editStandard._id}
              defaultValues={{
                mssCode: editStandard.mssCode,
                schemeName: editStandard.schemeName,
                standardCode: editStandard.standardCode,
                version: editStandard.version || "",
                certificationBodies:
                  editStandard.certificationBodies?.map((cb) => cb._id) || [],
                predecessor: editStandard.predecessor?._id || "",
                status: editStandard.status,
              }}
              onSuccess={() => {
                setEditStandard(null);
                mutate();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
