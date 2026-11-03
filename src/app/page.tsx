import Link from "next/link";
import ScenarioCard from "@/components/ScenarioCard";
import { scenarios } from "@/data/scenarios";

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-light to-navy">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.03%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-saffron">
              🇮🇳 Made for India
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              Don&apos;t fear the law.
              <br />
              <span className="text-saffron">Understand it.</span>
            </h1>
            <p className="mb-8 text-lg leading-relaxed text-slate-300">
              Indians are often scared of laws because they don&apos;t know what they are, what
              punishments they might face, or how to protect themselves. LegalAID is your personal
              legal guide — helping you with traffic issues, police encounters, fights, fines, and
              more.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/ask"
                className="rounded-xl bg-saffron px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-saffron/25 transition-colors hover:bg-saffron-dark"
              >
                Ask LegalAID Now
              </Link>
              <Link
                href="/documents"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                Document Tools
              </Link>
              <Link
                href="#scenarios"
                className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Browse Situations
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: "📚",
              title: "Know Your Rights",
              desc: "Clear explanations of what the law says and what rights you have in any situation.",
            },
            {
              icon: "📄",
              title: "Document Tools",
              desc: "Upload FIR copies, notices, or agreements for AI summaries, risk highlighting, and draft generation.",
              href: "/documents",
            },
            {
              icon: "🛡️",
              title: "Protect Yourself",
              desc: "Step-by-step guidance on documents, fines, and how to avoid being swindled by brokers.",
            },
            {
              icon: "⚖️",
              title: "Find Legal Help",
              desc: "When we can't fully help, we'll point you to the best law agencies and free legal aid.",
              href: "/lawyers",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <span className="mb-3 block text-3xl">{item.icon}</span>
              <h3 className="mb-2 font-semibold text-navy">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
              {"href" in item && item.href && (
                <Link
                  href={item.href}
                  className="mt-3 inline-block text-sm font-medium text-saffron-dark hover:text-saffron"
                >
                  Try it →
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>

      <section id="scenarios" className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold text-navy">Common Situations</h2>
            <p className="mx-auto max-w-xl text-slate-600">
              Real scenarios Indians face every day. Tap any guide for rights, fines, documents, and
              what to do step by step.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.slug} scenario={scenario} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-navy/10 bg-gradient-to-br from-navy/5 to-saffron/5 p-8 sm:p-12">
          <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <span className="text-5xl">📄</span>
            <div className="flex-1">
              <h2 className="mb-2 text-2xl font-bold text-navy">Document Tools</h2>
              <p className="text-slate-600">
                Upload your FIR, legal notice, rental agreement, or court summons. Get an instant
                plain-language summary, risky clauses flagged in red, and auto-generated drafts for
                RTI applications, consumer complaints, and legal notices.
              </p>
            </div>
            <Link
              href="/documents"
              className="shrink-0 rounded-xl bg-saffron px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-saffron-dark"
            >
              Analyze a Document
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-saffron/10 to-navy/5 border border-saffron/20 p-8 sm:p-12 text-center">
          <h2 className="mb-3 text-2xl font-bold text-navy">Have a different situation?</h2>
          <p className="mx-auto mb-6 max-w-lg text-slate-600">
            Describe your problem in your own words. LegalAID will try to help with rights, fines,
            and next steps — or connect you with the right legal agency.
          </p>
          <Link
            href="/ask"
            className="inline-block rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light"
          >
            Start a Conversation
          </Link>
        </div>
      </section>
    </>
  );
}
