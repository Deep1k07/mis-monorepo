"use client";

import { useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useEntityById, useCountries, useLanguages } from "@/utils/apis";
import { createApplication } from "@/utils/mutations";
import toast from "react-hot-toast";

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  postal_code: z.string().optional(),
});

const applicationSchema = z
  .object({
    certification_type: z.enum(["individual", "integrated"]),
    cab_code: z.string().min(1, "CAB Code is required"),
    standards: z
      .array(
        z.object({
          code: z.string(),
          name: z.string(),
          _id: z.string(),
        }),
      )
      .min(1, "At least one standard is required"),
    duration: z.string().min(1, "Duration is required"),
    severity: z.enum(["normal", "urgent", "most_urgent"]).default("normal"),
    risk: z.enum(["low", "medium", "high"]).default("low"),
    annexure: z.boolean().default(false),
    auditor_leader_name: z.string().min(1, "Auditor Leader Name is required"),
    charges: z.string().optional(),
    primary_certificate_language: z.string().min(1, "Language is required"),
    drive_link: z.string().optional(),
    scope: z.string().min(1, "Scope is required"),
    secondary_entity_name: z.string().optional(),
    secondary_certificate_language: z.string().optional(),
    additional_scope: z.string().optional(),
    apply_other_language: z.boolean().default(false),
    additional_site_address: z.array(addressSchema).optional(),
    additional_address_multiple: z.array(addressSchema).optional(),
  })
  .superRefine((data, ctx) => {
    const scopeLimit = data.annexure ? 3000 : 1250;
    if (data.scope && data.scope.length > scopeLimit) {
      ctx.addIssue({
        code: "custom",
        path: ["scope"],
        message: `Scope cannot exceed ${scopeLimit} characters`,
      });
    }
    if (data.apply_other_language) {
      if (!data.secondary_entity_name) {
        ctx.addIssue({
          code: "custom",
          path: ["secondary_entity_name"],
          message: "Secondary entity name is required",
        });
      }
      if (!data.secondary_certificate_language) {
        ctx.addIssue({
          code: "custom",
          path: ["secondary_certificate_language"],
          message: "Secondary language is required",
        });
      }
      if (!data.additional_scope) {
        ctx.addIssue({
          code: "custom",
          path: ["additional_scope"],
          message: "Additional scope is required",
        });
      }
      if (
        !data.additional_address_multiple ||
        data.additional_address_multiple.length === 0
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["additional_address_multiple"],
          message: "At least one additional address is required",
        });
      }
    }
  });

