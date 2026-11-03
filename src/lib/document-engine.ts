import type { DocumentCategory, RiskSeverity } from "@/data/document-types";
import { getDocumentCategoryLabel } from "@/data/document-types";
import type { DocumentAnalysis, RiskClause } from "@/lib/document-tools";

const GUIDED_DISCLAIMER =
  "This is general legal information, not formal legal advice. For your specific situation, consult a qualified advocate or call DLSA free legal aid: 15100.";

interface RiskPattern {
  pattern: RegExp;
  reason: string;
  severity: RiskSeverity;
  measure: string;
  extract?: (match: RegExpMatchArray) => string;
}

const UNIVERSAL_RISK_PATTERNS: RiskPattern[] = [
  {
    pattern: /waiv(e|es|al)[^.]{0,40}(rights?|rent control|legal|remedy|recourse)/i,
    reason:
      "You may be giving up legal protections that Indian law normally gives you — such clauses are often challenged in court.",
    measure: "Do not sign until a lawyer reviews this clause. Ask for its removal or rewording.",
    severity: "high",
  },
  {
    pattern: /(without\s+(prior\s+)?notice|at\s+any\s+time).{0,30}(enter|evict|vacate|terminate)/i,
    reason:
      "The other party may act against you without warning — this is often unfair and may not hold up under tenant or contract law.",
    measure: "Negotiate a minimum notice period (typically 30 days) before signing or responding.",
    severity: "high",
  },
  {
    pattern: /(deposit|security).{0,30}(\d+\s*months?|₹|rs\.?\s*[\d,]+)/i,
    reason:
      "The security deposit may exceed what your state allows — many states cap it at 2–3 months' rent.",
    measure: "Check your state rent rules and negotiate a lower deposit before paying.",
    severity: "medium",
    extract: (m) => m[0],
  },
  {
    pattern: /(increase|escalation).{0,20}(\d{2,}%|every\s+\d+\s+months?)/i,
    reason: "Rent or charges may rise faster than you expect — this can strain your budget over time.",
    measure: "Ask for a reasonable cap (e.g. 5–10% per year) in writing before agreeing.",
    severity: "medium",
    extract: (m) => m[0],
  },
  {
    pattern: /fail(ing|ure|\s+to)\s+(to\s+)?appear|ex[- ]?parte|warrant/i,
    reason:
      "If you miss the court date, the court may rule against you without hearing your side, or issue a warrant.",
    measure: "Mark the date on your calendar today and contact a lawyer or DLSA (15100) immediately.",
    severity: "high",
  },
  {
    pattern: /section\s+\d+\s*(of\s+the\s+)?(IPC|BNS|NI\s+Act|CrPC)/i,
    reason:
      "A criminal or special law section is involved — this can affect bail, arrest, or penalties.",
    measure: "Find out if the section is bailable and speak to a criminal lawyer before any police interaction.",
    severity: "medium",
    extract: (m) => m[0],
  },
  {
    pattern: /within\s+(\d+)\s+(days?|hours?).{0,40}(pay|respond|reply|vacate|appeal)/i,
    reason:
      "You have a strict deadline — missing it can weaken your case or trigger further legal action.",
    measure: "Calculate the exact last date and start your reply or payment process immediately.",
    severity: "high",
    extract: (m) => m[0],
  },
  {
    pattern: /non[- ]?refund/i,
    reason:
      "Your deposit or payment may not come back even if you leave early or the service fails.",
    measure: "Get refund terms in writing and keep all payment receipts and photos as proof.",
    severity: "medium",
  },
  {
    pattern: /(reject(ed|ion)|denied|deficiency|warranty).{0,60}(claim|repair|service|replacement)/i,
    reason:
      "Your complaint or warranty claim has been refused — you may still have rights under consumer law.",
    measure: "File a complaint on the National Consumer Helpline (1800-11-4000) or at edaakhil.nic.in within limitation period.",
    severity: "medium",
  },
  {
    pattern: /appeal.{0,30}(\d+)\s+days?/i,
    reason: "A limited window exists to challenge this decision — delay can close your options.",
    measure: "Note the appeal deadline and consult a lawyer before it expires.",
    severity: "high",
  },
  {
    pattern: /brokerage.{0,20}(\d+\s*months?|tenant)/i,
    reason: "You may be asked to pay brokerage that is negotiable or not legally required.",
    measure: "Ask for a breakdown of charges and negotiate before paying.",
    severity: "low",
  },
];

