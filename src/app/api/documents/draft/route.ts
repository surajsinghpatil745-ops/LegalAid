import { NextRequest } from "next/server";
import { generateDraft, formatDocumentAIError, isAIEnabled } from "@/lib/document-tools";
import type { DraftType } from "@/data/document-types";
import { draftTypes } from "@/data/document-types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftType, formData } = body as {
      draftType?: DraftType;
      formData?: Record<string, string>;
    };

    if (!draftType || !draftTypes.some((d) => d.id === draftType)) {
      return Response.json({ error: "Valid draft type is required" }, { status: 400 });
    }

    const draftConfig = draftTypes.find((d) => d.id === draftType)!;
    const data = formData ?? {};

    const missing = draftConfig.fields
      .filter((f) => f.required && !data[f.id]?.trim())
      .map((f) => f.label);

    if (missing.length > 0) {
      return Response.json(
        { error: `Required fields missing: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await generateDraft(draftType, data);
    return Response.json({ ...result, aiPowered: isAIEnabled() });
  } catch (error) {
    console.error("Document draft error:", error);
    const { message, retryable } = formatDocumentAIError(error);
    return Response.json({ error: message, retryable }, { status: retryable ? 503 : 500 });
  }
}

export async function GET() {
  return Response.json({ aiEnabled: isAIEnabled() });
}
