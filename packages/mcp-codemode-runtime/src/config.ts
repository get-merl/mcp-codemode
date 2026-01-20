import { z } from "zod";
import { authConfigSchema } from "./auth/schema.js";

const stdioTransportSchema = z
  .object({
    type: z.literal("stdio"),
    command: z.string().min(1),
    args: z.array(z.string()).optional(),
    env: z.record(z.string(), z.string()).optional(),
    auth: authConfigSchema,
  })
  .strict()
  .refine(
    (data) => {
      // If auth is bearer type, tokenName is required for stdio transports
      if (data.auth?.type === "bearer" && !data.auth.tokenName) {
        return false;
      }
      return true;
    },
    {
      message: "tokenName is required for stdio transports with bearer authentication",
      path: ["auth", "tokenName"],
    }
  );

const httpTransportSchema = z
  .object({
    type: z.literal("http"),
    url: z.string().url(),
    auth: authConfigSchema,
  })
  .strict();

export const codemodeServerConfigSchema = z
  .object({
    name: z.string().min(1), // Required: unique identifier for this server
    transport: z.union([stdioTransportSchema, httpTransportSchema]),
  })
  .strict();

const generationSchema = z
  .object({
    outDir: z.string().min(1),
    language: z.literal("ts"),
  })
  .strict();

const securitySchema = z
  .object({
    allowStdioExec: z.boolean(),
    envAllowlist: z.array(z.string().min(1)),
  })
  .strict();

const cliSchema = z
  .object({
    interactive: z.boolean().optional(),
  })
  .strict();

const clientSchema = z
  .object({
    name: z.string().optional(),
    version: z.string().optional(),
  })
  .strict();

export const compactionConfigSchema = z
  .object({
    enabled: z.boolean(),
    strategy: z.enum(["summarize", "truncate", "persist-to-file"]),
    thresholds: z
      .object({
        bytes: z.number().positive().optional(),
        tokens: z.number().positive().optional(),
      })
      .refine(
        (data) => data.bytes !== undefined || data.tokens !== undefined,
        { message: "At least one threshold (bytes or tokens) required" }
      ),
    persistDir: z.string().min(1).optional(),
    truncateLength: z.number().positive().optional(),
    summaryMaxLength: z.number().positive().optional(),
  })
  .strict();

export const codemodeConfigSchema = z
  .object({
    servers: z.array(codemodeServerConfigSchema),
    generation: generationSchema,
    security: securitySchema,
    cli: cliSchema.optional(),
    client: clientSchema.optional(),
    compaction: compactionConfigSchema.optional(),
  })
  .strict();

export type CodemodeServerConfig = z.infer<typeof codemodeServerConfigSchema>;
export type CodemodeConfig = z.infer<typeof codemodeConfigSchema>;
