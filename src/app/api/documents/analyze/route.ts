import { NextRequest } from "next/server";
import { analyzeDocument, formatDocumentAIError, isAIEnabled } from "@/lib/document-tools";
import { getActiveAIProvider, isDocumentAIEnabled } from "@/lib/ai-client";
import type { DocumentCategory } from "@/data/document-types";

const MAX_TEXT_LENGTH = 50000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, category = "other" } = body as {
      text?: string;
      category?: DocumentCategory;
    };

    if (!text?.trim()) {
      return Response.json({ error: "Document text is required" }, { status: 400 });
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return Response.json(
        { error: `Document text exceeds ${MAX_TEXT_LENGTH.toLocaleString()} character limit` },
        { status: 400 }
      );
    }

    const analysis = await analyzeDocument(text.trim(), category);
    return Response.json(analysis);
  } catch (error) {
    console.error("Document analyze error:", error);
    const { message, retryable } = formatDocumentAIError(error);
    return Response.json({ error: message, retryable }, { status: retryable ? 503 : 500 });
  }
}

export async function GET() {
  return Response.json({
    aiEnabled: isDocumentAIEnabled(),
    aiProvider: getActiveAIProvider(),
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY?.trim()),
    aiPowered: isAIEnabled(),
  });
}
