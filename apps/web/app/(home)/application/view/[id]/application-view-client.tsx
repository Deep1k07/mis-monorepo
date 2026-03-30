"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Pencil,
  Copy,
  MapPin,
  Mail,
  Globe,
  ArrowLeft,
  Users,
  FileText,
  Shield,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApplicationById } from "@/utils/apis";
import { apiFetch } from "@/lib/api-fetch";
import toast from "react-hot-toast";

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
    active: "bg-green-50 text-green-700 ring-green-600/20",
    final: "bg-green-50 text-green-700 ring-green-600/20",
    proceed: "bg-blue-50 text-blue-700 ring-blue-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    applied: "bg-amber-50 text-amber-700 ring-amber-600/20",
    notrequested: "bg-slate-50 text-slate-700 ring-slate-600/20",
    requested: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    hold: "bg-gray-50 text-gray-700 ring-gray-600/20",
    withdrawn: "bg-red-50 text-red-700 ring-red-600/20",
    suspended: "bg-red-50 text-red-700 ring-red-600/20",
    cancelled: "bg-red-50 text-red-700 ring-red-600/20",
    terminated: "bg-red-50 text-red-700 ring-red-600/20",
    expired: "bg-orange-50 text-orange-700 ring-orange-600/20",
    normal: "bg-slate-50 text-slate-700 ring-slate-600/20",
    urgent: "bg-amber-50 text-amber-700 ring-amber-600/20",
    most_urgent: "bg-red-50 text-red-700 ring-red-600/20",
    low: "bg-green-50 text-green-700 ring-green-600/20",
    medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
    high: "bg-red-50 text-red-700 ring-red-600/20",
  };
  const color = colorMap[status] || colorMap.pending;

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span
        className={`inline-flex items-center self-start rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${color}`}
      >
        {status.replace(/_/g, " ")}
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

function PersonInfo({
  label,
  person,
}: {
  label: string;
  person?: { firstName?: string; lastName?: string; email?: string };
}) {
  if (!person) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm">
        {person.firstName} {person.lastName}
      </span>
      {person.email && (
        <span className="text-xs text-muted-foreground">{person.email}</span>
      )}
    </div>
  );
}

function formatAddress(addr: any) {
  if (!addr) return null;
  return [addr.street, addr.city, addr.state, addr.postal_code, addr.country]
    .filter(Boolean)
    .join(", ");
}

