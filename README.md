# LegalAID

Your personal legal guide for India. Understand laws, know your rights, learn about fines and punishments, and find legal help when you need it.

## Features

- **LegalAID Bot** — Conversational chatbot for legal questions with follow-up support
- **Common Situation Guides** — Step-by-step help for traffic towing, police stops, fights, challans, consumer issues, and arrests
- **Find Legal Help** — Government free legal aid (NALSA, consumer helpline) and advocate directories
- **Rights, Fines & Documents** — Every guide includes your rights, possible penalties, required documents, and scam warnings

## Chatbot Setup (Optional)

The chatbot works in two modes:

1. **Guided mode** (default) — Uses built-in scenario matching, no API key needed
2. **AI mode** — Full conversational AI with streaming responses when OpenAI is configured

To enable AI mode:

```bash
cp .env.local.example .env.local
# Add your OpenAI or OpenRouter key to .env.local
# For OpenRouter: OPENAI_BASE_URL=https://openrouter.ai/api/v1 and OPENAI_MODEL=openai/gpt-4o-mini
```

OpenAI-compatible API powers **Ask LegalAID** and **Document Tools** (set `DOCUMENT_AI_ENHANCE=true` for AI document analysis).

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

## Disclaimer

LegalAID provides general legal information for educational purposes only. It is not a substitute for professional legal advice from a qualified advocate.
