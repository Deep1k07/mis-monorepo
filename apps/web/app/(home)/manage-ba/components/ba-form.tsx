"use client";

import * as z from "zod";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Eye, EyeOff, Check, ChevronsUpDown } from "lucide-react";
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
import { useCountries, useLanguages } from "@/utils/apis";
import { createBa, updateBa } from "@/utils/mutations";
import toast from "react-hot-toast";
import { CbRateCardSection } from "./rate-card";

// ── Types for CB Rate Card entries ──

export type RateCardEntry = {
  initial: string;
  annual: string;
  recertification: string;
  startDate: string;
  status: string;
};

export type StandardEntry = {
  name: string;
  code: string;
  version: number;
  status: string;
  rateCard: RateCardEntry[];
};

export type CbEntry = {
  cabCode: string;
  cbCode: string;
  abCode: string;
  status: string;
  standards: StandardEntry[];
};

// ── Zod schema (without cab — managed via useState) ──

const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postal_code: z.string().min(1, "Postal code is required"),
});

const baSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  contact_name: z.string().min(1, "Contact name is required"),
  registration_authority: z
    .string()
    .min(1, "Registration authority is required"),
  registration_number: z.string().min(1, "Registration number is required"),
  registration_date: z.string().min(1, "Registration date is required"),
  address: addressSchema,
  currency: z.string().min(1, "Currency is required"),
  gst: z.string().min(1, "GST is required"),
  certificateLanguage: z.string().min(1, "Certificate language is required"),
  otherCertificateLanguage: z.string(),
  website: z.string().optional(),
  status: z.string().optional(),
});

const createBaSchema = baSchema.refine(
  (data) => data.password && data.password.length >= 6,
  { message: "Password must be at least 6 characters", path: ["password"] },
);

const editBaSchema = baSchema.refine(
  (data) => !data.password || data.password.length >= 6,
  { message: "Password must be at least 6 characters", path: ["password"] },
);

export type BaFormValues = z.infer<typeof baSchema>;

// ── Validate CB entries before submit ──

function validateCbEntries(entries: CbEntry[]): string | null {
  for (let i = 0; i < entries.length; i++) {
    const cb = entries[i]!;
    if (!cb.cabCode) {
      return `Rate Card #${i + 1}: Please select a CAB`;
    }
    if (cb.standards.length === 0) {
      return `Rate Card #${i + 1}: Please add at least one standard`;
    }
    for (let j = 0; j < cb.standards.length; j++) {
      const std = cb.standards[j]!;
      const rc = std.rateCard[0];
      if (!rc) {
        return `Rate Card #${i + 1}, ${std.code}: Rate card is missing`;
      }
      if (!rc.initial || rc.initial.trim() === "" || Number(rc.initial) < 0) {
        return `Rate Card #${i + 1}, ${std.code}: Initial fee must be a non-negative number`;
      }
      if (!rc.annual || rc.annual.trim() === "" || Number(rc.annual) < 0) {
        return `Rate Card #${i + 1}, ${std.code}: Annual fee must be a non-negative number`;
      }
      if (
        !rc.recertification ||
        rc.recertification.trim() === "" ||
        Number(rc.recertification) < 0
      ) {
        return `Rate Card #${i + 1}, ${std.code}: 3 Year Fee must be a non-negative number`;
      }
      if (!rc.startDate) {
        return `Rate Card #${i + 1}, ${std.code}: Start date is required`;
      }
    }
  }
  return null;
}

// ── CB Rate Card Section Component ──