const CATEGORY_SUMMARY: Record<DocumentCategory, (ctx: SummaryContext) => string> = {
  fir: (ctx) =>
    `This is a First Information Report (FIR) — a police record that a crime was reported. ` +
    `${ctx.sections ? `Sections mentioned: ${ctx.sections}. ` : ""}` +
    `An FIR is not a conviction, but it starts a police investigation. ` +
    `You have the right to a free copy under Section 154 CrPC. ` +
    `${ctx.highRisk ? "Some sections may carry arrest risk — treat this seriously and seek legal help early." : "Cooperate with investigation while knowing your rights."}`,

  "legal-notice": (ctx) =>
    `This is a legal notice — a formal warning before court action. ` +
    `${ctx.amounts ? `Amount claimed: ${ctx.amounts}. ` : ""}` +
    `${ctx.dates ? `Important dates: ${ctx.dates}. ` : ""}` +
    `Ignoring it can hurt your case. You should read every demand and deadline carefully and respond or consult a lawyer before the deadline passes.`,

  "rental-agreement": (ctx) =>
    `This is a rental or lease agreement between landlord and tenant. ` +
    `${ctx.amounts ? `Money involved: ${ctx.amounts}. ` : ""}` +
    `It sets rules for rent, deposit, eviction, and your stay. ` +
    `${ctx.riskCount > 0 ? `${ctx.riskCount} clause(s) look unfavourable to you — review them before signing.` : "Read every clause before signing — once signed, it is hard to change."}`,

  "court-summons": (ctx) =>
    `This is a court summons — a legal order to appear before a judge. ` +
    `${ctx.dates ? `Hearing or deadline: ${ctx.dates}. ` : ""}` +
    `This is urgent. Missing the date can lead to ex-parte orders, fines, or arrest warrants depending on the case type.`,

  other: (ctx) =>
    `This document appears to be ${ctx.docHint}. ` +
    `${ctx.amounts ? `Amounts mentioned: ${ctx.amounts}. ` : ""}` +
    `${ctx.dates ? `Dates mentioned: ${ctx.dates}. ` : ""}` +
    `${ctx.riskCount > 0 ? `${ctx.riskCount} concern(s) were found that need your attention.` : "Read it fully to understand your rights and any deadlines."} ` +
    `If a company or government body sent this, you usually have the right to reply, appeal, or complain.`,
};

interface SummaryContext {
  amounts: string;
  dates: string;
  sections: string;
  riskCount: number;
  highRisk: boolean;
  docHint: string;
}

function extractDates(text: string): string[] {
  const matches = text.match(/\b\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b/g) ?? [];
  return [...new Set(matches)].slice(0, 8);
}

function extractAmounts(text: string): string[] {
  const matches = text.match(/(?:₹|Rs\.?\s*)[\d,]+(?:\.\d{2})?/gi) ?? [];
  return [...new Set(matches)].slice(0, 6);
}

function extractSections(text: string): string[] {
  const matches =
    text.match(/section\s+\d+[A-Za-z]?[^.\n]{0,40}(?:IPC|BNS|CrPC|NI\s+Act|MV\s+Act)?/gi) ?? [];
  return [...new Set(matches)].slice(0, 6);
}

function buildCaseSummary(text: string, category: DocumentCategory, ctx: SummaryContext): string {
  const base = CATEGORY_SUMMARY[category](ctx);
  const sentences = text
    .split(/[.\n]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25)
    .slice(0, 2);

  if (sentences.length === 0) return base;

  const contextLine = `In brief: ${sentences.join(". ")}.`;
  return `${base} ${contextLine}`;
}

