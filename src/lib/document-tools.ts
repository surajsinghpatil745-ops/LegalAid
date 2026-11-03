import type { DocumentCategory, DraftType, RiskSeverity } from "@/data/document-types";
import { getDocumentCategoryLabel, getDraftTypeLabel } from "@/data/document-types";
import { completeDocumentText, isDocumentAIEnabled } from "@/lib/ai-client";
import { getGuidedDocumentAnalysis } from "@/lib/document-engine";
import { getKnowledgeBase } from "@/lib/knowledge";
import {
  appendLawsToDraft,
  formatLawsForGrounds,
  matchLawsFromProblem,
  problemTextFromForm,
  type MatchedLaw,
} from "@/lib/ipc-matcher";

export interface RiskClause {
  clause: string;
  reason: string;
  severity: RiskSeverity;
}

export interface DocumentAnalysis {
  summary: string;
  detectedType: string;
  keyPoints: string[];
  riskClauses: RiskClause[];
  suggestedActions: string[];
  measuresToTake?: string[];
  deadlines: string[];
  disclaimer: string;
}

export interface DraftResult {
  title: string;
  draft: string;
  instructions: string[];
  disclaimer: string;
  appliedLaws?: MatchedLaw[];
}

const DISCLAIMER =
  "This is general legal information, not formal legal advice. Have a qualified advocate review any document before signing.";

export { isDocumentAIEnabled as isAIEnabled };

export function formatDocumentAIError(error: unknown): { message: string; retryable: boolean } {
  const msg = error instanceof Error ? error.message : String(error);
  if (msg.includes("quota") || msg.includes("429")) {
    return { message: "Analysis could not be completed right now. Please try again shortly.", retryable: true };
  }
  return { message: "Analysis could not be completed. Please try again.", retryable: true };
}

function extractJson<T>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1].trim() : text.trim();

  try {
    return JSON.parse(raw) as T;
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1) {
      return JSON.parse(raw.slice(start, end + 1)) as T;
    }
    throw new Error("Could not parse AI response as JSON");
  }
}

const CATEGORY_GUIDANCE: Record<DocumentCategory, string> = {
  fir: `FIR-SPECIFIC ANALYSIS:
- Identify IPC/BNS sections, bailable vs non-bailable, cognizable vs non-cognizable
- Flag arrest risk and whether anticipatory bail (Section 438 CrPC) may be needed
- Note FIR number, police station, date/time, complainant, accused names
- Explain Section 154 CrPC rights (free copy of FIR, right to read before signing)
- Warn against absconding; suggest legal aid (DLSA 15100) for serious sections`,

  "legal-notice": `LEGAL NOTICE ANALYSIS:
- Identify sender, recipient, cause of action, amount claimed, deadline to respond
- Flag threatened actions (civil suit, criminal complaint u/s 138 NI Act, eviction)
- Check if deadline is reasonable (typically 15–30 days)
- Note if reply is required before court action; suggest drafting counter-notice if claims are false`,

  "rental-agreement": `RENTAL AGREEMENT ANALYSIS:
- Check deposit cap (many states: max 2–3 months), lock-in period, notice period
- Flag illegal clauses: immediate eviction without notice, waiver of tenant rights, excessive penalty
- Note rent escalation %, maintenance charges, subletting rules, registration requirement
- Reference state Rent Control Act where applicable; flag one-sided termination clauses`,

  "court-summons": `COURT SUMMONS ANALYSIS:
- Extract court name, case number, hearing date/time, parties, purpose (appearance/written statement)
- HIGH RISK: missing appearance can lead to ex-parte order, warrant, or dismissal
- List documents to carry; explain vakalatnama if advocate needed
- Note whether it's civil (written statement deadline) or criminal (bail/bond)`,

  other: `GENERAL LEGAL DOCUMENT ANALYSIS:
- Identify document type, parties, obligations, deadlines, and governing law
- Flag one-sided terms, penalties, waivers of legal rights, or vague language`,
};

function buildAnalyzeSystemPrompt(category: DocumentCategory): string {
  const categoryLabel = getDocumentCategoryLabel(category);

  return `You are LegalAID Document Analyzer for Indian citizens.
Return ONLY valid JSON. Write for ordinary citizens — no technical or AI language.

DOCUMENT TYPE: ${categoryLabel}
${CATEGORY_GUIDANCE[category]}

Return this JSON shape:
{
  "summary": "Case summary in 150-250 words: what this document is, who sent it, what it means for the reader, and urgency",
  "detectedType": "Document type in plain English",
  "keyPoints": ["5-8 facts: parties, dates, amounts, sections, obligations"],
  "riskClauses": [{ "clause": "quote", "reason": "plain explanation", "severity": "high|medium|low" }],
  "suggestedActions": ["What to do — 3-6 numbered actionable steps"],
  "measuresToTake": ["Immediate measures and precautions — 3-6 items"],
  "deadlines": ["Every deadline or important date"]
}

Reference: ${getKnowledgeBase().slice(0, 8000)}`;
}

