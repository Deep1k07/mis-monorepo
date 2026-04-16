"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Copy,
  MapPin,
  Mail,
  Globe,
  ArrowLeft,
  Users,
  FileText,
  Shield,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSurveillanceById } from "@/utils/apis";
import { applySurveillance } from "@/utils/mutations";
import { useAuthStore } from "@/store/auth-store";
import toast from "react-hot-toast";

function StatusBadge({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) {
  const status = value || "upcoming";
  const colorMap: Record<string, string> = {
    upcoming: "bg-blue-50 text-blue-700 ring-blue-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    inprogress: "bg-indigo-50 text-indigo-700 ring-indigo-600/20",
    completed: "bg-green-50 text-green-700 ring-green-600/20",
    suspended: "bg-red-50 text-red-700 ring-red-600/20",
    withdrawn: "bg-red-50 text-red-700 ring-red-600/20",
    proceed: "bg-blue-50 text-blue-700 ring-blue-600/20",
    active: "bg-green-50 text-green-700 ring-green-600/20",
    final: "bg-green-50 text-green-700 ring-green-600/20",
    applied: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    hold: "bg-gray-50 text-gray-700 ring-gray-600/20",
    notrequested: "bg-slate-50 text-slate-700 ring-slate-600/20",
    requested: "bg-amber-50 text-amber-700 ring-amber-600/20",
  };
  const color = colorMap[status] || colorMap.upcoming;

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

export function SurveillanceViewClient() {
  const params = useParams();
  const router = useRouter();
  const type = (params.type as "first" | "second") ?? "first";
  const id = params.id as string;
  const [applying, setApplying] = useState(false);
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const {
    surveillance: app,
    isLoading: loading,
    mutate,
  } = useSurveillanceById(type, id);

  const handleApply = async () => {
    setApplying(true);
    try {
      const res = await applySurveillance(type, id);
      if (res.ok) {
        toast.success("Applied for surveillance");
        mutate();
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to apply");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setApplying(false);
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
        <p className="text-muted-foreground">Surveillance record not found</p>
        <Button variant="outline" onClick={() => router.push("/surveillance")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Surveillance
        </Button>
      </div>
    );
  }

  const entity = app.entity;
  const baName =
    typeof app.business_associate === "object"
      ? app.business_associate?.username
      : app.business_associate;

  const mainAddress =
    app.main_site_address?.[0] ?? entity?.main_site_address?.[0];
  const additionalAddresses =
    app.additional_site_address ?? entity?.additional_site_address ?? [];

  const surveillanceStatus = app.Surveillancestatus ?? "upcoming";
  const applyDisabled =
    applying ||
    ["pending", "inprogress", "completed", "suspended", "withdrawn"].includes(
      surveillanceStatus,
    );
  const canApply = hasPermission("surveillance:apply");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/surveillance")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">
              {app.entity_name || entity?.entity_name || "-"}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
              <span className="font-mono">
                {app.entity_id || entity?.entity_id || "-"}
              </span>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    app.entity_id || entity?.entity_id || "",
                  )
                }
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
              <span className="mx-1">|</span>
              <span className="font-medium capitalize">
                {type === "first" ? "1st" : "2nd"} Surveillance
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canApply && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleApply}
              disabled={applyDisabled}
            >
              <Send className="h-4 w-4 mr-2" />
              {applying ? "Applying..." : "Apply Surveillance"}
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Status Section */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Status</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-3 bg-muted/40 rounded-lg">
          <StatusBadge label="Surveillance Status" value={surveillanceStatus} />
          <StatusBadge
            label="Certificate Status"
            value={app.certificateStatus}
          />
          <StatusBadge label="Manual Status" value={app.manualStatus} />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              {type === "first" ? "1st" : "2nd"} Surveillance Due
            </span>
            <span className="text-sm">
              {(type === "first"
                ? app.first_surveillance
                : app.second_surveillance)?.split("T")[0] ?? "-"}
            </span>
          </div>
          {app.survApplied && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Applied On</span>
              <span className="text-sm">
                {String(app.survApplied).split("T")[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Entity Details */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Entity Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoRow icon={Mail} label="Email" value={entity?.email} />
          <InfoRow icon={Globe} label="Website" value={entity?.website} />
          <InfoRow
            icon={Users}
            label="Employees Count"
            value={entity?.employess_count}
          />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">English Name</span>
            <span className="text-sm">
              {app.entity_name_english || entity?.entity_name_english || "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Trading Name</span>
            <span className="text-sm">
              {app.entity_trading_name || entity?.entity_trading_name || "-"}
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
        <h4 className="text-sm font-semibold mb-3">Scope & Certification</h4>
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
                  <span className="text-xs text-muted-foreground">Annual</span>
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
            <PersonInfo label="Quality Manager" person={app.quality_manager} />
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
      {additionalAddresses.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3">
            Additional Sites ({additionalAddresses.length})
          </h4>
          <div className="space-y-2">
            {additionalAddresses.map((addr: any, i: number) => (
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

      {/* Additional Address (Other Language) */}
      {app.additional_address_multiple &&
        app.additional_address_multiple.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">
              Additional Address (Other Language) (
              {app.additional_address_multiple.length})
            </h4>
            <div className="space-y-2">
              {app.additional_address_multiple.map((addr: any, i: number) => (
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
  );
}
