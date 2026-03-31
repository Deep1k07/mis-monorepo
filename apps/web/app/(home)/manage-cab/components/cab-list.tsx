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
import { createCabColumns, CabDef } from "./cab-columns";
import { CabForm } from "./cab-form";

export function CabList() {
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editCab, setEditCab] = useState<CabDef | null>(null);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const { data, totalPages, total, isLoading, mutate } = useCabs(page);

  const columns = useMemo(
    () =>
      createCabColumns((cab) => {
        setEditCab(cab);
      }),
    [],
  );

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div />
        {hasPermission("cab:create") && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" /> Create CAB
          </Button>
        )}
      </div>

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
        <DialogContent className="sm:max-w-2xl">
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
