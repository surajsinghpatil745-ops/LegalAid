import ChatInterface from "@/components/ChatInterface";

export const metadata = {
  title: "Ask LegalAID — Get Legal Guidance",
};

export default function AskPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-navy">Ask LegalAID</h1>
        <p className="mt-1 text-sm text-slate-600">
          Chat with LegalAID Bot — get plain-language answers: related laws, offences &
          penalties, then practical steps. Ask follow-ups anytime.
        </p>
      </div>
      <ChatInterface />
    </div>
  );
}
