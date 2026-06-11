import { lawAgencies } from "@/data/lawyers";

export const metadata = {
  title: "Find Legal Help — LegalAID",
};

export default function LawyersPage() {
  const government = lawAgencies.filter((a) => a.type === "government");
  const privateAgencies = lawAgencies.filter((a) => a.type === "private");

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="mb-3 text-3xl font-bold text-navy">Find Legal Help</h1>
        <p className="max-w-2xl text-slate-600">
          When LegalAID determines your case needs professional help, or you simply want to speak
          with an advocate, start here. Government services marked as free are available at no cost
          for eligible citizens.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-navy">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm">
            🏛️
          </span>
          Free Government Legal Aid
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {government.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-navy">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-sm">
            👨‍⚖️
          </span>
          Private Advocates & Directories
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {privateAgencies.map((agency) => (
            <AgencyCard key={agency.id} agency={agency} />
          ))}
        </div>
      </section>

      <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-6">
        <h3 className="mb-2 font-semibold text-amber-900">Before hiring any lawyer</h3>
        <ul className="space-y-1.5 text-sm text-amber-800">
          <li>• Verify their Bar Council enrollment number</li>
          <li>• Ask about fees upfront — get it in writing</li>
          <li>• For criminal cases, call NALSA at 15100 first — you may qualify for free aid</li>
          <li>• Never pay full fees before any work is done</li>
        </ul>
      </div>
    </div>
  );
}

function AgencyCard({ agency }: { agency: (typeof lawAgencies)[0] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-navy">{agency.name}</h3>
        {agency.free && (
          <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            Free
          </span>
        )}
      </div>
      <p className="mb-4 text-sm leading-relaxed text-slate-600">{agency.description}</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {agency.category.map((cat) => (
          <span
            key={cat}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
          >
            {cat}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm font-semibold text-navy">{agency.contact}</span>
        {agency.website && (
          <a
            href={agency.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-saffron-dark hover:underline"
          >
            Visit website →
          </a>
        )}
      </div>
    </div>
  );
}
