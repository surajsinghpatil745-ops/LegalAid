export type Language = "english" | "hindi" | "marathi";

export const LANGUAGE_STORAGE_KEY = "legalaid-language";

export interface LanguageOption {
  id: Language;
  label: string;
  nativeLabel: string;
  greeting: string;
}

export const LANGUAGES: LanguageOption[] = [
  {
    id: "english",
    label: "English",
    nativeLabel: "English",
    greeting: "Hello",
  },
  {
    id: "hindi",
    label: "Hindi",
    nativeLabel: "हिंदी",
    greeting: "नमस्ते",
  },
  {
    id: "marathi",
    label: "Marathi",
    nativeLabel: "मराठी",
    greeting: "नमस्कार",
  },
];

export function getLanguageLabel(language: Language): string {
  return LANGUAGES.find((l) => l.id === language)?.nativeLabel ?? "English";
}

export function getLanguageInstruction(language: Language): string {
  switch (language) {
    case "hindi":
      return `LANGUAGE: Respond entirely in Hindi (Devanagari script). Use simple, clear Hindi that ordinary citizens understand. Law section names may stay in English abbreviations (e.g. IPC, CrPC, MV Act) but explain them in Hindi.`;
    case "marathi":
      return `LANGUAGE: Respond entirely in Marathi (Devanagari script). Use simple, clear Marathi that ordinary citizens understand. Law section names may stay in English abbreviations (e.g. IPC, CrPC, MV Act) but explain them in Marathi.`;
    default:
      return `LANGUAGE: Respond in clear, simple English. Hindi-English mix (Hinglish) is fine if it helps clarity.`;
  }
}

export function getWelcomeMessage(language: Language): string {
  switch (language) {
    case "hindi":
      return `नमस्ते! मैं **LegalAID** हूँ — भारत के लिए आपका कानूनी मार्गदर्शक।

अपनी समस्या बताइए और मैं एक अनुभवी वकील की तरह सलाह दूँगा:
• लागू **कानून** (धारा संदर्भ के साथ)
• आपके **अधिकार** और **अभी क्या करें**
• **जुर्माना, जोखिम**, और बचने योग्य गलतियाँ
• ज़रूरी **दस्तावेज़** और वकील कब लें

आप फॉलो-अप सवाल भी पूछ सकते हैं — मैं बातचीत याद रखूँगा।`;

    case "marathi":
      return `नमस्कार! मी **LegalAID** आहे — भारतासाठी तुमचा कायदेशीर मार्गदर्शक.

तुमची समस्या सांगा आणि मी अनुभवी वकीलासारखा सल्ला देईन:
• लागू **कायदा** (कलम संदर्भासह)
• तुमचे **अधिकार** आणि **आत्ता काय करावे**
• **दंड, धोके**, आणि टाळावयाच्या चुका
• आवश्यक **कागदपत्रे** आणि वकील कधी घ्यावा

तुम्ही पुढील प्रश्नही विचारू शकता — मी संभाषण लक्षात ठेवेन.`;

    default:
      return `Hello! I'm **LegalAID** — your legal guide for India.

Describe your situation and I'll advise you like an experienced advocate:
• The **law** that applies (with section citations)
• Your **rights** and what to do **right now**
• **Fines, risks**, and mistakes to avoid
• **Documents** you need and when to see a lawyer

You can ask follow-up questions — I'll remember our conversation.`;
  }
}

export function getQuickPrompts(language: Language): string[] {
  switch (language) {
    case "hindi":
      return [
        "पुलिस ने नो-पार्किंग से मेरी बाइक उठा ली",
        "आधी रात पुलिस ने रास्ते में रोका",
        "पुलिस ने झगड़े में पकड़ लिया",
        "मुझे ट्रैफिक चालान मिला",
        "दुकान ने खराब सामान बेचा",
      ];
    case "marathi":
      return [
        "पोलिसांनी नो-पार्किंगमधून माझी बाईक नेली",
        "मध्यरात्री पोलिसांनी रस्त्यावर थांबवले",
        "पोलिसांनी भांडणात पकडले",
        "मला ट्रॅफिक चलन मिळाले",
        "दुकानाने खराब वस्तू विकली",
      ];
    default:
      return [
        "Police towed my bike from no-parking zone",
        "Police stopped me while walking at midnight",
        "I was caught in a fight by police",
        "I received a traffic challan",
        "A shop sold me a defective product",
      ];
  }
}

export function getInputPlaceholder(language: Language): string {
  switch (language) {
    case "hindi":
      return "अपनी कानूनी समस्या बताइए...";
    case "marathi":
      return "तुमची कायदेशीर समस्या सांगा...";
    default:
      return "Describe your legal situation...";
  }
}
