import { z } from 'zod';

/**
 * 1. listCommentaryQuerySchema
 * Validates query parameters. Coerces strings to numbers.
 */
export const listCommentaryQuerySchema = z.object({
  limit: z.coerce
    .number()
    .positive()
    .max(100)
    .optional(),
});

/**
 * 2. createCommentarySchema
 * Validates the request body for creating a new commentary entry.
 */
export const createCommentarySchema = z.object({
  minutes: z.number().int().nonnegative(),
  sequence: z.number().int().optional(),
  period: z.string().optional(),
  eventType: z.string().optional(),
  actor: z.string().optional(),
  team: z.string().optional(),
  message: z.string().min(1).optional(), // Ensures string isn't empty
  metadata: z.record(z.string(), z.any()).optional(), // Map/Object validation
  tags: z.array(z.string()).optional(),
});


