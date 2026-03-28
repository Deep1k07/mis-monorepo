"use client";

import { useState } from "react";
import { Pencil, FileCheck, Copy, MapPin, Mail, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EntityForm } from "./entity-form";
import { EntityDef } from "./columns";

function StatusBadge({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  const status = value || "pending";
  const colorMap: Record<string, string> = {
    completed: "bg-green-50 text-green-700 ring-green-600/20",
    approved: "bg-green-50 text-green-700 ring-green-600/20",
    verified: "bg-green-50 text-green-700 ring-green-600/20",
    "by-pass": "bg-blue-50 text-blue-700 ring-blue-600/20",
    proceed: "bg-blue-50 text-blue-700 ring-blue-600/20",
    active: "bg-green-50 text-green-700 ring-green-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    draft: "bg-slate-50 text-slate-700 ring-slate-600/20",
    "not-verified": "bg-red-50 text-red-700 ring-red-600/20",
  };
  const color = colorMap[status] || colorMap.pending;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`inline-flex items-center self-start rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${color}`}
      >
        {status}
      </span>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm">{value}</span>
      </div>
    </div>
  );
}

export function EntityViewModal({
  entity,
  open,
  onOpenChange,
}: {
  entity: EntityDef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  if (!entity) return null;

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
    business_associate:
      typeof entity.busuness_associate === "object"
        ? entity.busuness_associate?._id || ""
        : entity.busuness_associate || "",
    main_site_address: entity.main_site_address?.length
      ? entity.main_site_address
      : [{ street: "", city: "", state: "", country: "", postal_code: "" }],
    additional_site_address: entity.additional_site_address || [],
  };

  const mainAddress = entity.main_site_address?.[0];

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl">
                  {entity.entity_name}
                </DialogTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-mono">{entity.entity_id}</span>
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(entity.entity_id)
                    }
                    className="hover:text-foreground transition-colors"
                    title="Copy ID"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <span className="mx-1">-</span>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                      entity.isDirectClient
                        ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                        : "bg-purple-50 text-purple-700 ring-purple-600/20"
                    }`}
                  >
                    {entity.isDirectClient ? "Direct Client" : "BAM"}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Separator />

          <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[55vh]">
            {/* Status */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Status</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg">
                <StatusBadge label="Entity Status" value={entity.status} />
              </div>
            </div>

            {/* General Info */}
            <div>
              <h4 className="text-sm font-semibold mb-3">
                General Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoRow icon={Mail} label="Email" value={entity.email} />
                <InfoRow icon={Globe} label="Website" value={entity.website} />
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    English Name
                  </span>
                  <span className="text-sm">
                    {entity.entity_name_english || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Trading Name
                  </span>
                  <span className="text-sm">
                    {entity.entity_trading_name || "-"}
                  </span>
                </div>
                {!entity.isDirectClient && entity.busuness_associate && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Business Associate
                    </span>
                    <span className="text-sm">
                      {typeof entity.busuness_associate === "object"
                        ? entity.busuness_associate.username
                        : entity.busuness_associate}
                    </span>
                  </div>
                )}
                {entity.isDirectClient && entity.direct_price && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Direct Price
                    </span>
                    <span className="text-sm font-medium">
                      ${entity.direct_price}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Address */}
            {mainAddress && (
              <div>
                <h4 className="text-sm font-semibold mb-3">
                  Main Site Address
                </h4>
                <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <span className="text-sm">
                    {[
                      mainAddress.street,
                      mainAddress.city,
                      mainAddress.state,
                      mainAddress.postal_code,
                      mainAddress.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              </div>
            )}

            {/* Additional Addresses */}
            {entity.additional_site_address &&
              entity.additional_site_address.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">
                    Additional Sites ({entity.additional_site_address.length})
                  </h4>
                  <div className="space-y-2">
                    {entity.additional_site_address.map((addr, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg"
                      >
                        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                        <span className="text-sm">
                          {[
                            addr.street,
                            addr.city,
                            addr.state,
                            addr.postal_code,
                            addr.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="px-6 py-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  setTimeout(() => setEditOpen(true), 150);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Entity
              </Button>
              <Button variant="outline" size="sm">
                <FileCheck className="h-4 w-4 mr-2" />
                Apply Certificate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Entity</DialogTitle>
          </DialogHeader>
          <EntityForm
            mode="edit"
            onSuccess={() => setEditOpen(false)}
            defaultValues={defaultValues}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
