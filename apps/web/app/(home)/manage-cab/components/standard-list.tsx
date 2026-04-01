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
import { createStandardColumns, StandardDef } from "./standard-columns";
import { StandardForm } from "./standard-form";

export function StandardList() {
  const [page, setPage] = useState(1);
  const [cabFilter, setCabFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput);
  const [createOpen, setCreateOpen] = useState(false);
  const [editStandard, setEditStandard] = useState<StandardDef | null>(null);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setPage(1);
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

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <Select
          value={cabFilter}
          onValueChange={(value) => {
            setCabFilter(value === "all" ? "" : (value ?? ""));
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filter by CAB">
              {cabFilter
                ? cabs?.find((c: any) => c._id === cabFilter)?.cbName
                : null}
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

        {hasPermission("standard:create") && (
          <Button
            onClick={() => setCreateOpen(true)}
            className="cursor-pointer"
          >
            <Plus className="mr-2 h-4 w-4" /> Create Standard
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
          searchValue={searchInput}
          onSearchChange={handleSearchChange}
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
                certificationBody:
                  editStandard.certificationBody?._id || "",
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
