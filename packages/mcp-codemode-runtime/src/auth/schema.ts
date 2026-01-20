import { z } from "zod";

export const bearerAuthSchema = z.object({
  type: z.literal("bearer"),
  // Token value - can be process.env.VAR_NAME (in TS) or "${VAR_NAME}" (in JSON, resolved)
  token: z.string().min(1),
  // Env var name for stdio transports - required when passing token to child process
  tokenName: z.string().min(1).optional(),
});

export const authConfigSchema = z
  .discriminatedUnion("type", [
    bearerAuthSchema,
    z.object({ type: z.literal("none") }),
  ])
  .optional();

export type AuthConfig = z.infer<typeof authConfigSchema>;