type ApplicationFormValues = z.infer<typeof applicationSchema>;

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function ApplyCertificateClient() {
  const params = useParams();
  const router = useRouter();
  const entityId = params.id as string;

  const { entity, isLoading: entityLoading } = useEntityById(entityId);
  const { countries, isLoading: countriesLoading } = useCountries();
  const { languages } = useLanguages();

  const [showOtherLanguage, setShowOtherLanguage] = useState(false);
  const [manualCharges, setManualCharges] = useState(false);

  const form = useForm<ApplicationFormValues>({
    resolver: standardSchemaResolver(applicationSchema),
    defaultValues: {
      certification_type: "individual",
      cab_code: "",
      standards: [],
      duration: "",
      severity: "normal",
      risk: "low",
      annexure: false,
      auditor_leader_name: "",
      charges: "",
      primary_certificate_language: "English",
      drive_link: "",
      scope: "",
      secondary_entity_name: "",
      secondary_certificate_language: "",
      additional_scope: "",
      apply_other_language: false,
      additional_site_address: [],
      additional_address_multiple: [],
    },
  });

  const {
    fields: otherLangAddresses,
    append: appendAddress,
    remove: removeAddress,
  } = useFieldArray({
    control: form.control,
    name: "additional_address_multiple",
  });

  const selectedAdditionalAddresses =
    form.watch("additional_site_address") ?? [];

  const addressKey = (addr: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  }) =>
    [addr.street, addr.city, addr.state, addr.country, addr.postal_code]
      .map((v) => v ?? "")
      .join("|");

  const toggleAdditionalAddress = (addr: any) => {
    const normalized = {
      street: addr.street ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      country: addr.country ?? "",
      postal_code: addr.postal_code ?? "",
    };
    const key = addressKey(normalized);
    const current = selectedAdditionalAddresses;
    const exists = current.some((a) => addressKey(a) === key);
    const next = exists
      ? current.filter((a) => addressKey(a) !== key)
      : [...current, normalized];
    form.setValue("additional_site_address", next, { shouldValidate: true });
  };

  const toggleOtherLanguage = () => {
    const next = !showOtherLanguage;
    setShowOtherLanguage(next);
    form.setValue("apply_other_language", next);
    if (!next) {
      form.clearErrors([
        "secondary_entity_name",
        "secondary_certificate_language",
        "additional_scope",
        "additional_address_multiple",
      ]);
    }
  };

  const selectedCabCode = form.watch("cab_code");
  const selectedStandards = form.watch("standards");
  const selectedDuration = form.watch("duration");

  // BA's assigned CABs from CabBA.cab array

  const currency = useMemo(() => {
    if (!entity?.business_associate?.cab) return "";
    return entity.business_associate.cab.currency === "USD" ? "$" : "₹";
  }, [entity]);
  const baCabs = useMemo(() => {
    if (!entity?.business_associate?.cab?.cab) return [];
    return entity.business_associate.cab.cab.filter(
      (cb: any) => cb.status === "active",
    );
  }, [entity]);

  const mainAddress = entity?.main_site_address?.[0];

  // Standards for the selected CAB
  const selectedCab = useMemo(() => {
    if (!baCabs.length || !selectedCabCode) return null;
    return baCabs.find((cb: any) => cb.cabCode === selectedCabCode);
  }, [baCabs, selectedCabCode]);

  const cabStandards = useMemo(() => {
    if (!selectedCab?.standards) return [];
    return selectedCab.standards.filter((s: any) => s.status === "active");
  }, [selectedCab]);

  // Get rate card for the selected standard
  const { initialRate, recertificationRate } = useMemo(() => {
    if (selectedStandards.length === 0)
      return { initialRate: 0, recertificationRate: 0 };
    const selected = selectedStandards[0];
    const std = cabStandards.find((s: any) => s.code === selected?.code);
    if (!std?.rateCard) return { initialRate: 0, recertificationRate: 0 };
    const activeCard =
      std.rateCard.find((rc: any) => rc.status === "active") || std.rateCard[0];
    if (!activeCard) return { initialRate: 0, recertificationRate: 0 };
    return {
      initialRate: parseFloat(activeCard.initial || "0") || 0,
      recertificationRate: parseFloat(activeCard.recertification || "0") || 0,
    };
  }, [selectedStandards, cabStandards]);

  function selectStandard(std: any) {
    form.setValue("standards", [
      { code: std.code, name: std.name, _id: std.code },
    ]);
    form.setValue("duration", "");
    form.setValue("charges", "");
  }

  async function onSubmit(data: ApplicationFormValues) {
    if (!entity) return;

    const payload: any = {
      entity: entity._id,
      cab_code: data.cab_code,
      standards: data.standards.map((s) => ({ code: s.code, name: s.name })),
      duration: data.duration,
      severity: data.severity,
      risk: data.risk,
      annexure: data.annexure,
      auditor_leader_name: data.auditor_leader_name || "",
      certification_type: data.certification_type,
      charges: data.charges || "",
      primary_certificate_language: data.primary_certificate_language,
      drive_link: data.drive_link || "",
      scope: data.scope,
      additional_site_address: data.additional_site_address ?? [],
    };

    if (showOtherLanguage) {
      payload.secondary_entity_name = data.secondary_entity_name || "";
      payload.secondary_certificate_language =
        data.secondary_certificate_language || "";
      payload.additional_scope = data.additional_scope || "";
      payload.additional_address_multiple =
        data.additional_address_multiple ?? [];
    }

    try {
      const res = await createApplication(payload);
      if (res.ok) {
        toast.success("Application created successfully", {
          id: "apply-cert",
        });
        router.push(`/entity/view/${entityId}`);
      } else {
        const err = await res.json().catch(() => null);
        toast.error(err?.message || "Failed to create application", {
          id: "apply-cert",
        });
      }
    } catch {
      toast.error("Failed to create application", { id: "apply-cert" });
    }
  }

  if (entityLoading) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          className="cursor-pointer"
          variant="outline"
          size="icon"
          onClick={() => router.push(`/entity/view/${entityId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Apply For Certificate
          </h2>
          <p className="text-sm text-muted-foreground">
            Entity:{" "}
            <span className="text-primary font-medium">
              {entity.entity_name}
            </span>
            <span className="mx-2 text-muted-foreground/50">|</span>
            <span className="font-mono text-xs">{entity.entity_id}</span>
            <span className="mx-2 text-muted-foreground/50">|</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${
                entity.isDirectClient
                  ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                  : "bg-purple-50 text-purple-700 ring-purple-600/20"
              }`}
            >
              {entity.isDirectClient ? "Client" : "BAM"}
            </span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Entity Info */}
      <div className="rounded-lg border bg-card p-5">
        <h3 className="text-sm font-semibold mb-3">Entity Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-xs text-muted-foreground">Entity Name</span>
            <p className="font-medium">{entity.entity_name}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Entity ID</span>
            <p className="font-mono">{entity.entity_id}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              Employees Count
            </span>
            <p>{entity.employess_count || "-"}</p>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">
              Business Associate
            </span>
            <p>{entity.business_associate?.username || "-"}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-xs text-muted-foreground">
              Main Site Address
            </span>
            <div className="flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <p>
                {[
                  mainAddress?.street,
                  mainAddress?.city,
                  mainAddress?.state,
                  mainAddress?.postal_code,
                  mainAddress?.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "-"}
              </p>
            </div>
          </div>
          {entity.additional_site_address &&
            entity.additional_site_address.length > 0 && (
              <div className="sm:col-span-3">
                <span className="text-xs text-muted-foreground">
                  Additional Site Addresses (
                  {entity.additional_site_address.length})
                </span>
                <div className="space-y-1.5 mt-1">
                  {entity.additional_site_address.map(
                    (addr: any, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                        <p className="text-sm">
                          {[
                            addr.street,
                            addr.city,
                            addr.state,
                            addr.postal_code,
                            addr.country,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Annexure, Severity, Risk */}
          <SectionCard title="Application Settings">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="annexure"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Apply for Annexures
                    </FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="most_urgent">Most Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="risk"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          {/* Certification & CAB */}
          <SectionCard title="Certification">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="certification_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate Type</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("cab_code", "");
                        form.setValue("standards", []);
                        form.setValue("duration", "");
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Certificate Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="individual">Individual</SelectItem>
                        <SelectItem value="integrated" disabled>
                          Integrated
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cab_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CAB Code</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue("standards", []);
                        form.setValue("duration", "");
                      }}
                      value={field.value}
                      disabled={!baCabs.length}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !baCabs.length
                                ? "No CABs available"
                                : "Select CAB"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {baCabs.map((cb: any) => (
                          <SelectItem key={cb._id} value={cb.cabCode}>
                            {cb.cabCode} - {cb.cbCode}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Standards Selection (single select) */}
            {selectedCabCode && cabStandards.length > 0 && (
              <div className="space-y-2">
                <FormLabel>Standard</FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/30">
                  {cabStandards.map((std: any) => {
                    const isSelected = selectedStandards.some(
                      (s) => s.code === std.code,
                    );
                    return (
                      <label
                        key={std.code}
                        className={`flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-muted/50 ${isSelected ? "bg-primary/5 ring-1 ring-primary/20" : ""}`}
                        onClick={() => selectStandard(std)}
                      >
                        <div
                          className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? "border-primary" : "border-muted-foreground/40"}`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <span className="text-sm">
                          {std.code} - {std.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {form.formState.errors.standards && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.standards.message}
                  </p>
                )}

                {/* Show rates for selected standard */}
                {selectedStandards.length > 0 && (
                  <div className="flex gap-6 p-3 border rounded-lg bg-muted/20 text-sm">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Initial (1 Year)
                      </span>
                      <p className="font-medium">
                        {currency}
                        {initialRate.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Recertification (3 Year)
                      </span>
                      <p className="font-medium">
                        {currency}
                        {recertificationRate.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedStandards.length > 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (!manualCharges) {
                              const rate =
                                val === "1 Year"
                                  ? initialRate
                                  : recertificationRate;
                              form.setValue("charges", rate.toFixed(2));
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="1 Year">
                              1 Year — {currency}
                              {initialRate.toFixed(2)}
                            </SelectItem>
                            <SelectItem value="3 Year">
                              3 Year — {currency}
                              {recertificationRate.toFixed(2)}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="charges"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Charges ($)</FormLabel>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <Checkbox
                              checked={manualCharges}
                              disabled={!selectedDuration}
                              onCheckedChange={(checked) => {
                                setManualCharges(!!checked);
                                if (!checked && selectedDuration) {
                                  const rate =
                                    selectedDuration === "1 Year"
                                      ? initialRate
                                      : recertificationRate;
                                  form.setValue("charges", rate.toFixed(2));
                                }
                              }}
                            />
                            <span className="text-xs text-muted-foreground">
                              Add charges manually
                            </span>
                          </label>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!manualCharges || !selectedDuration}
                            placeholder={
                              selectedDuration
                                ? "Enter charges"
                                : "Select duration first"
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}
          </SectionCard>

          {/* Application Details */}
          <SectionCard title="Application Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="auditor_leader_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Lead Auditor Name{" "}
                      {/* <span className="text-xs text-muted-foreground">(optional)</span> */}
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="drive_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Drive Link{" "}
                      <span className="text-xs text-muted-foreground">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </SectionCard>

          {/* Scope & Language */}
          <SectionCard title="Scope & Language">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primary_certificate_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Certificate Language</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang} value={lang}>
                            {lang}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => {
                const scopeLimit = form.watch("annexure") ? 3000 : 1250;
                return (
                  <FormItem>
                    <FormLabel>Scope</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter scope details..."
                        maxLength={scopeLimit}
                        className="min-h-24"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground text-right">
                      {field.value?.length || 0}/{scopeLimit}
                    </p>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />

          </SectionCard>

          {/* Additional Site Addresses picker (optional) */}
          {entity.additional_site_address &&
            entity.additional_site_address.length > 0 && (
              <SectionCard title="Additional Site Addresses (optional)">
                <p className="text-xs text-muted-foreground">
                  Select additional sites from this entity to include in the
                  application.
                </p>
                <div className="space-y-1.5">
                  {entity.additional_site_address.map(
                    (addr: any, i: number) => {
                      const key = addressKey({
                        street: addr.street ?? "",
                        city: addr.city ?? "",
                        state: addr.state ?? "",
                        country: addr.country ?? "",
                        postal_code: addr.postal_code ?? "",
                      });
                      const isSelected = selectedAdditionalAddresses.some(
                        (a) => addressKey(a) === key,
                      );
                      return (
                        <label
                          key={i}
                          className={`flex items-start gap-3 p-2.5 rounded-md cursor-pointer border text-sm transition-colors ${
                            isSelected
                              ? "bg-primary/5 border-primary/30"
                              : "bg-muted/40 border-transparent hover:bg-muted/60"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleAdditionalAddress(addr)}
                            className="mt-0.5"
                          />
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                            <span>
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
                        </label>
                      );
                    },
                  )}
                </div>
              </SectionCard>
            )}

          {/* Other Language Section */}
          <div className="rounded-lg border bg-card">
            <button
              type="button"
              className="flex items-center justify-between w-full p-5 cursor-pointer"
              onClick={() => {
                const wasClosed = !showOtherLanguage;
                toggleOtherLanguage();
                if (wasClosed && otherLangAddresses.length === 0) {
                  appendAddress({
                    street: "",
                    city: "",
                    state: "",
                    country: "",
                    postal_code: "",
                  });
                }
              }}
            >
              <h3 className="text-sm font-semibold">
                Apply in Other Languages
              </h3>
              {showOtherLanguage ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showOtherLanguage && (
              <div className="px-5 pb-5 space-y-4">
                <Separator />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="secondary_entity_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Secondary Entity Name{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondary_certificate_language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Secondary Certificate Language{" "}
                          <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {languages.map((lang) => (
                              <SelectItem key={lang} value={lang}>
                                {lang}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="additional_scope"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Additional Scope{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional scope..."
                          maxLength={1250}
                          className="min-h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">
                        Additional Address (Other Language){" "}
                        <span className="text-destructive">*</span>
                      </h4>
                      {form.formState.errors.additional_address_multiple
                        ?.message && (
                        <p className="text-sm text-destructive mt-1">
                          {
                            form.formState.errors.additional_address_multiple
                              .message as string
                          }
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        appendAddress({
                          street: "",
                          city: "",
                          state: "",
                          country: "",
                          postal_code: "",
                        })
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>

                  {otherLangAddresses.map((field, index) => (
                    <div
                      key={field.id}
                      className="p-4 border rounded-lg relative space-y-4 bg-muted/20"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={() => removeAddress(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>

                      <FormField
                        control={form.control}
                        name={`additional_address_multiple.${index}.street`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`additional_address_multiple.${index}.city`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`additional_address_multiple.${index}.state`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>State</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`additional_address_multiple.${index}.country`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={countriesLoading}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={
                                        countriesLoading
                                          ? "Loading..."
                                          : "Select Country"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries?.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                      {c.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`additional_address_multiple.${index}.postal_code`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Postal Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full sm:w-auto px-8"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Submitting..."
              : "Submit Application"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
