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
  Phone,
  User,
  Hash,
  Calendar,
  Building,
  CreditCard,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useBaById } from "@/utils/apis";
import { BaForm } from "../../components/ba-form";
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
    active: "bg-green-50 text-green-700 ring-green-600/20",
    approved: "bg-green-50 text-green-700 ring-green-600/20",
    inactive: "bg-slate-50 text-slate-700 ring-slate-600/20",
    pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
    rejected: "bg-red-50 text-red-700 ring-red-600/20",
    suspended: "bg-red-50 text-red-700 ring-red-600/20",
  };
  const color = colorMap[status] || colorMap.pending;

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
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

export function BaViewClient() {
  const params = useParams();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);

  const { ba, isLoading: loading, mutate } = useBaById(params.id as string);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        Loading...
      </div>
    );
  }

  if (!ba) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-muted-foreground">Business Associate not found</p>
        <Button variant="outline" onClick={() => router.push("/manage-ba")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Manage BA
        </Button>
      </div>
    );
  }

  const cab = ba.cab;
  const address = cab?.address;

  const defaultValues = {
    username: ba.username || "",
    email: ba.email || "",
    password: "",
    phone: ba.phone || "",
    contact_name: cab?.contact_name || "",
    registration_authority: cab?.registration_authority || "",
    registration_number: cab?.registration_number || "",
    registration_date: cab?.registration_date || "",
    address: {
      street: address?.street || "",
      city: address?.city || "",
      state: address?.state || "",
      country: address?.country || "",
      postal_code: address?.postal_code || "",
    },
    currency: cab?.currency || "",
    gst: cab?.gst || "",
    certificateLanguage: cab?.certificateLanguage || "",
    otherCertificateLanguage: cab?.otherCertificateLanguage || "",
    website: cab?.website || "",
    status: ba.status,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              className="cursor-pointer"
              variant="outline"
              size="icon"
              onClick={() => router.push("/manage-ba")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {ba.username}
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {ba.userId && (
                  <>
                    <span className="font-mono">{ba.userId}</span>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(ba.userId);
                        toast.success("User ID copied to clipboard", {
                          id: "ba-view",
                        });
                      }}
                      className="hover:text-foreground transition-colors cursor-pointer"
                      title="Copy ID"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <span className="mx-1">-</span>
                  </>
                )}
                <StatusBadge label="" value={ba.status} />
              </div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit BA
          </Button>
        </div>

        <Separator />

        {/* Account Details */}
        <div>
          <h4 className="text-sm font-semibold mb-3">Account Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InfoRow icon={User} label="Username" value={ba.username} />
            <InfoRow icon={Mail} label="Email" value={ba.email} />
            <InfoRow icon={Hash} label="User ID" value={ba.userId} />
            <InfoRow icon={Phone} label="Phone" value={ba.phone} />
          </div>
        </div>

        {/* Registration Details */}
        {cab && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Registration Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow
                icon={User}
                label="Contact Name"
                value={cab.contact_name}
              />
              <InfoRow
                icon={Building}
                label="Registration Authority"
                value={cab.registration_authority}
              />
              <InfoRow
                icon={Hash}
                label="Registration Number"
                value={cab.registration_number}
              />
              <InfoRow
                icon={Calendar}
                label="Registration Date"
                value={cab.registration_date?.split("T")[0]}
              />
              <InfoRow
                icon={CreditCard}
                label="Currency"
                value={cab.currency}
              />
              <InfoRow icon={CreditCard} label="GST" value={cab.gst} />
              <InfoRow icon={Globe} label="Website" value={cab.website} />
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Certificate Language
                </span>
                <span className="text-sm">
                  {cab.certificateLanguage || "-"}
                </span>
              </div>
              {cab.otherCertificateLanguage && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Other Certificate Language
                  </span>
                  <span className="text-sm">
                    {cab.otherCertificateLanguage}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address */}
        {address && (address.street || address.city || address.country) && (
          <div>
            <h4 className="text-sm font-semibold mb-3">Address</h4>
            <div className="flex items-start gap-3 p-3 bg-muted/40 rounded-lg">
              <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <span className="text-sm">
                {[
                  address.street,
                  address.city,
                  address.state,
                  address.postal_code,
                  address.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          </div>
        )}

        {/* CB Rate Cards */}
        {cab?.cab && cab.cab.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3">
              CB Rate Cards ({cab.cab.length})
            </h4>
            <div className="space-y-4">
              {cab.cab.map((cb: any, idx: number) => (
                <div key={idx} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        CAB: {cb.cabCode}
                      </span>
                      {cb.cbCode && (
                        <span className="text-xs text-muted-foreground">
                          CB: {cb.cbCode}
                        </span>
                      )}
                      {cb.abCode && (
                        <span className="text-xs text-muted-foreground">
                          AB: {cb.abCode}
                        </span>
                      )}
                    </div>
                    <StatusBadge label="" value={cb.status} />
                  </div>

                  {cb.standards && cb.standards.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Standard
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Version
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Status
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Initial
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Annual
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              3 Year Fee
                            </th>
                            <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                              Start Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {cb.standards.map((std: any, sIdx: number) => {
                            const rc = std.rateCard?.[0];
                            return (
                              <tr
                                key={sIdx}
                                className="border-b last:border-b-0"
                              >
                                <td className="px-3 py-2 font-mono text-xs">
                                  {std.code}
                                </td>
                                <td className="px-3 py-2">{std.version}</td>
                                <td className="px-3 py-2">
                                  <StatusBadge label="" value={std.status} />
                                </td>
                                <td className="px-3 py-2">
                                  {rc?.initial ?? "-"}
                                </td>
                                <td className="px-3 py-2">
                                  {rc?.annual ?? "-"}
                                </td>
                                <td className="px-3 py-2">
                                  {rc?.recertification ?? "-"}
                                </td>
                                <td className="px-3 py-2">
                                  {rc?.startDate?.split("T")[0] ?? "-"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Business Associate</DialogTitle>
            <DialogDescription>
              Update business associate details.
            </DialogDescription>
          </DialogHeader>
          <BaForm
            mode="edit"
            baId={ba._id}
            defaultValues={defaultValues}
            defaultCab={cab?.cab || []}
            onSuccess={() => {
              setEditOpen(false);
              mutate();
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
