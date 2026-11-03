import { ipcOffences, type IpcOffence } from "@/data/ipc-offences";

export interface MatchedLaw {
  section: string;
  act: string;
  title: string;
  why: string;
  bnsEquivalent?: string;
  citation: string;
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export function matchLawsFromProblem(problemText: string): MatchedLaw[] {
  const haystack = normalize(problemText);
  if (!haystack) return [];

  const scored: { offence: IpcOffence; score: number }[] = [];

  for (const offence of ipcOffences) {
    let score = 0;
    for (const keyword of offence.keywords) {
      if (haystack.includes(keyword.toLowerCase())) {
        score += keyword.includes(" ") ? 2 : 1;
      }
    }
    if (score > 0) scored.push({ offence, score });
  }

  scored.sort((a, b) => b.score - a.score);

  const picked: MatchedLaw[] = [];
  for (const { offence } of scored) {
    if (picked.length >= 5) break;
    if (offence.id === "unpaid-dues" && picked.some((p) => p.act === "IPC" || p.act === "NI Act")) {
      continue;
    }
    picked.push(toMatchedLaw(offence));
  }

  return picked;
}

function toMatchedLaw(offence: IpcOffence): MatchedLaw {
  const citation =
    offence.act === "IPC"
      ? `${offence.section} IPC (${offence.title})${offence.bnsEquivalent ? `; corresponding ${offence.bnsEquivalent}` : ""}`
      : offence.act === "NI Act"
        ? `${offence.section} of the Negotiable Instruments Act, 1881 (${offence.title})`
        : offence.act === "IT Act"
          ? `${offence.section} of the Information Technology Act, 2000 (${offence.title})`
          : `${offence.section} ${offence.act} (${offence.title})`;

  if (offence.id === "unpaid-dues") {
    return {
      section: "Section 73",
      act: "Contract Act",
      title: "Compensation for loss or damage caused by breach of contract",
      why: offence.why,
      citation:
        "Section 73 of the Indian Contract Act, 1872 (compensation for breach). If the non-payment was obtained by deception, Sections 415 & 420 IPC / Section 318 BNS may also apply.",
    };
  }

  return {
    section: offence.section,
    act: offence.act,
    title: offence.title,
    why: offence.why,
    bnsEquivalent: offence.bnsEquivalent,
    citation,
  };
}

export function formatLawsForGrounds(laws: MatchedLaw[]): string {
  if (laws.length === 0) return "";
  return laws.map((law) => `${law.citation} — ${law.why}`).join("\n");
}

export function problemTextFromForm(formData: Record<string, string>): string {
  return [formData.subject, formData.facts, formData.demand]
    .filter((v) => v?.trim())
    .join("\n");
}

export function draftMentionsLaw(draft: string, law: MatchedLaw): boolean {
  const text = draft.toLowerCase();
  const nums = law.section.match(/\d+[A-Za-z]?/g) ?? [];
  if (nums.length === 0) return text.includes(law.act.toLowerCase());
  const hasNum = nums.some((n) => new RegExp(`\\b${n}\\b`, "i").test(text));
  if (!hasNum) return false;

  const act = law.act.toLowerCase();
  if (act === "ipc") return /ipc|indian penal|bns|bharatiya nyaya/.test(text);
  if (act.includes("ni")) return /negotiable|ni act/.test(text);
  if (act.includes("it")) return /information technology|it act/.test(text);
  if (act.includes("contract")) return /contract act/.test(text);
  return true;
}

export function appendLawsToDraft(draft: string, laws: MatchedLaw[]): string {
  if (laws.length === 0) return draft;
  const missing = laws.filter((law) => !draftMentionsLaw(draft, law));
  if (missing.length === 0) return draft;

  const block = [
    "",
    "LEGAL PROVISIONS ATTRACTED (auto-identified from the facts):",
    ...missing.map((law, i) => `${i + 1}. ${law.citation}. ${law.why}`),
    "",
    "These provisions are cited based on the facts narrated and are indicative. A qualified advocate should confirm applicability before sending this notice.",
  ].join("\n");

  return `${draft.trim()}\n${block}\n`;
}
