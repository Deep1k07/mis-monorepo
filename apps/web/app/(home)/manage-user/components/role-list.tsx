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
import { useRoles } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createRoleColumns, RoleDef } from "./role-columns";
import { RoleForm } from "./role-form";

export function RoleList() {
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleDef | null>(null);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const { data, totalPages, total, isLoading, mutate } = useRoles(page, search);

  const columns = useMemo(
    () =>
      createRoleColumns((role) => {
        setEditRole(role);
      }),
    [],
  );

  const actionSlot = hasPermission("role:create") ? (
    <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
      <Plus className="h-4 w-4" /> Create Role
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
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
            <DialogDescription>
              Add a new role and assign permissions.
            </DialogDescription>
          </DialogHeader>
          <RoleForm
            onSuccess={() => {
              setCreateOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editRole}
        onOpenChange={(open) => !open && setEditRole(null)}
      >
        <DialogContent className="sm:max-w-5xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update role details and permissions.
            </DialogDescription>
          </DialogHeader>
          {editRole && (
            <RoleForm
              mode="edit"
              roleId={editRole._id}
              defaultValues={{
                role: editRole.role,
                description: editRole.description,
                permissions:
                  editRole.permissions?.map((p: any) =>
                    typeof p === "object" ? p._id : p,
                  ) || [],
                status: editRole.status,
                reportingRole:
                  typeof editRole.reportingRole === "object"
                    ? editRole.reportingRole?._id
                    : editRole.reportingRole || "",
                cabCode: editRole.cabCode || [],
                region: editRole.region || [],
                type: editRole.type,
              }}
              onSuccess={() => {
                setEditRole(null);
                mutate();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
