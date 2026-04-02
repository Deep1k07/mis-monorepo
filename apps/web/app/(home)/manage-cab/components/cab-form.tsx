"use client";

import * as z from "zod";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ChevronsUpDown, Check } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useAllStandardsList } from "@/utils/apis";
import { createCab, updateCab } from "@/utils/mutations";
import toast from "react-hot-toast";

const cabSchema = z.object({
  cabCode: z
    .string()
    .min(3, "Must be 3 characters")
    .max(3, "Must be 3 characters")
    .toUpperCase(),
  cbCode: z
    .string()
    .min(4, "Must be 4-5 characters")
    .max(5, "Must be 4-5 characters")
    .toUpperCase(),
  cbName: z.string().min(1, "CB Name is required"),
  abCode: z
    .string()
    .min(3, "Must be 3 characters")
    .max(3, "Must be 3 characters")
    .toUpperCase(),
  abName: z.string().min(1, "AB Name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.string().optional(),
  standards: z.array(z.string()).optional(),
});

export type CabFormValues = z.infer<typeof cabSchema>;

function MultiSelectStandards({
  value,
  onChange,
  options,
  loading,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  options: any[];
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectedItems = options.filter((o) => value.includes(o._id));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs cursor-pointer hover:bg-accent"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selectedItems.length === 0 && (
            <span className="text-muted-foreground">
              {loading ? "Loading..." : "Select standards..."}
            </span>
          )}
          {selectedItems.map((item) => (
            <span
              key={item._id}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium"
            >
              {item.mssCode} - {item.schemeName}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(item._id);
                }}
              />
            </span>
          ))}
        </div>
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No standards available
            </div>
          ) : (
            options.map((item) => (
              <button
                key={item._id}
                type="button"
                onClick={() => toggle(item._id)}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent cursor-pointer"
              >
                <div className="flex h-4 w-4 items-center justify-center">
                  {value.includes(item._id) && (
                    <Check className="h-3.5 w-3.5" />
                  )}
                </div>
                <span className="font-mono text-xs">{item.mssCode}</span>
                <span>
                  {item.schemeName} ({item.standardCode})
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function CabForm({
  onSuccess,
  defaultValues,
  mode = "create",
  cabId,
}: {
  onSuccess?: () => void;
  defaultValues?: Partial<CabFormValues>;
  mode?: "create" | "edit";
  cabId?: string;
}) {
  const { standards, isLoading: loadingStandards } = useAllStandardsList();

  const form = useForm<CabFormValues>({
    resolver: zodResolver(cabSchema),
    defaultValues: defaultValues || {
      cabCode: "",
      cbCode: "",
      cbName: "",
      abCode: "",
      abName: "",
      description: "",
      status: "active",
      standards: [],
    },
  });

  async function onSubmit(data: CabFormValues) {
    try {
      if (mode === "edit" && cabId) {
        const res = await updateCab(cabId, data);
        if (res.ok) {
          toast.success("CAB updated successfully", { id: "cab-form" });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to update CAB", {
            id: "cab-form",
          });
        }
      } else {
        const res = await createCab(data);
        if (res.ok) {
          toast.success("CAB created successfully", { id: "cab-form" });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to create CAB", {
            id: "cab-form",
          });
        }
      }
    } catch (error) {
      console.error("Failed to save CAB", error);
      toast.error("Failed to save CAB", { id: "cab-form" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cabCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CAB Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. ABC"
                    {...field}
                    disabled={mode === "edit"}
                    className="uppercase"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cbCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CB Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. ABCD"
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
            name="cbName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CB Name</FormLabel>
                <FormControl>
                  <Input placeholder="Certification Body Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="abCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AB Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. XYZ"
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
            name="abName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AB Name</FormLabel>
                <FormControl>
                  <Input placeholder="Accreditation Body Name" {...field} />
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
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Description of the certification body"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="standards"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Standards</FormLabel>
              <FormControl>
                <MultiSelectStandards
                  value={field.value || []}
                  onChange={field.onChange}
                  options={standards}
                  loading={loadingStandards}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update CAB"
              : "Create CAB"}
        </Button>
      </form>
    </Form>
  );
}
