import { z } from "zod";

export const bearerAuthSchema = z.object({
  type: z.literal("bearer"),
  tokenEnv: z.string().min(1),
});

export const authConfigSchema = z
  .discriminatedUnion("type", [
    bearerAuthSchema,
    z.object({ type: z.literal("none") }),
  ])
  .optional();

export type AuthConfig = z.infer<typeof authConfigSchema>;
