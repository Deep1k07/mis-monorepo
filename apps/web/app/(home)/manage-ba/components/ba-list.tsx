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
import { useBAs } from "@/utils/apis";
import { useDebounce } from "@/utils/useDebounce";
import { useQueryParams } from "@/utils/useQueryParams";
import { createBaColumns, BaDef } from "./ba-columns";
import { BaForm } from "./ba-form";

export function BaList() {
  const { get, getNumber, set } = useQueryParams();

  const page = getNumber("page", 1);
  const searchInput = get("search");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBa, setEditBa] = useState<BaDef | null>(null);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    set({ search: value, page: 1 });
  };

  const { data, totalPages, total, isLoading, mutate } = useBAs(page, search);

  const columns = useMemo(
    () =>
      createBaColumns((ba) => {
        setEditBa(ba);
      }),
    [],
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
              Add a new business associate with account and registration details.
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

      {/* Edit Dialog */}
      <Dialog
        open={!!editBa}
        onOpenChange={(open) => !open && setEditBa(null)}
      >
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Associate</DialogTitle>
            <DialogDescription>
              Update business associate details.
            </DialogDescription>
          </DialogHeader>
          {editBa && (
            <BaForm
              mode="edit"
              baId={editBa._id}
              defaultValues={{
                username: editBa.username,
                email: editBa.email,
                password: "",
                phone: editBa.phone || "",
                contact_name: editBa.cab?.contact_name || "",
                registration_authority: editBa.cab?.registration_authority || "",
                registration_number: editBa.cab?.registration_number || "",
                registration_date: editBa.cab?.registration_date || "",
                address: {
                  street: editBa.cab?.address?.street || "",
                  city: editBa.cab?.address?.city || "",
                  state: editBa.cab?.address?.state || "",
                  country: editBa.cab?.address?.country || "",
                  postal_code: editBa.cab?.address?.postal_code || "",
                },
                currency: editBa.cab?.currency || "",
                gst: editBa.cab?.gst || "",
                certificateLanguage: editBa.cab?.certificateLanguage || "",
                otherCertificateLanguage:
                  editBa.cab?.otherCertificateLanguage || "",
                website: editBa.cab?.website || "",
                status: editBa.status,
              }}
              defaultCab={editBa.cab?.cab || []}
              onSuccess={() => {
                setEditBa(null);
                mutate();
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
