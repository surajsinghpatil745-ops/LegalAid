import { scenarios } from "@/data/scenarios";
import { getAgenciesForCategory } from "@/data/lawyers";

export interface ChatResponse {
  message: string;
  confidence: "high" | "medium" | "low";
  relatedScenario?: string;
  suggestLawyer: boolean;
  suggestedCategories: string[];
  disclaimer: string;
}

const DISCLAIMER =
  "This is general legal information, not formal legal advice. Laws vary by state and change over time. For your specific situation, consult a qualified advocate.";

const keywordMap: { keywords: string[]; slug: string; category: string }[] = [
  {
    keywords: ["tow", "towed", "impound", "no parking", "parking", "bike taken", "vehicle taken", "broker"],
    slug: "vehicle-towed-no-parking",
    category: "Traffic",
  },
  {
    keywords: ["midnight", "night", "walking", "stopped", "police stop", "questioning", "late night"],
    slug: "police-stop-midnight",
    category: "Police Encounters",
  },
  {
    keywords: ["fight", "assault", "beaten", "hit", "brawl", "quarrel", "violence"],
    slug: "caught-in-fight",
    category: "Criminal",
  },
  {
    keywords: ["challan", "fine", "traffic fine", "speeding", "helmet", "signal", "e-challan"],
    slug: "traffic-challan",
    category: "Traffic",
  },
  {
    keywords: ["cheat", "defective", "refund", "consumer", "shop", "seller", "warranty", "online order"],
    slug: "consumer-cheated",
    category: "Consumer Rights",
  },
  {
    keywords: ["arrest", "arrested", "jail", "bail", "fir", "custody", "detained"],
    slug: "arrested-what-to-do",
    category: "Criminal",
  },
];

function detectScenario(query: string): { slug: string; category: string; score: number; urgency: "low" | "medium" | "high" } | null {
  const lower = query.toLowerCase();
  let best: { slug: string; category: string; score: number; urgency: "low" | "medium" | "high" } | null = null;

  for (const entry of keywordMap) {
    const score = entry.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > 0 && (!best || score > best.score)) {
      const scenario = scenarios.find((s) => s.slug === entry.slug);
      best = {
        slug: entry.slug,
        category: entry.category,
        score,
        urgency: scenario?.urgency ?? "medium",
      };
    }
  }

  return best;
}

export function detectScenarioFromQuery(query: string) {
  return detectScenario(query);
}

function formatScenarioResponse(slug: string): ChatResponse | null {
  const scenario = scenarios.find((s) => s.slug === slug);
  if (!scenario) return null;

  const stepsText = scenario.steps
    .map((s, i) => `${i + 1}. **${s.title}**\n   ${s.description}`)
    .join("\n\n");

  const rightsText = scenario.yourRights.map((r) => `• ${r}`).join("\n");
  const finesText =
    scenario.fines.length > 0
      ? scenario.fines.map((f) => `• **${f.label}**: ${f.amount}`).join("\n")
      : "• No standard fines apply — but always verify with the issuing authority.";

  const lawsText = scenario.laws
    .map(
      (l) =>
        `• **${l.section}** (${l.act})\n  ${l.description}`
    )
    .join("\n\n");

  const warningsText = scenario.warnings.map((w) => `• ${w}`).join("\n");
  const docsText = scenario.documents.map((d) => `• ${d}`).join("\n");

  const offenseNote = scenario.isOffense
    ? "Yes — this situation may involve a legal offence or violation."
    : "Not necessarily — this alone may not be a crime, but know your rights anyway.";

  return {
    message: `**Short Answer**\n${scenario.summary}\n\n**Is This An Offence?**\n${offenseNote}\n\n**Your Rights**\n${rightsText}\n\n**Legal Basis**\n${lawsText}\n\n**Step-by-Step — What To Do**\n${stepsText}\n\n**Fines & Punishments (2024-25)**\n${finesText}\n\n**Documents You Need**\n${docsText}\n\n**Warnings — Avoid These Mistakes**\n${warningsText}\n\n**When To Get A Lawyer**\n${scenario.whenToGetLawyer}\n\nFor free legal aid, call **DLSA/NALSA: 15100**.`,
    confidence: "high",
    relatedScenario: slug,
    suggestLawyer: scenario.urgency === "high",
    suggestedCategories: [scenario.category],
    disclaimer: DISCLAIMER,
  };
}

export function processLegalQuery(query: string): ChatResponse {
  if (!query.trim()) {
    return {
      message: "Please describe your legal situation in a few sentences. For example: 'Police towed my bike from a no-parking zone' or 'I was stopped by police at midnight.'",
      confidence: "low",
      suggestLawyer: false,
      suggestedCategories: [],
      disclaimer: DISCLAIMER,
    };
  }

  const detected = detectScenario(query);

  if (detected && detected.score >= 1) {
    const response = formatScenarioResponse(detected.slug);
    if (response) return response;
  }

  const lower = query.toLowerCase();
  const isComplex =
    lower.includes("court") ||
    lower.includes("lawyer") ||
    lower.includes("sue") ||
    lower.includes("divorce") ||
    lower.includes("property dispute") ||
    lower.includes("land") ||
    lower.includes("murder") ||
    lower.includes("rape") ||
    lower.includes("corruption");

  if (isComplex) {
    return {
      message:
        "Your situation appears complex and may require personalised legal representation. LegalAID can provide general guidance, but for matters involving courts, property disputes, serious criminal charges, or family law — you should speak with a qualified advocate.\n\n**Immediate free help:**\n• NALSA Helpline: **15100** (free legal aid)\n• National Consumer Helpline: **1800-11-4000**\n• Cyber Crime: **1930**\n\nBrowse our **Find Legal Help** section for agencies matched to your case type.",
      confidence: "low",
      suggestLawyer: true,
      suggestedCategories: ["Criminal", "Civil"],
      disclaimer: DISCLAIMER,
    };
  }

  return {
    message:
      "I couldn't match your query to a specific scenario with high confidence. Here are some things you can try:\n\n• Browse our **Common Situations** for guides on traffic, police encounters, fights, and consumer issues.\n• Rephrase your question with more details (what happened, when, where, who was involved).\n• For urgent matters like arrest, call **NALSA: 15100** immediately.\n\n**Example questions I can help with:**\n• 'My bike was towed for no parking'\n• 'Police stopped me while walking at night'\n• 'I was caught in a fight'\n• 'I got a traffic challan'\n• 'A shop sold me a defective product'",
    confidence: "low",
    suggestLawyer: true,
    suggestedCategories: ["All"],
    disclaimer: DISCLAIMER,
  };
}

export function getAgencyRecommendations(categories: string[]) {
  const seen = new Set<string>();
  const agencies = categories.flatMap((cat) => getAgenciesForCategory(cat));
  return agencies.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}
