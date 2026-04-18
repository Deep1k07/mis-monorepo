"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSurveillanceById } from "@/utils/apis";
import { useAuthStore } from "@/store/auth-store";
import { updateFinalSurveillance } from "@/utils/mutations";
import toast from "react-hot-toast";

function formatAddress(addr: any) {
  if (!addr) return null;
  return [addr.street, addr.city, addr.state, addr.postal_code, addr.country]
    .filter(Boolean)
    .join(", ");
}

export function FinalSurveillanceViewClient() {
  const params = useParams();
  const router = useRouter();
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const type = (params.type as "first" | "second") ?? "first";
  const id = params.id as string;

  const {
    surveillance: app,
    isLoading: loading,
    mutate,
  } = useSurveillanceById(type, id);

  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [commentInitialized, setCommentInitialized] = useState(false);
  const [audit1, setAudit1] = useState("");
  const [audit2, setAudit2] = useState("");
  const [iafCode, setIafCode] = useState("");

  if (app && !commentInitialized) {
    setComment(app.quality_comment || "");
    setAudit1(app.audit1 || "");
    setAudit2(app.audit2 || "");
    setIafCode(app.iaf_code || "");
    setCommentInitialized(true);
  }

  const isLocked =
    app?.qualityStatus === "completed" || app?.qualityStatus === "rejected";

  const fieldsEditable = app?.qualityStatus === "pending";

  const handleAction = async (action: "approve" | "reject") => {
    if (action === "approve") {
      if (!iafCode.trim()) {
        toast.error("IAF Code/SOA/SAMP/FCC is required");
        return;
      }
      if (!audit1.trim()) {
        toast.error("Stage-1 Man-day is required");
        return;
      }
      if (!audit2.trim()) {
        toast.error("Stage-2 Man-day is required");
        return;
      }
    }
    if (action === "reject" && !comment.trim()) {
      toast.error("Cannot reject without a comment");
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateFinalSurveillance(type, id, {
        action,
        comment,
        ...(action === "approve" && {
          audit1,
          audit2,
          iaf_code: iafCode,
        }),
      });
      if (res.ok) {
        toast.success(
          action === "approve"
            ? "Surveillance approved"
            : "Surveillance rejected",
        );
        mutate();
        router.push("/surveillance/final");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
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
        <Button
          variant="outline"
          onClick={() => router.push("/surveillance/final")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Final Surveillance
        </Button>
      </div>
    );
  }

  const entity = app.entity;
  const entityName = app.entity_name || entity?.entity_name || "";
  const entityIdStr = app.entity_id || entity?.entity_id || "";
  const mainAddress =
    app.main_site_address?.[0] ?? entity?.main_site_address?.[0];
  const additionalAddresses =
    app.additional_site_address ?? entity?.additional_site_address ?? [];
  const showBa = !entity?.isDirectClient;
  const ba = app.business_associate ?? entity?.business_associate;
  const baName = typeof ba === "object" ? ba?.username : ba;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/surveillance/final")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {entityName || "-"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="font-mono">{entityIdStr || "-"}</span>
            <button
              onClick={() => navigator.clipboard.writeText(entityIdStr)}
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
            <span className="mx-1">|</span>
            <span className="font-medium capitalize">
              {type === "first" ? "1st" : "2nd"} Surveillance
            </span>
            {app.qualityStatus && (
              <>
                <span className="mx-1">|</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                    app.qualityStatus === "rejected"
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : app.qualityStatus === "completed"
                        ? "bg-green-50 text-green-700 ring-green-600/20"
                        : "bg-amber-50 text-amber-700 ring-amber-600/20"
                  }`}
                >
                  Quality: {app.qualityStatus}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Surveillance Details */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Surveillance Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Entity Name</span>
            <span className="text-sm">{entityName || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Entity ID</span>
            <span className="text-sm font-mono">{entityIdStr || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">CAB Code</span>
            <span className="text-sm font-mono">{app.cab_code || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="iaf-code"
              className="text-xs text-muted-foreground font-normal"
            >
              IAF Code/SOA/SAMP/FCC
            </Label>
            <Input
              id="iaf-code"
              value={iafCode}
              onChange={(e) => setIafCode(e.target.value)}
              disabled={!fieldsEditable}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="audit1"
              className="text-xs text-muted-foreground font-normal"
            >
              Stage-1 Man-day
            </Label>
            <Input
              id="audit1"
              value={audit1}
              onChange={(e) => setAudit1(e.target.value)}
              disabled={!fieldsEditable}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label
              htmlFor="audit2"
              className="text-xs text-muted-foreground font-normal"
            >
              Stage-2 Man-day
            </Label>
            <Input
              id="audit2"
              value={audit2}
              onChange={(e) => setAudit2(e.target.value)}
              disabled={!fieldsEditable}
            />
          </div>
          {app.drive_link && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Drive Link</span>
              <a
                href={app.drive_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline inline-flex items-center gap-1"
              >
                Open Drive
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
          {showBa && baName && (
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Business Associate
              </span>
              <span className="text-sm">{baName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Site Address */}
      {mainAddress && (
        <div>
          <h4 className="text-sm font-semibold mb-3">Main Site Address</h4>
          <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
            <span className="text-sm">{formatAddress(mainAddress)}</span>
          </div>
        </div>
      )}

      {/* Additional Sites */}
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

      {/* Scope */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Scope</h4>
        <div className="p-3 bg-muted/40 rounded-lg">
          <span className="text-sm">{app.scope || "-"}</span>
        </div>
      </div>

      <Separator />

      {/* Quality Review Form */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Quality Review</h4>
        <div className="grid gap-1.5">
          <Label htmlFor="comment">Quality Comment</Label>
          <Textarea
            id="comment"
            placeholder="Enter comment (required for rejection)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            disabled={isLocked}
          />
        </div>

        {!isLocked && (
          <div className="flex gap-3 mt-6">
            {hasPermission("surveillance:approve:final") && (
              <Button
                onClick={() => handleAction("approve")}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? "Processing..." : "Approve"}
              </Button>
            )}
            {hasPermission("surveillance:reject:final") && (
              <Button
                variant="destructive"
                onClick={() => handleAction("reject")}
                disabled={submitting}
              >
                {submitting ? "Processing..." : "Reject"}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
