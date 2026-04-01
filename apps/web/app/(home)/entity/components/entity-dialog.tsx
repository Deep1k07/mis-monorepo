"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EntityForm } from "./entity-form";

export function EntityDialog() {
  const [open, setOpen] = useState(false);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  if (!hasPermission("entity:create")) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" />}>
        <Plus className="h-4 w-4" /> Create Entity
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create Entity</DialogTitle>
          <DialogDescription>
            Add a new direct client or business associate managed entity.
          </DialogDescription>
        </DialogHeader>
        <EntityForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
