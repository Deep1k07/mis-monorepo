"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useAllCabsList, useStandards } from "@/utils/apis";
import { createStandard, updateStandard } from "@/utils/mutations";
import toast from "react-hot-toast";

const standardSchema = z.object({
  mssCode: z
    .string()
    .min(3, "Must be 3 characters")
    .max(3, "Must be 3 characters")
    .toUpperCase(),
  schemeName: z.string().min(1, "Scheme Name is required"),
  standardCode: z
    .string()
    .regex(
      /^ISO(\/IEC)? \d{4,5}$/,
      "Must be in format 'ISO YYYYY' (e.g., ISO 2019,14001)",
    ),
  version: z.string().min(1, "Version is required"),
  certificationBodies: z
    .array(z.string())
    .min(1, "At least one Certification Body is required"),
  predecessor: z.string().optional(),
  status: z.string().optional(),
});

export type StandardFormValues = z.infer<typeof standardSchema>;

export function StandardForm({
  onSuccess,
  defaultValues,
  mode = "create",
  standardId,
}: {
  onSuccess?: () => void;
  defaultValues?: Partial<StandardFormValues>;
  mode?: "create" | "edit";
  standardId?: string;
}) {
  const { cabs, isLoading: loadingCabs } = useAllCabsList();

  const form = useForm<StandardFormValues>({
    resolver: zodResolver(standardSchema),
    defaultValues: defaultValues || {
      mssCode: "",
      schemeName: "",
      standardCode: "",
      version: "",
      certificationBodies: [],
      predecessor: "",
      status: "active",
    },
  });

  const selectedCabs = form.watch("certificationBodies");
  // Fetch standards for predecessor options (first selected CAB or all)
  const { data: cabStandards } = useStandards(1, selectedCabs?.[0] || "", "");

  async function onSubmit(data: StandardFormValues) {
    const payload = {
      ...data,
      predecessor:
        data.predecessor && data.predecessor !== "none"
          ? data.predecessor
          : undefined,
    };
    try {
      if (mode === "edit" && standardId) {
        const res = await updateStandard(standardId, payload);
        if (res.ok) {
          toast.success("Standard updated successfully", {
            id: "standard-form",
          });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to update standard", {
            id: "standard-form",
          });
        }
      } else {
        const res = await createStandard(payload);
        if (res.ok) {
          toast.success("Standard created successfully", {
            id: "standard-form",
          });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to create standard", {
            id: "standard-form",
          });
        }
      }
    } catch (error) {
      console.error("Failed to save standard", error);
      toast.error("Failed to save standard", { id: "standard-form" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="certificationBodies"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Certification Bodies</FormLabel>
                {loadingCabs ? (
                  <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg max-h-48 overflow-y-auto">
                    {cabs?.map((cab: any) => {
                      const isChecked = field.value?.includes(cab._id);
                      return (
                        <label
                          key={cab._id}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-muted/50"
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              field.onChange(
                                checked
                                  ? [...current, cab._id]
                                  : current.filter(
                                      (id: string) => id !== cab._id,
                                    ),
                              );
                            }}
                          />
                          <span className="text-sm">
                            {cab.cabCode} - {cab.cbName}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mssCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MSS Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. QMS"
                    {...field}
                    className="uppercase"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="standardCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standard Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. ISO 9001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schemeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Scheme Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Quality Management System"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="version"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Version</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 2015" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="predecessor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Predecessor{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedCabs?.length}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedCabs?.length
                            ? "Select predecessor"
                            : "Select CAB first"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {cabStandards
                      ?.filter((s: any) => s._id !== standardId)
                      .map((s: any) => (
                        <SelectItem key={s._id} value={s._id}>
                          {s.standardCode} (v{s.version || "?"}) — {s.status}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
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
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Standard"
              : "Create Standard"}
        </Button>
      </form>
    </Form>
  );
}
