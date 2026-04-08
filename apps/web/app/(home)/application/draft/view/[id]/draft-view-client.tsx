"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Copy, MapPin, FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApplicationById } from "@/utils/apis";
import { useAuthStore } from "@/store/auth-store";
import { updateApplication } from "@/utils/mutations";
import toast from "react-hot-toast";

function formatAddress(addr: any) {
  if (!addr) return null;
  return [addr.street, addr.city, addr.state, addr.postal_code, addr.country]
    .filter(Boolean)
    .join(", ");
}

export function DraftViewClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const hasPermission = useAuthStore((s) => s.hasPermission);

  const {
    application: app,
    isLoading: loading,
    mutate,
  } = useApplicationById(params.id as string);

  const [scope, setScope] = useState("");
  const [originalScope, setOriginalScope] = useState("");
  const [audit1, setAudit1] = useState("");
  const [audit2, setAudit2] = useState("");
  const [iafCode, setIafCode] = useState("");
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [scopeInitialized, setScopeInitialized] = useState(false);

  if (app && !scopeInitialized) {
    setScope(app.scope || "");
    setOriginalScope(app.scope || "");
    setScopeInitialized(true);
  }

  const handleAction = async (action: "approve" | "reject") => {
    if (!audit1.trim()) {
      toast.error("Stage-1 Man-day is required");
      return;
    }
    if (!audit2.trim()) {
      toast.error("Stage-2 Man-day is required");
      return;
    }
    if (!iafCode.trim()) {
      toast.error("IAF Code / FCC is required");
      return;
    }
    if (action === "reject" && !comment.trim()) {
      toast.error("Comment is required for rejection");
      return;
    }

    setSubmitting(true);
    try {
      const isScopeModified =
        scope.trim() !== originalScope.trim()
          ? (app?.isScopeModified || 0) + 1
          : 0; // increment if scope is modified
      const payload: any = {
        audit1,
        audit2,
        scope,
        iaf_code: iafCode,
        scope_comment: comment,
        isScopeModified,
        scopeStatus: action === "approve" ? "completed" : "rejected",
      };

      const res = await updateApplication(params.id as string, payload);
      if (res.ok) {
        toast.success(
          action === "approve"
            ? "Application scope approved"
            : "Application scope rejected",
        );
        mutate();
        router.push("/application/draft");
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
        <p className="text-muted-foreground">Application not found</p>
        <Button
          variant="outline"
          onClick={() => router.push("/application/draft")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Draft Applications
        </Button>
      </div>
    );
  }

  const entity = app.entity;
  const mainAddress = entity?.main_site_address?.[0];
  const showBa = entity && !entity.isDirectClient;
  const baName =
    typeof entity?.business_associate === "object"
      ? entity?.business_associate?.username
      : entity?.business_associate;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/application/draft")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            {entity?.entity_name || "-"}
          </h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="font-mono">{entity?.entity_id || "-"}</span>
            <button
              onClick={() =>
                navigator.clipboard.writeText(entity?.entity_id || "")
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
                <span className="mx-1">|</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                    app.scopeStatus === "rejected"
                      ? "bg-red-50 text-red-700 ring-red-600/20"
                      : "bg-green-50 text-green-700 ring-green-600/20"
                  }`}
                >
                  {app.scopeStatus}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Application Details */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Application Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Entity Name</span>
            <span className="text-sm">{entity?.entity_name || "-"}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Entity ID</span>
            <span className="text-sm font-mono">
              {entity?.entity_id || "-"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">CAB Code</span>
            <span className="text-sm font-mono">{app.cab_code || "-"}</span>
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
      {entity?.additional_site_address &&
        entity.additional_site_address.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">
              Additional Sites ({entity.additional_site_address.length})
            </h4>
            <div className="space-y-2">
              {entity.additional_site_address.map((addr: any, i: number) => (
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

      {/* Scope (editable) */}
      <div>
        <h4 className="text-sm font-semibold mb-3">
          Scope
          <span className="text-red-500"> * </span>
          {app.scopeStatus === "rejected" && (
            <span className="text-red-400">{` Scope Modified (${app?.isScopeModified || 0}) times`}</span>
          )}
        </h4>
        <Textarea
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          rows={3}
          placeholder="Enter scope"
        />
      </div>

      <Separator />

      {/* Scope Review Form */}
      <div>
        <h4 className="text-lg font-semibold mb-4">Scope Review</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="audit1">
              Stage-1 Man-day <span className="text-red-500">*</span>
            </Label>
            <Input
              id="audit1"
              placeholder="Enter stage-1 man-day"
              value={audit1}
              onChange={(e) => setAudit1(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="audit2">
              Stage-2 Man-day <span className="text-red-500">*</span>
            </Label>
            <Input
              id="audit2"
              placeholder="Enter stage-2 man-day"
              value={audit2}
              onChange={(e) => setAudit2(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="iafCode">
              IAF Code / FCC <span className="text-red-500">*</span>
            </Label>
            <Input
              id="iafCode"
              placeholder="Enter IAF Code / FCC"
              value={iafCode}
              onChange={(e) => setIafCode(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label htmlFor="comment">Scope Comment</Label>
            <Textarea
              id="comment"
              placeholder="Enter comment (required for rejection)"
              value={comment || app.scope_comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          {hasPermission("application:approve:draft") &&
            app?.scopeStatus === "rejected" && (
              <Button
                onClick={() => handleAction("approve")}
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? "Processing..." : "Approve"}
              </Button>
            )}
          {hasPermission("application:reject:draft") && (
            <Button
              variant="destructive"
              onClick={() => handleAction("reject")}
              disabled={submitting}
            >
              {submitting ? "Processing..." : "Reject"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