function buildDraftSystemPrompt(draftType: DraftType): string {
  const typeLabel = getDraftTypeLabel(draftType);

  const formatGuide: Record<DraftType, string> = {
    rti: `Format as a formal RTI application under RTI Act, 2005.`,
    "consumer-complaint": `Format as a consumer complaint under Consumer Protection Act, 2019.`,
    "legal-notice": `Format as a formal legal notice on plain paper / letterhead style.

IPC / BNS REQUIREMENT:
- You MUST cite the applicable IPC sections (and corresponding BNS sections where given) that match the facts and subject.
- Put them in the SUBJECT line and in a numbered LEGAL GROUNDS paragraph.
- Use the "autoIdentifiedLaws" list supplied in the user message. Do not drop those sections.
- Do not invent extra criminal sections that the facts do not support.
- If the dispute is mainly civil, still keep the identified Contract Act / IPC cheating or breach-of-trust sections where listed.
- Add one line that the notice is without prejudice to further civil and criminal remedies.`,
  };

  return `You are LegalAID Draft Generator. Generate a ${typeLabel}.
${formatGuide[draftType]}

Return ONLY valid JSON:
{
  "title": "Document title",
  "draft": "Full formatted document with \\n line breaks",
  "instructions": ["3-5 steps on how to use this draft"]
}`;
}

function mergeWithGuided(
  ai: Partial<DocumentAnalysis>,
  guided: DocumentAnalysis
): DocumentAnalysis {
  return {
    summary: ai.summary?.trim() || guided.summary,
    detectedType: ai.detectedType?.trim() || guided.detectedType,
    keyPoints: ai.keyPoints?.length ? ai.keyPoints : guided.keyPoints,
    riskClauses: ai.riskClauses?.length ? ai.riskClauses : guided.riskClauses,
    suggestedActions: ai.suggestedActions?.length ? ai.suggestedActions : guided.suggestedActions,
    measuresToTake: ai.measuresToTake?.length ? ai.measuresToTake : guided.measuresToTake,
    deadlines: ai.deadlines?.length ? ai.deadlines : guided.deadlines,
    disclaimer: DISCLAIMER,
  };
}

export async function analyzeDocument(
  text: string,
  category: DocumentCategory
): Promise<DocumentAnalysis> {
  const guided = getGuidedDocumentAnalysis(text, category);

  if (!isDocumentAIEnabled() || process.env.DOCUMENT_AI_ENHANCE !== "true") {
    return guided;
  }

  try {
    const categoryLabel = getDocumentCategoryLabel(category);
    const raw = await completeDocumentText(
      `Document category: ${categoryLabel}\n\nDocument:\n---\n${text.slice(0, 12000)}\n---\n\nReturn JSON only.`,
      {
        systemPrompt: buildAnalyzeSystemPrompt(category),
        temperature: 0.2,
        maxTokens: 4096,
      }
    );

    const parsed = extractJson<Partial<DocumentAnalysis>>(raw);
    return mergeWithGuided(parsed, guided);
  } catch (error) {
    console.error("AI enhance failed, using guided analysis:", error);
    return guided;
  }
}

export async function generateDraft(
  draftType: DraftType,
  formData: Record<string, string>
): Promise<DraftResult> {
  const appliedLaws =
    draftType === "legal-notice" ? matchLawsFromProblem(problemTextFromForm(formData)) : [];

  const enrichedForm = { ...formData };
  if (draftType === "legal-notice" && appliedLaws.length > 0 && !enrichedForm.legalGrounds?.trim()) {
    enrichedForm.legalGrounds = formatLawsForGrounds(appliedLaws);
  }

  const fallback = getFallbackDraft(draftType, enrichedForm, appliedLaws);

  if (!isDocumentAIEnabled()) {
    return fallback;
  }

  const typeLabel = getDraftTypeLabel(draftType);
  const details = Object.entries(enrichedForm)
    .filter(([, v]) => v?.trim())
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");

  const lawBlock =
    appliedLaws.length > 0
      ? `\nautoIdentifiedLaws:\n${appliedLaws.map((l, i) => `${i + 1}. ${l.citation} — ${l.why}`).join("\n")}`
      : "";

  try {
    const raw = await completeDocumentText(
      `Generate a ${typeLabel}:\n${details}${lawBlock}\n\nReturn JSON only.`,
      {
        systemPrompt: buildDraftSystemPrompt(draftType),
        temperature: 0.2,
        maxTokens: 4096,
      }
    );

    const parsed = extractJson<Omit<DraftResult, "disclaimer" | "appliedLaws">>(raw);
    const draft =
      draftType === "legal-notice"
        ? appendLawsToDraft(parsed.draft ?? fallback.draft, appliedLaws)
        : parsed.draft;

    return {
      ...parsed,
      draft,
      instructions: parsed.instructions ?? fallback.instructions,
      disclaimer: DISCLAIMER,
      appliedLaws: appliedLaws.length ? appliedLaws : undefined,
    };
  } catch {
    return fallback;
  }
}