export function ApplicationViewClient() {
  const params = useParams();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    application: app,
    isLoading: loading,
    mutate,
  } = useApplicationById(params.id as string);

  // Edit form state
  const [editData, setEditData] = useState<any>({});

  const openEdit = () => {
    if (!app) return;
    setEditData({
      entity_name: app.entity_name || "",
      entity_name_english: app.entity_name_english || "",
      entity_trading_name: app.entity_trading_name || "",
      email: app.email || "",
      website: app.website || "",
      employess_count: app.employess_count || "",
      scope: app.scope || "",
      additional_scope: app.additional_scope || "",
      primary_certificate_language: app.primary_certificate_language || "",
      secondary_certificate_language:
        app.secondary_certificate_language || "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/application/${params.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editData),
        },
      );
      if (res.ok) {
        toast.success("Application updated successfully");
        mutate();
        setEditOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Application not found</p>
        <Button variant="outline" onClick={() => router.push("/application")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Applications
        </Button>
      </div>
    );
  }

  const baName =
    typeof app.busuness_associate === "object"
      ? app.busuness_associate?.username
      : app.busuness_associate;

  const mainAddress = app.main_site_address?.[0];

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.push("/application")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {app.entity_name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <span className="font-mono">{app.entity_id}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(app.entity_id)}
                  className="hover:text-foreground transition-colors"
                  title="Copy Entity ID"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
                {app.cab_code && (
                  <>
                    <span className="mx-1">|</span>
                    <span className="font-mono">{app.cab_code}</span>
                  </>
                )}
                {app.certificate_number && (
                  <>
                    <span className="mx-1">|</span>
                    <span className="font-mono">
                      Cert: {app.certificate_number}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={openEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit Application
            </Button>
          </div>
        </div>

        <Separator />

        {/* Status Section */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Status</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-muted/40 rounded-lg">
            <StatusBadge
              label="Certificate Status"
              value={app.certificateStatus}
            />
            <StatusBadge label="Quality Status" value={app.qualityStatus} />
            <StatusBadge label="BA Status" value={app.baStatus} />
            <StatusBadge label="Manual Status" value={app.manualStatus} />
            <StatusBadge label="Severity" value={app.severity} />
            <StatusBadge label="Risk" value={app.risk} />
          </div>
        </div>

        {/* General Info */}
        <div>
          <h4 className="text-sm font-semibold mb-3">General Information</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoRow icon={Mail} label="Email" value={app.email} />
            <InfoRow icon={Globe} label="Website" value={app.website} />
            <InfoRow
              icon={Users}
              label="Employees Count"
              value={app.employess_count}
            />
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                English Name
              </span>
              <span className="text-sm">
                {app.entity_name_english || "-"}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Trading Name
              </span>
              <span className="text-sm">
                {app.entity_trading_name || "-"}
              </span>
            </div>
            {baName && (
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Business Associate
                </span>
                <span className="text-sm">{baName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Standards */}
        {app.standards && app.standards.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Standards</h4>
            <div className="flex flex-wrap gap-2">
              {app.standards.map((s: any, i: number) => (
                <span
                  key={i}
                  className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20"
                >
                  {s.code} {s.name && `- ${s.name}`}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Scope & Certification */}
        <div>
          <h4 className="text-sm font-semibold mb-3">
            Scope & Certification
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={FileText} label="Scope" value={app.scope} />
            <InfoRow
              icon={FileText}
              label="Additional Scope"
              value={app.additional_scope}
            />
            <InfoRow
              icon={Shield}
              label="Primary Certificate Language"
              value={app.primary_certificate_language}
            />
            <InfoRow
              icon={Shield}
              label="Secondary Certificate Language"
              value={app.secondary_certificate_language}
            />
          </div>
        </div>

        {/* Rate Card */}
        {app.rate_card &&
          (app.rate_card.initial ||
            app.rate_card.annual ||
            app.rate_card.recertification) && (
            <div>
              <h4 className="text-sm font-semibold mb-3">Rate Card</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-muted/40 rounded-lg">
                {app.rate_card.initial && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Initial
                    </span>
                    <span className="text-sm font-medium">
                      {app.rate_card.initial}
                    </span>
                  </div>
                )}
                {app.rate_card.annual && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Annual
                    </span>
                    <span className="text-sm font-medium">
                      {app.rate_card.annual}
                    </span>
                  </div>
                )}
                {app.rate_card.recertification && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Recertification
                    </span>
                    <span className="text-sm font-medium">
                      {app.rate_card.recertification}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* Assigned People */}
        {(app.scope_manager ||
          app.quality_manager ||
          app.certificate_manager ||
          app.finance_manager ||
          app.appliedBy) && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Assigned People</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <PersonInfo label="Scope Manager" person={app.scope_manager} />
              <PersonInfo
                label="Quality Manager"
                person={app.quality_manager}
              />
              <PersonInfo
                label="Certificate Manager"
                person={app.certificate_manager}
              />
              <PersonInfo
                label="Finance Manager"
                person={app.finance_manager}
              />
              <PersonInfo label="Applied By" person={app.appliedBy} />
            </div>
          </div>
        )}

        {/* Main Address */}
        {mainAddress && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Main Site Address</h4>
            <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span className="text-sm">{formatAddress(mainAddress)}</span>
            </div>
          </div>
        )}

        {/* Additional Addresses */}
        {app.additional_site_address &&
          app.additional_site_address.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3">
                Additional Sites ({app.additional_site_address.length})
              </h4>
              <div className="space-y-2">
                {app.additional_site_address.map((addr: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg"
                  >
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="text-sm">{formatAddress(addr)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-entity-name">Entity Name</Label>
              <Input
                id="edit-entity-name"
                value={editData.entity_name}
                onChange={(e) =>
                  setEditData({ ...editData, entity_name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-entity-name-english">
                Entity Name (English)
              </Label>
              <Input
                id="edit-entity-name-english"
                value={editData.entity_name_english}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    entity_name_english: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-trading-name">Trading Name</Label>
              <Input
                id="edit-trading-name"
                value={editData.entity_trading_name}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    entity_trading_name: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editData.email}
                onChange={(e) =>
                  setEditData({ ...editData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-website">Website</Label>
              <Input
                id="edit-website"
                value={editData.website}
                onChange={(e) =>
                  setEditData({ ...editData, website: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-employees">Employees Count</Label>
              <Input
                id="edit-employees"
                value={editData.employess_count}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    employess_count: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="edit-scope">Scope</Label>
              <Input
                id="edit-scope"
                value={editData.scope}
                onChange={(e) =>
                  setEditData({ ...editData, scope: e.target.value })
                }
              />
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="edit-additional-scope">Additional Scope</Label>
              <Input
                id="edit-additional-scope"
                value={editData.additional_scope}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    additional_scope: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-primary-lang">
                Primary Certificate Language
              </Label>
              <Input
                id="edit-primary-lang"
                value={editData.primary_certificate_language}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    primary_certificate_language: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-secondary-lang">
                Secondary Certificate Language
              </Label>
              <Input
                id="edit-secondary-lang"
                value={editData.secondary_certificate_language}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    secondary_certificate_language: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter showCloseButton>
            <Button onClick={handleSave} disabled={saving} size="sm">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
