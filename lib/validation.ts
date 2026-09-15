import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const providerSearchParamsSchema = z.object({
  service: z.string().optional(),
  city: z.string().max(60).optional(),
  radiusKm: z.coerce.number().min(1).max(50).optional().default(10),
  verifiedOnly: z.coerce.boolean().optional().default(true),
  openNow: z.coerce.boolean().optional().default(false),
});

export const careNavigationInputSchema = z.object({
  prompt: z.string().trim().min(10).max(600),
  location: z.string().trim().max(100).optional(),
});

export const medicalSummaryInputSchema = z.object({
  animalName: z.string().trim().min(2).max(40),
  documentText: z.string().min(20).max(4000),
});

export const providerIdSchema = z.string().regex(/^[a-z0-9-]+$/i, "Invalid provider ID");
