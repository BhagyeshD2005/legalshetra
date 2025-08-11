'use server';

/**
 * @fileOverview This file contains a Genkit flow that allows a user to have a conversation
 * with an AI about a previously generated legal report.
 *
 * - chatWithReport - A function that handles the conversational chat.
 * - ChatWithReportInput - The input type for the function.
 * - ChatWithReportOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { ChatMessage, ChatMessageSchema } from '@/ai/types';

const ChatWithReportInputSchema = z.object({
  report: z.string().describe('The full text of the legal report being discussed.'),
  history: z.array(ChatMessageSchema).describe('The history of the conversation so far.'),
  question: z.string().describe('The latest question from the user.'),
});
export type ChatWithReportInput = z.infer<typeof ChatWithReportInputSchema>;

const ChatWithReportOutputSchema = z.object({
  answer: z.string().describe('The AI model\'s answer to the user\'s question.'),
});
export type ChatWithReportOutput = z.infer<typeof ChatWithReportOutputSchema>;

export async function chatWithReport(
  input: ChatWithReportInput
): Promise<ChatWithReportOutput> {
  return chatWithReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithReportPrompt',
  input: {schema: ChatWithReportInputSchema},
  output: {schema: ChatWithReportOutputSchema},
  prompt: `You are a helpful legal AI assistant. Your role is to answer questions based *only* on the content of the legal report provided below. Do not use any external knowledge or make assumptions beyond what is written in the report.

If the answer cannot be found within the report, you must state that the information is not available in the document.

**Legal Report Context:**
---
{{{report}}}
---

**Conversation History:**
{{#each history}}
**{{role}}**: {{{content}}}
{{/each}}

**User's new question:**
{{{question}}}

Based on the report and conversation history, what is the answer to the user's new question?`,
});

const chatWithReportFlow = ai.defineFlow(
  {
    name: 'chatWithReportFlow',
    inputSchema: ChatWithReportInputSchema,
    outputSchema: ChatWithReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