export function StandardsMultiSelect({
  availableStandards,
  selectedCodes,
  onToggle,
}: {
  availableStandards: any[];
  selectedCodes: string[];
  onToggle: (standard: any) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedItems = availableStandards.filter((s: any) =>
    selectedCodes.includes(s.mssCode),
  );

  return (
    <div ref={ref} className="relative mt-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs cursor-pointer hover:bg-accent"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedItems.length === 0 && (
            <span className="text-muted-foreground">Select standards...</span>
          )}
          {selectedItems.map((item: any) => (
            <span
              key={item._id}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium"
            >
              {item.mssCode} {item.standardCode}:{item.version}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggle(item);
                }}
              />
            </span>
          ))}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
          {availableStandards.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No standards available
            </div>
          ) : (
            availableStandards.map((item: any) => (
              <button
                key={item._id}
                type="button"
                onClick={() => onToggle(item)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer"
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  {selectedCodes.includes(item.mssCode) && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className="font-mono text-xs">{item.mssCode}</span>
                <span>
                  {item.standardCode}:{item.version}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ──+++++++++++++++++++++++++++ Main Form +++++++++++++++++++++++++++──
export function BaForm({
  onSuccess,
  defaultValues,
  mode = "create",
  baId,
  defaultCab,
}: {
  onSuccess?: () => void;
  defaultValues?: Partial<BaFormValues>;
  mode?: "create" | "edit";
  baId?: string;
  defaultCab?: CbEntry[];
}) {
  const [cbEntries, setCbEntries] = useState<CbEntry[]>(defaultCab || []);
  const [cbError, setCbError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { countries, isLoading: countriesLoading } = useCountries();
  const { languages } = useLanguages();

  const form = useForm<BaFormValues>({
    resolver: zodResolver(mode === "edit" ? editBaSchema : createBaSchema),
    defaultValues: defaultValues || {
      username: "",
      email: "",
      password: "",
      phone: "",
      contact_name: "",
      registration_authority: "",
      registration_number: "",
      registration_date: "",
      address: {
        street: "",
        city: "",
        state: "",
        country: "",
        postal_code: "",
      },
      currency: "",
      gst: "",
      certificateLanguage: "",
      otherCertificateLanguage: "",
      website: "",
      status: "active",
    },
  });

  async function onSubmit(data: BaFormValues) {
    // Validate CB entries
    if (cbEntries.length > 0) {
      const validationError = validateCbEntries(cbEntries);
      if (validationError) {
        setCbError(validationError);
        return;
      }
    }
    setCbError(null);

    try {
      // Strip DB-only fields (_id, createdAt, updatedAt) from cab sub-documents
      const cleanedCab = cbEntries.map(
        ({ cabCode, cbCode, abCode, status, standards }) => ({
          cabCode,
          cbCode,
          abCode,
          status,
          standards: standards.map(
            ({ name, code, version, status: sStatus, rateCard }) => ({
              name,
              code,
              version,
              status: sStatus,
              rateCard: rateCard.map(
                ({
                  initial,
                  annual,
                  recertification,
                  startDate,
                  status: rStatus,
                }) => ({
                  initial,
                  annual,
                  recertification,
                  startDate,
                  status: rStatus,
                }),
              ),
            }),
          ),
        }),
      );
      const payload: any = { ...data, cab: cleanedCab };
      if (mode === "edit" && !payload.password) {
        delete payload.password;
      }

      if (mode === "edit" && baId) {
        const res = await updateBa(baId, payload);
        if (res.ok) {
          toast.success("BA updated successfully", { id: "ba-form" });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to update BA", { id: "ba-form" });
        }
      } else {
        const res = await createBa(payload);
        if (res.ok) {
          toast.success("BA created successfully", { id: "ba-form" });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to create BA", { id: "ba-form" });
        }
      }
    } catch (error) {
      console.error("Failed to save BA", error);
      toast.error("Failed to save BA", { id: "ba-form" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Account Details */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Account Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Username <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. john_doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password
                    {mode === "edit" ? (
                      " (leave blank to keep)"
                    ) : (
                      <span className="text-destructive"> *</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Phone <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="+91 9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {mode === "edit" && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>

        {/* Registration Details */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Registration Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Contact Name <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Contact person name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registration_authority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Registration Authority{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. MCA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registration_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Registration Number{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Registration number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registration_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Registration Date{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="currency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Currency <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="INR">INR</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gst"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    GST <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select GST" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Applicable">Applicable</SelectItem>
                      <SelectItem value="Not Applicable">
                        Not Applicable
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="certificateLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Certificate Language{" "}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <FormField
              control={form.control}
              name="otherCertificateLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Other Certificate Language</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
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
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Address
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Street <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Street address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    City <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    State <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="State" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address.country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Country <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={countriesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            countriesLoading ? "Loading..." : "Select country"
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
              name="address.postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Postal Code <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Postal code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/*++++++++++++++++++++++++++++++++++++ CB Rate Cards ++++++++++++++++++++++++++++++++++++*/}
        <CbRateCardSection
          cbEntries={cbEntries}
          onChange={setCbEntries}
          error={cbError}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update BA"
              : "Create BA"}
        </Button>
      </form>
    </Form>
  );
}
