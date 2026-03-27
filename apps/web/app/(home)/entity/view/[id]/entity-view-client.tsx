"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Pencil,
  FileCheck,
  Copy,
  MapPin,
  Mail,
  Globe,
  ArrowLeft,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EntityForm } from "../../components/entity-form";
import { EntityDef } from "../../components/columns";
import { getEntityById } from "@/utils/apis";

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

export function EntityViewClient() {
  const params = useParams();
  const router = useRouter();
  const [entity, setEntity] = useState<EntityDef | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    async function fetchEntity() {
      try {
        const res = await getEntityById(params.id as string);
        if (res.ok) {
          const data = await res.json();
          setEntity(data);
        }
      } catch (error) {
        console.error("Failed to fetch entity", error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) fetchEntity();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Entity not found</p>
        <Button variant="outline" onClick={() => router.push("/entity")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Entities
        </Button>
      </div>
    );
  }

  const entityType: "client" | "bam" = entity.isDirectClient
    ? "client"
    : "bam";

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/entity")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {entity.entity_name}
              </h2>
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
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditOpen(true)}
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

        <Separator />

        {/* Status */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Status</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-muted/40 rounded-lg">
            <StatusBadge label="Entity Status" value={entity.status} />
          </div>
        </div>

        {/* General Info */}
        <div>
          <h4 className="text-sm font-semibold mb-3">General Information</h4>
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

        {/* Main Address */}
        {mainAddress && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Main Site Address</h4>
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
