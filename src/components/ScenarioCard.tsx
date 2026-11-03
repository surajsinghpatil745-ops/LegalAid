import Link from "next/link";
import type { Scenario } from "@/data/scenarios";

const urgencyStyles = {
  low: "bg-emerald-50 text-emerald-700",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

export default function ScenarioCard({ scenario }: { scenario: Scenario }) {
  return (
    <Link
      href={`/scenarios/${scenario.slug}`}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-saffron/40 hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between">
        <span className="text-3xl">{scenario.icon}</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyStyles[scenario.urgency]}`}
        >
          {scenario.urgency === "high" ? "Urgent" : scenario.urgency === "medium" ? "Moderate" : "Common"}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy group-hover:text-saffron-dark">
        {scenario.title}
      </h3>
      <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-600">
        {scenario.shortDescription}
      </p>
      <div className="flex items-center justify-between">
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
          {scenario.category}
        </span>
        <span className="text-sm font-medium text-saffron-dark group-hover:underline">
          Read guide →
        </span>
      </div>
    </Link>
  );
}
