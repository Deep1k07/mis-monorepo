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
import { Textarea } from "@/components/ui/textarea";
import { createCab, updateCab } from "@/utils/apis";
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
});

export type CabFormValues = z.infer<typeof cabSchema>;

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
          toast.error(err.message || "Failed to update CAB", { id: "cab-form" });
        }
      } else {
        const res = await createCab(data);
        if (res.ok) {
          toast.success("CAB created successfully", { id: "cab-form" });
          if (onSuccess) onSuccess();
        } else {
          const err = await res.json();
          toast.error(err.message || "Failed to create CAB", { id: "cab-form" });
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
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
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