function getFallbackDraft(
  draftType: DraftType,
  formData: Record<string, string> = {},
  appliedLaws: MatchedLaw[] = []
): DraftResult {
  if (draftType === "legal-notice") {
    return buildLegalNoticeTemplate(formData, appliedLaws);
  }

  const typeLabel = getDraftTypeLabel(draftType);

  return {
    title: typeLabel,
    draft: `We could not generate this draft automatically right now.\n\nVisit /ask and describe what you need — LegalAID will guide you on drafting a ${typeLabel}.\n\nFor free legal help, call DLSA: 15100.`,
    instructions: [
      "Use /ask to get step-by-step drafting guidance",
      "Consult DLSA (15100) for free legal aid",
      "Have a qualified advocate review before sending",
    ],
    disclaimer: DISCLAIMER,
  };
}

function buildLegalNoticeTemplate(
  formData: Record<string, string>,
  appliedLaws: MatchedLaw[]
): DraftResult {
  const senderName = formData.senderName?.trim() || "[Your name]";
  const senderAddress = formData.senderAddress?.trim() || "[Your address]";
  const recipientName = formData.recipientName?.trim() || "[Recipient name]";
  const recipientAddress = formData.recipientAddress?.trim() || "[Recipient address]";
  const subject = formData.subject?.trim() || "Legal notice";
  const facts = formData.facts?.trim() || "[Facts of the case]";
  const demand = formData.demand?.trim() || "[Your demand]";
  const deadlineDays = formData.deadlineDays?.trim() || "15";
  const grounds =
    formData.legalGrounds?.trim() ||
    (appliedLaws.length ? formatLawsForGrounds(appliedLaws) : "Applicable Indian laws based on the facts narrated.");

  const lawCitations =
    appliedLaws.length > 0
      ? appliedLaws.map((law) => law.citation).join("; ")
      : "the applicable provisions of Indian law";

  const numberedLaws =
    appliedLaws.length > 0
      ? appliedLaws.map((law, i) => `${i + 1}. ${law.citation}. ${law.why}`).join("\n")
      : "1. The facts disclose a cause of action under applicable civil and, where made out, criminal law.";

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const draft = `LEGAL NOTICE

Date: ${today}

From:
${senderName}
${senderAddress}

To:
${recipientName}
${recipientAddress}

Subject: Legal notice regarding ${subject} — under ${lawCitations}

Sir/Madam,

Under instructions from and on behalf of my client ${senderName} (hereinafter “the Noticee-Sender”), I hereby serve upon you this legal notice as follows:

1. FACTS
${facts}

2. LEGAL GROUNDS
The above facts attract the following provisions (identified from the problem described):
${numberedLaws}

Additional grounds stated by the sender:
${grounds}

3. DEMAND
You are hereby called upon to: ${demand}

4. You are required to comply with the above demand and send a written reply within ${deadlineDays} days of receipt of this notice, failing which my client shall be constrained to initiate appropriate civil and/or criminal proceedings, including but not limited to remedies under ${lawCitations}, entirely at your risk as to costs and consequences.

5. This notice is issued without prejudice to any other rights and remedies available to my client under law.

Yours faithfully,

${senderName}

Encl.: Copies of relevant documents (to be attached)

Note: IPC citations above are matched from the facts for drafting assistance. The Bharatiya Nyaya Sanhita, 2023 has replaced the IPC from 1 July 2024; corresponding BNS sections are mentioned where applicable. Have a qualified advocate review before sending.`;

  return {
    title: `Legal Notice — ${subject}`,
    draft: appendLawsToDraft(draft, appliedLaws),
    instructions: [
      "Print this notice on your advocate’s letterhead if a lawyer is sending it, or on plain paper if you are sending it yourself.",
      "Attach copies of proof (agreements, chats, receipts, bounced cheque memo, photos).",
      "Send by Registered Post with Acknowledgement Due (RPAD) and keep the receipt, tracking, and a photocopy.",
      "You may also send a copy by email/WhatsApp in addition to RPAD, not instead of it.",
      "If there is no reply within the deadline, consult an advocate before filing a case — limitation periods still apply.",
    ],
    disclaimer: DISCLAIMER,
    appliedLaws: appliedLaws.length ? appliedLaws : undefined,
  };
}
