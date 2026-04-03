"use client";

import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useAllBa, useCountries } from "@/utils/apis";
import { createEntity, updateEntity } from "@/utils/mutations";
import toast from "react-hot-toast";

// Zod Schema
const mainSiteAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z
    .string()
    .length(3, "Must be 3-letter code (e.g. USA, IND)")
    .toUpperCase(),
  postal_code: z.string().optional(),
});

const additionalSiteAddressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z
    .string()
    .length(3, "Must be 3-letter code (e.g. USA, IND)")
    .toUpperCase(),
  postal_code: z.string().optional(),
});

const baseEntitySchema = z.object({
  entity_id: z.string().optional(),
  entity_name: z.string().min(1, { message: "Entity Name is required" }),
  entity_name_english: z
    .string()
    .min(1, { message: "English Name is required" }),
  entity_trading_name: z
    .string()
    .min(1, { message: "Trading Name is required" }),
  email: z.string().email({ message: "Invalid email" }),
  website: z.string().optional(),
  drive_link: z.string().optional(),
  main_site_address: z.array(mainSiteAddressSchema).min(1),
  additional_site_address: z.array(additionalSiteAddressSchema).optional(),
});

const entitySchema = z
  .discriminatedUnion("type", [
    z.object({
      type: z.literal("client"),
      direct_price: z
        .string()
        .min(1, { message: "Direct Price is required" })
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 1, {
          message: "Direct Price must be greater than 1",
        }),
      business_associate: z.string().optional(),
    }),
    z.object({
      type: z.literal("bam"),
      direct_price: z.string().optional(),
      business_associate: z
        .string()
        .min(1, { message: "Business Associate is required for BAM" }),
    }),
  ])
  .and(baseEntitySchema);

export type EntityFormValues = z.infer<typeof entitySchema>;

export function EntityForm({
  onSuccess,
  defaultValues,
  mode = "create",
  entityId,
}: {
  onSuccess?: () => void;
  defaultValues?: Partial<EntityFormValues>;
  mode?: "create" | "edit" | "view";
  entityId?: string;
}) {
  const disabled = mode === "view";
  const { bams, isLoading: loadingBAMs } = useAllBa();
  const { countries, isLoading: loadingCountries } = useCountries();

  const form = useForm<EntityFormValues>({
    resolver: zodResolver(entitySchema),
    defaultValues: defaultValues || {
      type: "client",
      entity_id: "",
      entity_name: "",
      entity_name_english: "",
      entity_trading_name: "",
      email: "",
      website: "",
      drive_link: "",
      direct_price: "",
      business_associate: "",
      main_site_address: [
        { street: "", city: "", state: "", country: "", postal_code: "" },
      ],
      additional_site_address: [],
    },
  });

  const {
    fields: additionalAddresses,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "additional_site_address",
  });

  const type = form.watch("type");

  async function onSubmit(data: EntityFormValues) {
    const { type: _type, business_associate, ...rest } = data;
    const mappedDto: any = {
      ...rest,
      isDirectClient: _type === "client",
      business_associate: _type === "bam" ? business_associate : null,
    };

    try {
      if (mode === "edit" && entityId) {
        const res = await updateEntity(entityId, mappedDto);
        if (res.ok) {
          toast.success("Entity updated successfully", { id: "entity-view" });
          if (onSuccess) onSuccess();
        }
      } else {
        const res = await createEntity(mappedDto);
        if (res.ok) {
          toast.success("Entity created successfully", { id: "entity-view" });
          if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      console.error("Failed to save entity", error);
      toast.error(
        mode === "edit" ? "Failed to update entity" : "Failed to create entity",
        { id: "entity-view" }
      );
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="overflow-y-auto max-h-[60vh] pr-4 space-y-6 pb-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-none">
              General Information
            </h3>
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Process Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col space-y-1"
                      disabled={disabled}
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="client" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Direct Client (Entity)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="bam" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Business Associate Managed (BAM)
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {type === "bam" && (
              <FormField
                control={form.control}
                name="business_associate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Business Associate</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingBAMs || disabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingBAMs
                                ? "Fetching..."
                                : "Select a business associate"
                            }
                          >
                            {bams?.find((b) => b._id === field.value)?.username}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {bams?.map((bam) => (
                          <SelectItem key={bam._id} value={bam._id}>
                            {bam.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              {mode !== "create" && (
                <FormField
                  control={form.control}
                  name="entity_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entity ID</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ENT-1001"
                          {...field}
                          disabled={true}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="entity_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entity Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Corporation"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entity_name_english"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>English Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme Corporation (EN)"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entity_trading_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trading Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Acme trading"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contact@acme.com"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://acme.com"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="drive_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Link (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://drive.google.com/..."
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {type === "client" && (
                <FormField
                  control={form.control}
                  name="direct_price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Direct Price</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. 500.00"
                          {...field}
                          disabled={disabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium leading-none">
              Main Site Address
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="main_site_address.0.street"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="123 Corporate Blvd"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="main_site_address.0.city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="New York"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="main_site_address.0.state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="NY" {...field} disabled={disabled} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="main_site_address.0.postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal Code (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="10001"
                        {...field}
                        disabled={disabled}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="main_site_address.0.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={loadingCountries || disabled}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              loadingCountries
                                ? "Fetching..."
                                : "Select Country"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {countries?.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium leading-none">
                Additional Site Addresses
              </h3>
              {!disabled && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      street: "",
                      city: "",
                      state: "",
                      country: "",
                      postal_code: "",
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Address
                </Button>
              )}
            </div>

            {additionalAddresses.map((field, index) => (
              <div
                key={field.id}
                className="p-4 border rounded-md relative space-y-4 mt-4"
              >
                {!disabled && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`additional_site_address.${index}.street`}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="123 Expansion Blvd"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`additional_site_address.${index}.city`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="New York"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`additional_site_address.${index}.state`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="NY"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`additional_site_address.${index}.postal_code`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="10001"
                            {...field}
                            disabled={disabled}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`additional_site_address.${index}.country`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={loadingCountries || disabled}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  loadingCountries
                                    ? "Fetching..."
                                    : "Select Country"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {countries?.map((country) => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {!disabled && (
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Entity"}
          </Button>
        )}
      </form>
    </Form>
  );
}
