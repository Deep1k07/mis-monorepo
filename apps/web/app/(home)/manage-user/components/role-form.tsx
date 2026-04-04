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
import { useAllPermissions, useAllRoles } from "@/utils/apis";
import { createRole, updateRole } from "@/utils/mutations";
import toast from "react-hot-toast";

const roleSchema = z.object({
  role: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
  status: z.string().optional(),
  reportingRole: z.string().optional(),
  cabCode: z.array(z.string()).optional(),
  region: z.array(z.string()).optional(),
  type: z.string().optional(),
});

export type RoleFormValues = z.infer<typeof roleSchema>;

function MultiSelectPermissions({
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
  const [search, setSearch] = useState("");
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
  const filteredOptions = search
    ? options.filter(
      (o) =>
        o.name.toLowerCase().includes(search.toLowerCase()) ||
        o.category?.toLowerCase().includes(search.toLowerCase()),
    )
    : options;

  // Group by category
  const grouped = filteredOptions.reduce(
    (acc: Record<string, any[]>, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat]!.push(item);
      return acc;
    },
    {},
  );

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
              {loading ? "Loading..." : "Select permissions..."}
            </span>
          )}
          {selectedItems.map((item) => (
            <span
              key={item._id}
              className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium"
            >
              {item.name}
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
          <div className="sticky top-0 bg-popover p-2 border-b">
            <input
              type="text"
              placeholder="Search permissions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            />
          </div>
          {Object.keys(grouped).length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No permissions available
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <div key={category}>
                <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                  {category}
                </div>
                {items.map((item: any) => (
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
                    <span className="font-mono text-xs">{item.name}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function RoleForm({
  onSuccess,
  defaultValues,
  mode = "create",
  roleId,
}: {
  onSuccess?: () => void;
  defaultValues?: Partial<RoleFormValues>;
  mode?: "create" | "edit";
  roleId?: string;
}) {
  const { permissions, isLoading: loadingPermissions } = useAllPermissions();
  const { roles } = useAllRoles();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: defaultValues || {
      role: "",
      description: "",
      permissions: [],
      status: "active",
      reportingRole: "",
      type: "custom",
    },
  });

  async function onSubmit(data: RoleFormValues) {
    try {
      if (mode === "edit" && roleId) {
        const res = await updateRole(roleId, data);
        if (res.ok) {
          toast.success("Role updated successfully", { id: "role-form" });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to update role", {
            id: "role-form",
          });
        }
      } else {
        const res = await createRole(data);
        if (res.ok) {
          toast.success("Role created successfully", { id: "role-form" });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to create role", {
            id: "role-form",
          });
        }
      }
    } catch (error) {
      console.error("Failed to save role", error);
      toast.error("Failed to save role", { id: "role-form" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. BA Manager" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reportingRole"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reporting Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reporting role">
                        {(value: string | null) =>
                          value
                            ? (roles.find((r: any) => r._id === value)
                              ?.role ?? value)
                            : "Select reporting role"
                        }
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((r: any) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.role}
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
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What is this role responsible for?"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="permissions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Permissions</FormLabel>
              <FormControl>
                <MultiSelectPermissions
                  value={field.value || []}
                  onChange={field.onChange}
                  options={permissions}
                  loading={loadingPermissions}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
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
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? "Saving..."
            : mode === "edit"
              ? "Update Role"
              : "Create Role"}
        </Button>
      </form>
    </Form>
  );
}
