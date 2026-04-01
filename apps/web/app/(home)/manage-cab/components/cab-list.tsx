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
import { useAuthStore } from "@/store/auth-store";
import { useCabs } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { createCabColumns, CabDef } from "./cab-columns";
import { CabForm } from "./cab-form";

export function CabList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCab, setEditCab] = useState<CabDef | null>(null);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  const { data, totalPages, total, isLoading, mutate } = useCabs(page, search);

  const columns = useMemo(
    () =>
      createCabColumns((cab) => {
        setEditCab(cab);
      }),
    [],
  );

  const actionSlot = hasPermission("cab:create") ? (
    <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
      <Plus className="h-4 w-4" /> Create CAB
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
          onPageChange={setPage}
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
          actionSlot={actionSlot}
        />
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Certification Body</DialogTitle>
            <DialogDescription>
              Add a new certification body (CAB).
            </DialogDescription>
          </DialogHeader>
          <CabForm
            onSuccess={() => {
              setCreateOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editCab} onOpenChange={(open) => !open && setEditCab(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Certification Body</DialogTitle>
            <DialogDescription>
              Update certification body details.
            </DialogDescription>
          </DialogHeader>
          {editCab && (
            <CabForm
              mode="edit"
              cabId={editCab._id}
              defaultValues={{
                cabCode: editCab.cabCode,
                cbCode: editCab.cbCode,
                cbName: editCab.cbName,
                abCode: editCab.abCode,
                abName: editCab.abName,
                description: editCab.description,
                status: editCab.status,
                standards: editCab.standards?.map((s: any) =>
                  typeof s === "object" ? s._id : s,
                ) || [],
              }}
              onSuccess={() => {
                setEditCab(null);
                mutate();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
