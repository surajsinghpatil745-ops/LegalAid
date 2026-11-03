import DocumentTools from "@/components/DocumentTools";

export const metadata = {
  title: "Document Tools — Summarize & Draft Legal Documents",
  description:
    "Upload FIR copies, legal notices, rental agreements, or court summons for AI-powered plain-language summaries and clause risk highlighting. Generate RTI applications, consumer complaints, and legal notices.",
};

export default function DocumentsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-saffron/30 bg-saffron/10 px-3 py-1 text-xs font-medium text-saffron-dark">
          📄 Document Tools
        </p>
        <h1 className="text-2xl font-bold text-navy sm:text-3xl">
          Understand & Draft Legal Documents
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
          Upload your FIR copy, legal notice, rental agreement, or court summons for an instant
          plain-language summary. Risky clauses are flagged in red. Generate RTI applications,
          consumer complaints, and legal notices in minutes. For a legal notice, relevant IPC
          sections are added automatically from the problem you describe.
        </p>
      </div>
      <DocumentTools />
    </div>
  );
}
