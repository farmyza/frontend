import { z } from "zod";

export const AssistantRequestSchema = z.object({
  message: z.string().min(1),
  locale: z.enum(["en", "bn"]).default("en"),
  context: z.object({
    fieldOverview: z.any().optional(),
    diagnostics: z.any().optional(),
    recommendations: z.any().optional(),
  }),
});

export type AssistantRequest = z.infer<typeof AssistantRequestSchema>;

export const AssistantResponseSchema = z.object({
  replyEn: z.string(),
  replyBn: z.string(),
  suggestedFollowUps: z.array(z.string()),
  referencedFactors: z.array(z.string()),
});

export type AssistantResponse = z.infer<typeof AssistantResponseSchema>;