function extractSubject(text: string): string | null {
  const match = text.match(/(?:subject|re|regarding)\s*[:.\-–]\s*(.+)/i);
  return match ? match[1].trim().slice(0, 120) : null;
}

function guessDocumentHint(text: string): string {
  const lower = text.toLowerCase();
  if (/warranty|consumer|deficiency|refund|replacement/.test(lower))
    return "a consumer or warranty-related letter";
  if (/termination|employment|resign/.test(lower)) return "an employment-related document";
  if (/insurance|policy|claim/.test(lower)) return "an insurance-related document";
  if (/invoice|payment|due/.test(lower)) return "a payment or billing document";
  if (/notice|demand|recovery/.test(lower)) return "a formal notice or demand letter";
  return "a legal or official document";
}

function extractParties(text: string): string[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const hints: string[] = [];

  for (const line of lines.slice(0, 8)) {
    if (/^(from|to|complainant|customer|tenant|landlord|recipient|sender)/i.test(line)) {
      hints.push(line.slice(0, 120));
    }
  }

  return hints.slice(0, 3);
}

function findRiskClauses(text: string): RiskClause[] {
  const found: RiskClause[] = [];

  for (const rule of UNIVERSAL_RISK_PATTERNS) {
    const match = text.match(rule.pattern);
    if (!match) continue;

    const clause = rule.extract ? rule.extract(match) : match[0].trim().slice(0, 200);
    if (found.some((r) => r.clause === clause)) continue;

    found.push({ clause, reason: rule.reason, severity: rule.severity });
  }

  return found.slice(0, 8);
}

function getMeasuresFromRisks(text: string): string[] {
  const measures: string[] = [];

  for (const rule of UNIVERSAL_RISK_PATTERNS) {
    if (text.match(rule.pattern)) {
      measures.push(rule.measure);
    }
  }

  return [...new Set(measures)].slice(0, 6);
}

function buildWhatYouCanDo(category: DocumentCategory, text: string): string[] {
  const lower = text.toLowerCase();

  switch (category) {
    case "fir":
      return [
        "Get a certified copy of the FIR from the police station (free under Section 154 CrPC)",
        "Write down everything you remember about the incident while it is fresh",
        "Apply for anticipatory bail if you fear arrest — consult a criminal lawyer",
        "Do not pay any unofficial 'settlement' to police or middlemen",
      ];
    case "legal-notice":
      return [
        "Send a written reply before the deadline — silence is treated as no defence",
        "Gather proof: receipts, bank statements, messages, contracts",
        "Negotiate a settlement if the claim is partly valid",
        "File a counter-notice if their claims are false or exaggerated",
      ];
    case "rental-agreement":
      return [
        "Negotiate unfair clauses before signing — cross out and initial changes",
        "Compare deposit and notice period with your state rent-control rules",
        "Register the lease if registration is mandatory in your state",
        "Take photos of the property condition on move-in day",
      ];
    case "court-summons":
      return [
        "Hire an advocate or apply for free legal aid (DLSA: 15100) before the hearing",
        "Prepare all documents listed in the summons plus your ID proof",
        "If you cannot attend, ask your lawyer to seek an adjournment — do not simply skip",
      ];
    default:
      if (/warranty|consumer|deficiency/.test(lower)) {
        return [
          "File a complaint at edaakhil.nic.in (Consumer Commission) or call 1800-11-4000",
          "Send a written grievance to the company's customer care and keep proof of delivery",
          "Gather bills, warranty card, photos of the defect, and service centre reports",
          "Ask for repair, replacement, or refund as applicable under Consumer Protection Act 2019",
        ];
      }
      return [
        "Read the full document and highlight every deadline and demand",
        "Collect all related papers: receipts, contracts, emails, and messages",
        "Send a written response if the document requires one — keep a copy",
        "Use Ask LegalAID or visit /lawyers for free legal aid if unsure",
      ];
  }
}

