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
import { usePermissions } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createPermissionColumns, PermissionDef } from "./permission-columns";
import { PermissionForm } from "./permission-form";

export function PermissionList() {
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editPermission, setEditPermission] = useState<PermissionDef | null>(
    null,
  );
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const { data, totalPages, total, isLoading, mutate } = usePermissions(
    page,
    search,
  );

  const columns = useMemo(
    () =>
      createPermissionColumns((permission) => {
        setEditPermission(permission);
      }),
    [],
  );

  const actionSlot = hasPermission("permission:create") ? (
    <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
      <Plus className="h-4 w-4" /> Create Permission
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
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Permission</DialogTitle>
            <DialogDescription>
              Add a new permission to the system.
            </DialogDescription>
          </DialogHeader>
          <PermissionForm
            onSuccess={() => {
              setCreateOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editPermission}
        onOpenChange={(open) => !open && setEditPermission(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>Update permission details.</DialogDescription>
          </DialogHeader>
          {editPermission && (
            <PermissionForm
              mode="edit"
              permissionId={editPermission._id}
              defaultValues={{
                name: editPermission.name,
                description: editPermission.description,
                category: editPermission.category,
                status: editPermission.status,
                type: editPermission.type,
              }}
              onSuccess={() => {
                setEditPermission(null);
                mutate();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
