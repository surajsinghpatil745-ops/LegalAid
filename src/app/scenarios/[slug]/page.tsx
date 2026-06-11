import Link from "next/link";
import { notFound } from "next/navigation";
import { scenarios, getScenarioBySlug } from "@/data/scenarios";
import { getAgenciesForCategory } from "@/data/lawyers";

export function generateStaticParams() {
  return scenarios.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scenario = getScenarioBySlug(slug);
  if (!scenario) return { title: "Not Found" };
  return { title: `${scenario.title} — LegalAID` };
}

export default async function ScenarioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const scenario = getScenarioBySlug(slug);
  if (!scenario) notFound();

  const agencies = getAgenciesForCategory(scenario.category);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href="/#scenarios"
        className="mb-6 inline-flex items-center text-sm text-slate-500 hover:text-navy"
      >
        ← Back to situations
      </Link>

      <div className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-4xl">{scenario.icon}</span>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-saffron-dark">
              {scenario.category}
            </span>
            <h1 className="text-2xl font-bold text-navy sm:text-3xl">{scenario.title}</h1>
          </div>
        </div>
        <p className="text-lg leading-relaxed text-slate-600">{scenario.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              scenario.isOffense
                ? "bg-red-50 text-red-700"
                : "bg-emerald-50 text-emerald-700"
            }`}
          >
            {scenario.isOffense ? "May involve an offence" : "Not necessarily an offence"}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              scenario.urgency === "high"
                ? "bg-red-50 text-red-700"
                : scenario.urgency === "medium"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-slate-100 text-slate-600"
            }`}
          >
            {scenario.urgency === "high" ? "Urgent" : scenario.urgency === "medium" ? "Moderate urgency" : "Common issue"}
          </span>
        </div>
      </div>

      <section className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-navy">Your Rights</h2>
        <ul className="space-y-2">
          {scenario.yourRights.map((right, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-slate-700">
              <span className="mt-0.5 text-emerald-600">✓</span>
              {right}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-navy">What To Do — Step by Step</h2>
        <div className="space-y-4">
          {scenario.steps.map((step, i) => (
            <div
              key={i}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="mb-1 font-semibold text-navy">{step.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {scenario.fines.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-navy">Fines & Punishments</h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-navy">Violation</th>
                  <th className="px-4 py-3 text-left font-semibold text-navy">Penalty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {scenario.fines.map((fine, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3 text-slate-700">{fine.label}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{fine.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-navy">Documents You May Need</h2>
        <div className="flex flex-wrap gap-2">
          {scenario.documents.map((doc, i) => (
            <span
              key={i}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
            >
              📄 {doc}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <h2 className="mb-4 text-lg font-semibold text-red-900">Warnings — Avoid These Mistakes</h2>
        <ul className="space-y-2">
          {scenario.warnings.map((warning, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-red-800">
              <span>⚠️</span>
              {warning}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-navy">Relevant Laws</h2>
        <div className="space-y-3">
          {scenario.laws.map((law, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="font-semibold text-navy">
                {law.act} — {law.section}
              </p>
              <p className="mt-1 text-sm text-slate-600">{law.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-2xl border border-saffron/30 bg-saffron/5 p-6">
        <h2 className="mb-2 text-lg font-semibold text-navy">When to Get a Lawyer</h2>
        <p className="mb-4 text-sm leading-relaxed text-slate-700">{scenario.whenToGetLawyer}</p>
        <div className="space-y-3">
          {agencies.slice(0, 3).map((agency) => (
            <div
              key={agency.id}
              className="flex items-center justify-between rounded-lg bg-white p-3 border border-slate-200"
            >
              <div>
                <p className="text-sm font-semibold text-navy">{agency.name}</p>
                <p className="text-xs text-slate-500">{agency.contact}</p>
              </div>
              {agency.free && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                  Free
                </span>
              )}
            </div>
          ))}
        </div>
        <Link
          href="/lawyers"
          className="mt-4 inline-block text-sm font-semibold text-saffron-dark hover:underline"
        >
          View all legal agencies →
        </Link>
      </section>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
        <p className="mb-3 text-sm text-slate-600">Have a specific question about this situation?</p>
        <Link
          href="/ask"
          className="inline-block rounded-lg bg-navy px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-light"
        >
          Ask LegalAID
        </Link>
      </div>
    </div>
  );
}
