import { z } from "zod";

const baseEntitySchema = z.object({
  entity_id: z.string().optional(),
});

const entitySchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("client"),
    direct_price: z
      .string()
      .min(1, { message: "Direct Price is required" })
      .refine(
        (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 1,
        { message: "Direct Price must be greater than 1" }
      ),
    business_associate: z.string().optional(),
  }),
  z.object({
    type: z.literal("bam"),
    direct_price: z.string().optional(),
    business_associate: z
      .string()
      .min(1, { message: "Business Associate is required for BAM" }),
  }),
]).and(baseEntitySchema);


const result = entitySchema.safeParse({ type: "client", direct_price: "" });
console.log(JSON.stringify(result, null, 2));

const result2 = entitySchema.safeParse({ type: "client", direct_price: "0" });
console.log(JSON.stringify(result2, null, 2));

const result3 = entitySchema.safeParse({ type: "client", direct_price: "10" });
console.log(JSON.stringify(result3, null, 2));
