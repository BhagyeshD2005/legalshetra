
/**
 * @fileOverview This file contains shared Zod schemas and TypeScript types
 * used across both client and server components for AI features.
 */

import {z} from 'genkit';

export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
