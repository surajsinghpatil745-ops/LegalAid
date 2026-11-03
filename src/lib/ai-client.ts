import OpenAI from "openai";

export type AIProvider = "openai";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

const RETRYABLE_PATTERNS = [
  "503",
  "429",
  "500",
  "502",
  "504",
  "temporarily unavailable",
  "Service Unavailable",
  "rate limit",
  "quota",
];

export class AIUnavailableError extends Error {
  retryable: boolean;

  constructor(message: string, retryable: boolean) {
    super(message);
    this.name = "AIUnavailableError";
    this.retryable = retryable;
  }
}

function getOpenAIApiKey(): string | null {
  const key = process.env.OPENAI_API_KEY?.trim();
  return key || null;
}

export function getAIProvider(): AIProvider | null {
  return getOpenAIApiKey() ? "openai" : null;
}

export function getAvailableProviders(): AIProvider[] {
  return getOpenAIApiKey() ? ["openai"] : [];
}

export function isAIEnabled(): boolean {
  return Boolean(getOpenAIApiKey());
}

export function getActiveAIProvider(): AIProvider | null {
  return getAIProvider();
}

export function isDocumentAIEnabled(): boolean {
  return Boolean(getOpenAIApiKey());
}

function usesOpenRouter(): boolean {
  const key = getOpenAIApiKey();
  const base = process.env.OPENAI_BASE_URL?.trim();
  return Boolean(base?.includes("openrouter.ai") || key?.startsWith("sk-or-"));
}

function getOpenAIBaseURL(): string | undefined {
  const explicit = process.env.OPENAI_BASE_URL?.trim();
  if (explicit) return explicit;
  if (getOpenAIApiKey()?.startsWith("sk-or-")) {
    return "https://openrouter.ai/api/v1";
  }
  return undefined;
}

function getChatModel(): string {
  const configured = process.env.OPENAI_MODEL?.trim();
  if (configured) return configured;
  return usesOpenRouter() ? "openai/gpt-4o-mini" : "gpt-4o-mini";
}

function getDocumentModel(): string {
  return process.env.OPENAI_DOCUMENT_MODEL?.trim() || getChatModel();
}

function getOpenAIClient(): OpenAI {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) throw new Error("OpenAI API key not configured");

  const baseURL = getOpenAIBaseURL();
  return new OpenAI({
    apiKey,
    ...(baseURL ? { baseURL } : {}),
    ...(baseURL?.includes("openrouter")
      ? {
          defaultHeaders: {
            "HTTP-Referer": process.env.OPENROUTER_SITE_URL?.trim() || "http://localhost:3000",
            "X-Title": process.env.OPENROUTER_APP_NAME?.trim() || "LegalAID",
          },
        }
      : {}),
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRetryableAIError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return RETRYABLE_PATTERNS.some((pattern) =>
    msg.toLowerCase().includes(pattern.toLowerCase())
  );
}

export function formatAIError(
  error: unknown,
  context: "document" | "chat" = "document"
): { message: string; retryable: boolean } {
  if (error instanceof AIUnavailableError) {
    return { message: error.message, retryable: error.retryable };
  }

  const raw = error instanceof Error ? error.message : String(error);

  if (raw.includes("quota") || raw.includes("insufficient_quota") || raw.includes("limit: 0")) {
    return {
      message:
        "OpenAI API quota is exhausted. Showing guided analysis instead. Check billing at platform.openai.com or try again later.",
      retryable: false,
    };
  }

  if (raw.includes("API key") || raw.includes("401") || raw.includes("403")) {
    return {
      message:
        "Invalid OpenAI API key. Check OPENAI_API_KEY in .env.local and restart the dev server.",
      retryable: false,
    };
  }

  if (isRetryableAIError(error)) {
    return {
      message:
        context === "chat"
          ? "OpenAI is temporarily busy. Please wait 30–60 seconds and try again."
          : "OpenAI is temporarily busy. Please wait a moment and click Analyze again.",
      retryable: true,
    };
  }

  if (raw.includes("Could not parse AI response")) {
    return {
      message: "The AI response was malformed. Please try again.",
      retryable: true,
    };
  }

  return {
    message:
      context === "chat"
        ? "AI chat failed. Please try again or browse our situation guides."
        : "Document analysis failed. Please try again or use Ask LegalAID for guidance.",
    retryable: false,
  };
}

async function withRetry<T>(fn: () => Promise<T>, label: string, maxAttempts = 3): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (!isRetryableAIError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
      const delayMs = 1000 * 2 ** attempt;
      console.warn(`${label} attempt ${attempt + 1} failed, retrying in ${delayMs}ms...`);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

interface CompletionOptions {
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

async function openaiCompleteText(
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  model: string
): Promise<string> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices[0]?.message?.content ?? "";
}

async function openaiCompleteChat(
  systemPrompt: string,
  messages: ChatTurn[],
  temperature: number,
  maxTokens: number
): Promise<string> {
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: getChatModel(),
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature,
    max_tokens: maxTokens,
  });

  return completion.choices[0]?.message?.content ?? "";
}

async function openaiStreamChat(
  systemPrompt: string,
  messages: ChatTurn[],
  temperature: number,
  maxTokens: number
): Promise<ReadableStream<Uint8Array>> {
  const client = getOpenAIClient();

  const openaiStream = await client.chat.completions.create({
    model: getChatModel(),
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    temperature,
    max_tokens: maxTokens,
    stream: true,
  });

  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of openaiStream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

function requireOpenAI(): void {
  if (!getOpenAIApiKey()) {
    throw new AIUnavailableError("No OpenAI API key configured", false);
  }
}

export async function completeText(
  userPrompt: string,
  options: CompletionOptions
): Promise<string> {
  requireOpenAI();
  const temperature = options.temperature ?? 0.3;
  const maxTokens = options.maxTokens ?? 4096;

  return withRetry(
    () =>
      openaiCompleteText(
        options.systemPrompt,
        userPrompt,
        temperature,
        maxTokens,
        getChatModel()
      ),
    "OpenAI text"
  );
}

export async function completeDocumentText(
  userPrompt: string,
  options: CompletionOptions
): Promise<string> {
  requireOpenAI();
  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 4096;

  return withRetry(
    () =>
      openaiCompleteText(
        options.systemPrompt,
        userPrompt,
        temperature,
        maxTokens,
        getDocumentModel()
      ),
    "OpenAI document"
  );
}

export async function completeChat(
  messages: ChatTurn[],
  options: CompletionOptions
): Promise<string> {
  requireOpenAI();
  const temperature = options.temperature ?? 0.4;
  const maxTokens = options.maxTokens ?? 2048;

  return withRetry(
    () => openaiCompleteChat(options.systemPrompt, messages, temperature, maxTokens),
    "OpenAI chat"
  );
}

export async function streamChat(
  messages: ChatTurn[],
  options: CompletionOptions
): Promise<ReadableStream<Uint8Array>> {
  requireOpenAI();
  const temperature = options.temperature ?? 0.4;
  const maxTokens = options.maxTokens ?? 2048;

  return withRetry(
    () => openaiStreamChat(options.systemPrompt, messages, temperature, maxTokens),
    "OpenAI stream"
  );
}
