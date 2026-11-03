import { scenarios } from "@/data/scenarios";
import {
  completeChat,
  getActiveAIProvider,
  isAIEnabled,
  isRetryableAIError,
  streamChat,
} from "@/lib/ai-client";
import { getKnowledgeBase } from "@/lib/knowledge";
import { getLanguageInstruction, type Language } from "@/lib/languages";
import { detectScenarioFromQuery, type ChatResponse } from "@/lib/legal-engine";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export { isAIEnabled, getActiveAIProvider };

const DISCLAIMER =
  "This is general legal information, not formal legal advice. Laws vary by state and change over time. For your specific situation, consult a qualified advocate.";

const SYSTEM_PROMPT = `You are LegalAID, an Indian legal information assistant.
Help ordinary citizens understand their rights in plain Hindi-English (Hinglish is welcome).

Cover: IPC, CrPC, Motor Vehicles Act, Consumer Protection Act 2019,
RTI Act, Rent Control Acts, Labour Laws, Domestic Violence Act.

How to answer EVERY question — use plain, easy language (as if explaining to a friend with no legal background).
Always use these section headings in THIS order:

**1. Related Laws (Simple Explanation)**
Start here. Name the relevant Acts and sections (e.g. "Section 129, MV Act, 1988"; "Section 154, CrPC").
Explain what each law means in everyday words and how it applies to the user's situation — avoid jargon, or define it immediately.

**2. Offences & Penalties**
State clearly whether this involves an offence, violation, or civil wrong.
Explain what actions are illegal or punishable, typical fines (use ₹, 2024–25 amounts where known), and possible punishments — in simple terms.

**3. Solution — What You Can Do**
Numbered, practical steps: what to do right now, who to contact, what to say to police/officers, what to collect, where to go, and reasonable timelines.

Then add these sections when they help (keep them brief):

**Your Rights** — bullet list of key rights in plain language.

**Documents You Need** — what to carry or collect.

**Warnings — Avoid These Mistakes** — broker scams, bribes, signing unknown papers, common traps in India.

**When To Get A Lawyer** — recommend DLSA/NALSA (15100) or a qualified advocate when needed; state urgency clearly.

FORMATTING (mandatory — replies must look neat in chat):
- Each section title on its own line in **bold**, with one blank line before and after the title.
- Under each section, use bullet points only (start each line with "• ") — one clear idea per bullet, max 1–2 short sentences.
- In "Solution — What You Can Do", use numbered steps (1., 2., 3.); add a blank line between each step; optional sub-details as indented bullets on the next line starting with "  • ".
- Never write long paragraphs or walls of text — if you have more than two sentences, split into separate bullets.
- Do not use markdown tables, headers (#), or code blocks.
- Keep language simple; avoid legalese unless you immediately explain it in plain words.

Rules:
- NEVER skip or reorder the first three sections: laws → offences → solution.
- Be THOROUGH — aim for 450–700 words, but always as spaced, point-wise bullets — not dense blocks.
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

const FALLBACK_MESSAGE =
  "I'm sorry, I couldn't generate a response. Please try again or browse our situation guides.";

export async function generateAIResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ content: string; meta: Omit<ChatResponse, "message"> }> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  const content = await completeChat(messages, {
    systemPrompt: buildSystemPrompt(language),
    temperature: 0.4,
    maxTokens: 2048,
  });

  return {
    content: content || FALLBACK_MESSAGE,
    meta: buildResponseMeta(lastUserMessage),
  };
}

export async function streamAIResponse(
  messages: ChatMessage[],
  language: Language = "english"
): Promise<{ stream: ReadableStream<Uint8Array>; meta: Omit<ChatResponse, "message"> }> {
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
  const meta = buildResponseMeta(lastUserMessage);

  const stream = await streamChat(messages, {
    systemPrompt: buildSystemPrompt(language),
    temperature: 0.4,
    maxTokens: 2048,
  });

  return { stream, meta };
}

export function isTransientAIError(error: unknown): boolean {
  return isRetryableAIError(error);
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
