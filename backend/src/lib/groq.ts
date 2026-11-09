// backend/src/lib/groq.ts: Client for Groq OpenAI-compatible Chat Completions API with zod validation

import { z } from 'zod';
import { FormSnapshot } from 'form-copilot-shared';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';
const TIMEOUT_MS = 30000;

function getApiKey(): string {
  const key = process.env.GROQ_API_KEY || process.env.GROQ_API;
  if (!key) {
    throw new Error('Groq API key is missing in environment variables');
  }
  return key;
}

// Trims snapshot to fit within token budget while preserving all required questions
export function trimSnapshot(snapshot: FormSnapshot, maxQuestions = 50): FormSnapshot {
  const trimmedPages = snapshot.pages.map((page) => {
    if (page.questions.length <= maxQuestions) {
      return page;
    }
    // Always keep required questions in full
    const required = page.questions.filter((q) => q.required);
    const optional = page.questions.filter((q) => !q.required);
    const keptOptional = optional.slice(0, Math.max(0, maxQuestions - required.length));
    const merged = [...required, ...keptOptional].sort((a, b) => {
      return page.questions.indexOf(a) - page.questions.indexOf(b);
    });
    return {
      ...page,
      questions: merged,
    };
  });

  return {
    ...snapshot,
    pages: trimmedPages,
  };
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

async function callGroqRaw(messages: ChatMessage[], timeoutMs = TIMEOUT_MS): Promise<string> {
  const apiKey = getApiKey();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
        temperature: 0.7,
        max_completion_tokens: 2048,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`Groq API request failed with status ${res.status}: ${errText}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('Groq API returned an empty completion');
    }

    return content;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Groq API request timed out after 30 seconds');
    }
    const message = err instanceof Error ? err.message : String(err);
    // Sanitize any key leakage
    const sanitized = message.replace(/gsk_[a-zA-Z0-9_-]+/g, '[REDACTED]');
    throw new Error(sanitized);
  } finally {
    clearTimeout(timer);
  }
}

// Calls Groq with strict JSON output requirement and validates against a Zod schema
// Retries once with a stricter reminder if Zod validation or JSON parsing fails
export async function callGroqStructured<T>(
  messages: ChatMessage[],
  schema: z.ZodSchema<T>
): Promise<T> {
  let rawResponse = '';
  try {
    rawResponse = await callGroqRaw(messages);
    const parsed = JSON.parse(rawResponse);
    return schema.parse(parsed);
  } catch (firstError) {
    // Retry once with stricter prompt instruction
    const retryMessages: ChatMessage[] = [
      ...messages,
      {
        role: 'assistant',
        content: rawResponse || '{}',
      },
      {
        role: 'user',
        content:
          'Your previous output did not match the required JSON structure. Output ONLY valid JSON matching the exact specified schema. Do not include markdown codeblocks or extra text.',
      },
    ];

    try {
      const retryResponse = await callGroqRaw(retryMessages);
      const retryParsed = JSON.parse(retryResponse);
      return schema.parse(retryParsed);
    } catch (secondError) {
      const msg = secondError instanceof Error ? secondError.message : String(secondError);
      throw new Error(`Failed to validate LLM response against schema: ${msg}`);
    }
  }
}
