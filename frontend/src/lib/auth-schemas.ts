import { z } from "zod";

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: z.string(),
  avatar: z.string(),
  district: z.string(),
  createdAt: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  expiresAt: z.string(),
  createdAt: z.string(),
});

export type Session = z.infer<typeof SessionSchema>;

export const OAuthStartResponseSchema = z.object({
  authUrl: z.string(),
  state: z.string().optional(),
});

export type OAuthStartResponse = z.infer<typeof OAuthStartResponseSchema>;

export const AuthMeResponseSchema = z.object({
  user: UserSchema,
  demo: z.boolean().optional(),
});

export type AuthMeResponse = z.infer<typeof AuthMeResponseSchema>;