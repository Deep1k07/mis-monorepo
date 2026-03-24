"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityForm } from "./entity-form";
import { EntityDef } from "./columns";

export function EntityActions({ entity }: { entity: EntityDef }) {
  const [openView, setOpenView] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const entityType: "client" | "bam" = entity.isDirectClient ? "client" : "bam";

  const defaultValues = {
    type: entityType,
    entity_id: entity.entity_id || "",
    entity_name: entity.entity_name || "",
    entity_name_english: entity.entity_name_english || "",
    entity_trading_name: entity.entity_trading_name || "",
    email: entity.email || "",
    website: entity.website || "",
    drive_link: entity.drive_link || "",
    direct_price: entity.direct_price || "",
    business_associate: entity.busuness_associate || "",
    main_site_address: entity.main_site_address?.length
      ? entity.main_site_address
      : [{ street: "", city: "", state: "", country: "", postal_code: "" }],
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium hover:bg-slate-100 hover:text-slate-900 h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(entity.entity_id)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setOpenView(true)}>
              <Eye className="mr-2 h-4 w-4" />
              View details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setOpenEdit(true)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit entity
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={openView} onOpenChange={setOpenView}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>View Entity Details</DialogTitle>
            <DialogDescription>
              Viewing information for {entity.entity_name}.
            </DialogDescription>
          </DialogHeader>
          <EntityForm mode="view" defaultValues={defaultValues} />
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Entity</DialogTitle>
            <DialogDescription>
              Update information for {entity.entity_name}. Save when done.
            </DialogDescription>
          </DialogHeader>
          <EntityForm
            mode="edit"
            onSuccess={() => setOpenEdit(false)}
            defaultValues={defaultValues}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
