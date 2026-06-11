import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { scenarios } from "@/data/scenarios";
import { getKnowledgeBase } from "@/lib/knowledge";
import { getLanguageInstruction, type Language } from "@/lib/languages";
import { detectScenarioFromQuery, type ChatResponse } from "@/lib/legal-engine";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type AIProvider = "gemini" | "openai";

const DISCLAIMER =
  "This is general legal information, not formal legal advice. Laws vary by state and change over time. For your specific situation, consult a qualified advocate.";

const SYSTEM_PROMPT = `You are LegalAID, an Indian legal information assistant.
Help ordinary citizens understand their rights in plain Hindi-English (Hinglish is welcome).

Cover: IPC, CrPC, Motor Vehicles Act, Consumer Protection Act 2019,
RTI Act, Rent Control Acts, Labour Laws, Domestic Violence Act.

How to answer EVERY question (use these section headings):

**Short Answer**
Give a direct, clear answer in 2-3 sentences — what the law says and what the person should do RIGHT NOW.

**Legal Basis**
Cite specific sections (e.g. "Section 129, MV Act, 1988"; "Section 154, CrPC").
Explain what each section means in plain language and how it applies to this situation.

**Step-by-Step — What To Do**
Numbered, actionable steps: what to say to police/officers, what to collect, where to go, timelines.

**Fines & Punishments**
Use ₹ and mention current 2024-25 amounts. List all applicable penalties.

**Documents You Need**
List every document the person should carry or collect.

**Warnings — Avoid These Mistakes**
Broker/middleman scams, bribes, signing unknown papers, common traps in India.

**When To Get A Lawyer**
For serious matters recommend DLSA/NALSA (15100) or a qualified advocate. State urgency clearly.

Rules:
- Be THOROUGH — aim for 450–700 words. Citizens need real detail, not one-line answers.
- Never give advice that could get someone in trouble.
- General legal information only — not formal legal advice.
- If the user asks a follow-up, build on prior context and go deeper.`;

function buildSystemPrompt(language: Language = "english"): string {
  const scenarioSummaries = scenarios
    .map((s) => `- ${s.title} (${s.category}): ${s.shortDescription}`)
    .join("\n");

  return `${SYSTEM_PROMPT}

${getLanguageInstruction(language)}

LEGAL KNOWLEDGE BASE (use this as your primary reference):
${getKnowledgeBase()}

KNOWN SCENARIO GUIDES (reference when relevant):
${scenarioSummaries}

HELPLINES (mention when relevant):
- DLSA / Free Legal Aid: 15100
- Police: 100
- Women Helpline: 1091
- Cyber Crime: 1930
- National Consumer Helpline: 1800-11-4000`;
}

function getAIProvider(): AIProvider | null {
  const explicit = process.env.AI_PROVIDER?.toLowerCase();
  if (explicit === "gemini" || explicit === "openai") {
    return explicit;
  }
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

function getGeminiModel(language: Language = "english") {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    systemInstruction: buildSystemPrompt(language),
  });
}

export function isAIEnabled(): boolean {
  const provider = getAIProvider();
  if (!provider) return false;
  return provider === "gemini"
    ? Boolean(process.env.GEMINI_API_KEY)
    : Boolean(process.env.OPENAI_API_KEY);
}

export function getActiveAIProvider(): AIProvider | null {
  return isAIEnabled() ? getAIProvider() : null;
}

function buildResponseMeta(lastUserMessage: string): Omit<ChatResponse, "message"> {
  const detected = detectScenarioFromQuery(lastUserMessage);
  return {
    confidence: detected ? "high" : "medium",
    relatedScenario: detected?.slug,
    suggestLawyer: detected ? detected.urgency === "high" : shouldSuggestLawyer(lastUserMessage),
    suggestedCategories: detected ? [detected.category] : [],
    disclaimer: DISCLAIMER,
  };
}

async function generateGeminiResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ content: string; meta: Omit<ChatResponse, "message"> }> {
  const model = getGeminiModel(language);
  if (!model) {
    throw new Error("Gemini API key not configured");
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });

  const content =
    result.response.text() ||
    "I'm sorry, I couldn't generate a response. Please try again or browse our situation guides.";

  return { content, meta: buildResponseMeta(lastUserMessage) };
}

async function generateOpenAIResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ content: string; meta: Omit<ChatResponse, "message"> }> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI API key not configured");
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "system", content: buildSystemPrompt(language) }, ...messages],
    temperature: 0.4,
    max_tokens: 2048,
  });

  const content =
    completion.choices[0]?.message?.content ??
    "I'm sorry, I couldn't generate a response. Please try again or browse our situation guides.";

  return { content, meta: buildResponseMeta(lastUserMessage) };
}

export async function generateAIResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ content: string; meta: Omit<ChatResponse, "message"> }> {
  const provider = getAIProvider();
  if (provider === "gemini") return generateGeminiResponse(messages, language);
  if (provider === "openai") return generateOpenAIResponse(messages, language);
  throw new Error("No AI provider configured");
}

async function streamGeminiResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ stream: ReadableStream<Uint8Array>; meta: Omit<ChatResponse, "message"> }> {
  const model = getGeminiModel(language);
  if (!model) {
    throw new Error("Gemini API key not configured");
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const meta = buildResponseMeta(lastUserMessage);

  const contents = messages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const geminiStream = await model.generateContentStream({
    contents,
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 2048,
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of geminiStream.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return { stream, meta };
}

async function streamOpenAIResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ stream: ReadableStream<Uint8Array>; meta: Omit<ChatResponse, "message"> }> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI API key not configured");
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const meta = buildResponseMeta(lastUserMessage);

  const openaiStream = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    messages: [{ role: "system", content: buildSystemPrompt(language) }, ...messages],
    temperature: 0.4,
    max_tokens: 2048,
    stream: true,
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of openaiStream) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return { stream, meta };
}

export async function streamAIResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ stream: ReadableStream<Uint8Array>; meta: Omit<ChatResponse, "message"> }> {
  const provider = getAIProvider();
  if (provider === "gemini") return streamGeminiResponse(messages, language);
  if (provider === "openai") return streamOpenAIResponse(messages, language);
  throw new Error("No AI provider configured");
}

function shouldSuggestLawyer(query: string): boolean {
  const lower = query.toLowerCase();
  return (
    lower.includes("court") ||
    lower.includes("arrest") ||
    lower.includes("fir") ||
    lower.includes("bail") ||
    lower.includes("murder") ||
    lower.includes("rape") ||
    lower.includes("divorce") ||
    lower.includes("property dispute")
  );
}
