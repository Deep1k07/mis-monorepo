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
import { useUsers } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createUserColumns, UserDef } from "./user-columns";
import { UserForm } from "./user-form";

export function UserList() {
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDef | null>(null);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const { data, totalPages, total, isLoading, mutate } = useUsers(
    page,
    search,
  );

  const columns = useMemo(
    () =>
      createUserColumns((user) => {
        setEditUser(user);
      }),
    [],
  );

  const actionSlot = hasPermission("user:create") ? (
    <Button onClick={() => setCreateOpen(true)} className="cursor-pointer">
      <Plus className="h-4 w-4" /> Create User
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
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <UserForm
            onSuccess={() => {
              setCreateOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editUser}
        onOpenChange={(open) => !open && setEditUser(null)}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details.</DialogDescription>
          </DialogHeader>
          {editUser && (
            <UserForm
              mode="edit"
              userId={editUser._id}
              defaultValues={{
                firstName: editUser.firstName,
                lastName: editUser.lastName || "",
                email: editUser.email,
                phone: editUser.phone,
                password: "",
                role:
                  typeof editUser.role === "object"
                    ? editUser.role?._id
                    : editUser.role || "",
                status: editUser.status,
              }}
              onSuccess={() => {
                setEditUser(null);
                mutate();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