function buildUrgentMeasures(
  category: DocumentCategory,
  dates: string[],
  text: string,
  riskClauses: RiskClause[]
): string[] {
  const urgent: string[] = [...getMeasuresFromRisks(text)];

  if (dates.length > 0) {
    urgent.unshift(`Mark these dates immediately: ${dates.join(", ")} — missing a deadline can harm your case.`);
  }

  if (category === "court-summons") {
    urgent.unshift("Do not miss the court date — arrange a lawyer or legal aid today.");
  }

  if (riskClauses.some((r) => r.severity === "high")) {
    urgent.push("Consult a qualified advocate before signing, paying, or replying.");
  }

  urgent.push("Keep originals and photocopies of this document in a safe place.");
  urgent.push("Call DLSA free legal aid helpline: 15100 if you cannot afford a lawyer.");

  return [...new Set(urgent)].slice(0, 8);
}

function buildKeyInformation(
  text: string,
  category: DocumentCategory,
  dates: string[],
  amounts: string[],
  sections: string[]
): string[] {
  const categoryLabel = getDocumentCategoryLabel(category);
  const points: string[] = [`Document type: ${categoryLabel}`];

  const subject = extractSubject(text);
  if (subject) points.push(`Subject: ${subject}`);

  const parties = extractParties(text);
  if (parties.length) points.push(...parties.map((p) => `Party: ${p}`));

  if (amounts.length) points.push(`Money involved: ${amounts.join(", ")}`);
  if (dates.length) points.push(`Important dates: ${dates.join(", ")}`);
  if (sections.length) points.push(`Laws/sections cited: ${sections.join("; ")}`);

  const lines = text.split("\n").filter((l) => l.trim().length > 20);
  if (lines[0]) points.push(`Opening line: "${lines[0].trim().slice(0, 100)}${lines[0].length > 100 ? "…" : ""}"`);

  return points.slice(0, 8);
}

function buildDeadlines(dates: string[], text: string): string[] {
  const deadlines: string[] = [];

  const appealMatch = text.match(/appeal.{0,20}(\d+)\s+days?/i);
  if (appealMatch) {
    deadlines.push(`Appeal window: ${appealMatch[1]} days from the date of this document`);
  }

  const respondMatch = text.match(/within\s+(\d+)\s+(days?).{0,30}(respond|reply|pay|appeal)/i);
  if (respondMatch) {
    deadlines.push(`Response deadline: within ${respondMatch[1]} ${respondMatch[2]} of receiving this document`);
  }

  for (const date of dates.slice(0, 4)) {
    if (!deadlines.some((d) => d.includes(date))) {
      deadlines.push(`Date in document: ${date} — verify what action is due on this date`);
    }
  }

  return deadlines;
}

export function getGuidedDocumentAnalysis(
  text: string,
  category: DocumentCategory
): DocumentAnalysis {
  const dates = extractDates(text);
  const amounts = extractAmounts(text);
  const sections = extractSections(text);
  const riskClauses = findRiskClauses(text);

  const ctx: SummaryContext = {
    amounts: amounts.join(", "),
    dates: dates.join(", "),
    sections: sections.join("; "),
    riskCount: riskClauses.length,
    highRisk: riskClauses.some((r) => r.severity === "high"),
    docHint: guessDocumentHint(text),
  };

  const summary = buildCaseSummary(text, category, ctx);
  const keyPoints = buildKeyInformation(text, category, dates, amounts, sections);
  const suggestedActions = buildWhatYouCanDo(category, text);
  const measuresToTake = buildUrgentMeasures(category, dates, text, riskClauses);

  return {
    summary,
    detectedType: getDocumentCategoryLabel(category),
    keyPoints,
    riskClauses,
    suggestedActions,
    deadlines: buildDeadlines(dates, text),
    disclaimer: GUIDED_DISCLAIMER,
    measuresToTake,
  };
}

export function isQuotaAIError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("quota") ||
    msg.includes("insufficient_quota") ||
    msg.includes("limit: 0") ||
    msg.includes("RESOURCE_EXHAUSTED")
  );
}
