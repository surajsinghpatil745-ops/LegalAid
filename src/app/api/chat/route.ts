import { NextRequest } from "next/server";
import {
  generateAIResponse,
  streamAIResponse,
  isAIEnabled,
  getActiveAIProvider,
  type ChatMessage,
} from "@/lib/chatbot";
import { processLegalQuery } from "@/lib/legal-engine";
import type { Language } from "@/lib/languages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, messages, stream: wantStream, language = "english" } = body as {
      message?: string;
      messages?: ChatMessage[];
      stream?: boolean;
      language?: Language;
    };

    const conversation: ChatMessage[] = messages?.length
      ? messages
      : message
        ? [{ role: "user", content: message }]
        : [];

    if (conversation.length === 0) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const lastMessage = conversation[conversation.length - 1];
    if (lastMessage.role !== "user" || !lastMessage.content.trim()) {
      return Response.json({ error: "Last message must be from user" }, { status: 400 });
    }

    // AI chatbot when API key is configured
    if (isAIEnabled()) {
      try {
        if (wantStream) {
          const { stream, meta } = await streamAIResponse(conversation, language);
          return new Response(stream, {
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
              "X-Chat-Meta": encodeURIComponent(JSON.stringify(meta)),
            },
          });
        }

        const { content, meta } = await generateAIResponse(conversation, language);
        return Response.json({ message: content, ...meta, aiPowered: true });
      } catch (aiError) {
        const provider = getActiveAIProvider() ?? "ai";
        console.error(`${provider} error, falling back to guided mode:`, aiError);
        const response = processLegalQuery(lastMessage.content);
        const quotaError =
          aiError instanceof Error &&
          (aiError.message.includes("quota") ||
            aiError.message.includes("429") ||
            aiError.message.includes("RESOURCE_EXHAUSTED"));
        return Response.json({
          ...response,
          aiPowered: false,
          aiError: quotaError
            ? "AI quota exceeded — check your API billing. Using guided mode for now."
            : "AI temporarily unavailable. Using guided mode.",
        });
      }
    }

    // Fallback: rule-based engine (single-turn)
    const response = processLegalQuery(lastMessage.content);
    return Response.json({ ...response, aiPowered: false });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json({ error: "Failed to process query" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ aiEnabled: isAIEnabled(), aiProvider: getActiveAIProvider() });
}
