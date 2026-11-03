"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  documentCategories,
  draftTypes,
  type DocumentCategory,
  type DraftType,
  type RiskSeverity,
} from "@/data/document-types";
import { getSampleDocument } from "@/data/sample-documents";
import type { DocumentAnalysis, DraftResult } from "@/lib/document-tools";
import { formatLawsForGrounds, matchLawsFromProblem } from "@/lib/ipc-matcher";

type Tab = "analyze" | "draft";

const severityStyles: Record<RiskSeverity, string> = {
  high: "border-red-300 bg-red-50 text-red-900",
  medium: "border-amber-300 bg-amber-50 text-amber-900",
  low: "border-slate-300 bg-slate-50 text-slate-700",
};

const severityLabels: Record<RiskSeverity, string> = {
  high: "High Risk",
  medium: "Medium Risk",
  low: "Low Risk",
};

function renderInline(text: string, key: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${key}-${i}`} className="font-semibold text-navy">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={`${key}-${i}`}>{part}</span>;
  });
}

export default function DocumentTools() {
  const [tab, setTab] = useState<Tab>("analyze");
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);

  // Analyze state
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [documentText, setDocumentText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [analyzeRetryable, setAnalyzeRetryable] = useState(false);
  const [analyzeStatus, setAnalyzeStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draft state
  const [draftType, setDraftType] = useState<DraftType>("rti");
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState(false);
  const [draft, setDraft] = useState<(DraftResult & { aiPowered?: boolean }) | null>(null);
  const [draftError, setDraftError] = useState<string | null>(null);
  const [draftRetryable, setDraftRetryable] = useState(false);
  const [copied, setCopied] = useState(false);
  const [legalGroundsTouched, setLegalGroundsTouched] = useState(false);

  const checkAIStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/documents/analyze");
      const data = await res.json();
      setAiEnabled(data.aiEnabled);
    } catch {
      setAiEnabled(false);
    }
  }, []);

  useEffect(() => {
    checkAIStatus();
  }, [checkAIStatus]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ["text/plain", "application/json"];
    if (!allowed.includes(file.type) && !file.name.endsWith(".txt")) {
      setAnalyzeError("Please upload a .txt file or paste your document text directly.");
      return;
    }

    if (file.size > 500_000) {
      setAnalyzeError("File too large. Maximum size is 500 KB. Paste the text instead.");
      return;
    }

    const text = await file.text();
    setDocumentText(text);
    setFileName(file.name);
    setAnalyzeError(null);
    setAnalysis(null);
  };

  const handleLoadSample = () => {
    const sample = getSampleDocument(category);
    setDocumentText(sample.text);
    setFileName(sample.label);
    setAnalysis(null);
    setAnalyzeError(null);
  };

  const handleAnalyze = async () => {
    if (!documentText.trim()) {
      setAnalyzeError("Please paste or upload your document text.");
      return;
    }

    setAnalyzing(true);
    setAnalyzeError(null);
    setAnalyzeRetryable(false);
    setAnalyzeStatus("Reading your document and checking for risks…");
    setAnalysis(null);

    const statusTimer = window.setTimeout(() => {
      setAnalyzeStatus("Extracting dates, amounts, and important clauses…");
    }, 3000);

    try {
      const res = await fetch("/api/documents/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: documentText, category }),
      });

      const data = await res.json();
      if (!res.ok) {
        setAnalyzeError(data.error || "Analysis failed. Please try again.");
        setAnalyzeRetryable(Boolean(data.retryable));
        return;
      }
      setAnalysis(data);
    } catch {
      setAnalyzeError("Could not reach the server. Check your connection and try again.");
      setAnalyzeRetryable(true);
    } finally {
      window.clearTimeout(statusTimer);
      setAnalyzeStatus(null);
      setAnalyzing(false);
    }
  };

  const handleGenerateDraft = async () => {
    setGenerating(true);
    setDraftError(null);
    setDraftRetryable(false);
    setDraft(null);

    try {
      const res = await fetch("/api/documents/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draftType, formData }),
      });

      const data = await res.json();
      if (!res.ok) {
        setDraftError(data.error || "Draft generation failed. Please try again.");
        setDraftRetryable(Boolean(data.retryable));
        return;
      }
      setDraft(data);
    } catch {
      setDraftError("Could not reach the server. Check your connection and try again.");
      setDraftRetryable(true);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyDraft = async () => {
    if (!draft?.draft) return;
    await navigator.clipboard.writeText(draft.draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedDraft = draftTypes.find((d) => d.id === draftType)!;
  const matchedNoticeLaws =
    draftType === "legal-notice"
      ? matchLawsFromProblem(
          `${formData.subject ?? ""}\n${formData.facts ?? ""}\n${formData.demand ?? ""}`
        )
      : [];

  const updateDraftField = (id: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [id]: value };
      if (
        draftType === "legal-notice" &&
        !legalGroundsTouched &&
        (id === "subject" || id === "facts" || id === "demand")
      ) {
        next.legalGrounds = formatLawsForGrounds(
          matchLawsFromProblem(
            `${next.subject ?? ""}\n${next.facts ?? ""}\n${next.demand ?? ""}`
          )
        );
      }
      return next;
    });
    if (id === "legalGrounds") setLegalGroundsTouched(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-1">
        {(
          [
            { id: "analyze" as Tab, label: "Analyze Document", icon: "🔍" },
            { id: "draft" as Tab, label: "Generate Draft", icon: "✍️" },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.id
                ? "bg-white text-navy shadow-sm"
                : "text-slate-600 hover:text-navy"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "analyze" && (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-navy">Document Type</label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {documentCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    category === cat.id
                      ? "border-saffron bg-saffron/5 ring-1 ring-saffron"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="mb-1 block text-xl">{cat.icon}</span>
                  <span className="block text-sm font-semibold text-navy">{cat.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{cat.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <label className="text-sm font-medium text-navy">Document Text</label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="rounded-lg border border-saffron/30 bg-saffron/10 px-3 py-1.5 text-xs font-medium text-saffron-dark transition-colors hover:bg-saffron/20"
                >
                  Load sample
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Upload .txt
                </button>
                {fileName && (
                  <span className="text-xs text-slate-500">{fileName}</span>
                )}
              </div>
            </div>
            <textarea
              value={documentText}
              onChange={(e) => {
                setDocumentText(e.target.value);
                setFileName(null);
                setAnalysis(null);
              }}
              placeholder="Paste your FIR copy, legal notice, rental agreement, court summons, or any legal document here..."
              rows={10}
              className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
            />
            <p className="mt-2 text-xs text-slate-500">
              Paste text from PDFs or scanned documents. For privacy, documents are not stored.
            </p>

            {analyzeStatus && analyzing && (
              <p className="mt-3 text-sm text-slate-600">{analyzeStatus}</p>
            )}

            {analyzeError && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-800">{analyzeError}</p>
                {analyzeRetryable && (
                  <button
                    type="button"
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-900 disabled:opacity-50"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzing || !documentText.trim()}
              className="mt-4 rounded-xl bg-navy px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
            >
              {analyzing ? "Analyzing…" : "Analyze Document"}
            </button>
          </div>

          {analysis && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-navy">Case Summary</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{analysis.detectedType}</p>
                </div>
                <p className="text-sm leading-relaxed text-slate-700">{analysis.summary}</p>
              </div>

              {analysis.keyPoints.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold text-navy">Key Information</h3>
                  <ul className="space-y-2">
                    {analysis.keyPoints.map((point, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-saffron-dark">•</span>
                        {renderInline(point, `kp-${i}`)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.deadlines.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-red-900">
                    <span>⏰</span> Important Deadlines
                  </h3>
                  <ul className="space-y-1.5">
                    {analysis.deadlines.map((d, i) => (
                      <li key={i} className="text-sm text-red-800">
                        • {d}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.riskClauses.length > 0 && (
                <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-1 flex items-center gap-2 text-lg font-bold text-red-700">
                    <span>🚩</span> Clause Risk Highlighter
                  </h3>
                  <p className="mb-4 text-xs text-slate-500">
                    Potentially unfair or risky terms flagged for your review
                  </p>
                  <div className="space-y-3">
                    {analysis.riskClauses.map((risk, i) => (
                      <div
                        key={i}
                        className={`rounded-xl border p-4 ${severityStyles[risk.severity]}`}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">
                            {severityLabels[risk.severity]}
                          </span>
                        </div>
                        <blockquote className="mb-2 border-l-4 border-red-400 pl-3 text-sm font-medium italic">
                          &ldquo;{risk.clause}&rdquo;
                        </blockquote>
                        <p className="text-sm">{risk.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.suggestedActions.length > 0 && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
                  <h3 className="mb-3 text-sm font-bold text-blue-900">What To Do</h3>
                  <ol className="space-y-2">
                    {analysis.suggestedActions.map((action, i) => (
                      <li key={i} className="flex gap-2 text-sm text-blue-900">
                        <span className="font-semibold">{i + 1}.</span>
                        {action}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {analysis.measuresToTake && analysis.measuresToTake.length > 0 && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6">
                  <h3 className="mb-3 text-sm font-bold text-emerald-900">Measures To Take</h3>
                  <ul className="space-y-2">
                    {analysis.measuresToTake.map((measure, i) => (
                      <li key={i} className="flex gap-2 text-sm text-emerald-900">
                        <span className="text-emerald-600">✓</span>
                        {measure}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs text-slate-500">{analysis.disclaimer}</p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/ask"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
                >
                  Ask a follow-up question →
                </Link>
                <Link
                  href="/lawyers"
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-navy transition-colors hover:bg-slate-50"
                >
                  Find free legal aid →
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "draft" && (
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-navy">Draft Type</label>
            <div className="grid gap-3 sm:grid-cols-3">
              {draftTypes.map((dt) => (
                <button
                  key={dt.id}
                  type="button"
                  onClick={() => {
                    setDraftType(dt.id);
                    setFormData({});
                    setDraft(null);
                    setLegalGroundsTouched(false);
                  }}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    draftType === dt.id
                      ? "border-saffron bg-saffron/5 ring-1 ring-saffron"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="mb-1 block text-xl">{dt.icon}</span>
                  <span className="block text-sm font-semibold text-navy">{dt.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{dt.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-navy">
              Fill in the details for your {selectedDraft.label}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {selectedDraft.fields.map((field) => (
                <div
                  key={field.id}
                  className={field.multiline ? "sm:col-span-2" : undefined}
                >
                  <label className="mb-1.5 block text-xs font-medium text-slate-700">
                    {field.label}
                    {field.required && <span className="text-red-500"> *</span>}
                  </label>
                  {field.multiline ? (
                    <textarea
                      value={formData[field.id] ?? ""}
                      onChange={(e) => updateDraftField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[field.id] ?? ""}
                      onChange={(e) => updateDraftField(field.id, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-saffron focus:outline-none focus:ring-2 focus:ring-saffron/20"
                    />
                  )}
                </div>
              ))}
            </div>

            {draftType === "legal-notice" && (
              <div className="mt-4 rounded-xl border border-navy/15 bg-navy/[0.03] p-4">
                <h4 className="mb-1 text-sm font-bold text-navy">IPC sections from your problem</h4>
                <p className="mb-3 text-xs text-slate-500">
                  These are added automatically from the subject and facts. They will be inserted
                  into the legal notice. A lawyer should confirm them before you send it.
                </p>
                {matchedNoticeLaws.length === 0 ? (
                  <p className="text-sm text-slate-600">
                    Describe the issue (for example cheque bounce, cheating, threats, or unpaid
                    dues) to auto-detect IPC / related sections.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {matchedNoticeLaws.map((law) => (
                      <li
                        key={`${law.act}-${law.section}`}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <p className="text-sm font-semibold text-navy">
                          {law.section} {law.act} — {law.title}
                        </p>
                        {law.bnsEquivalent && (
                          <p className="text-xs text-slate-500">{law.bnsEquivalent}</p>
                        )}
                        <p className="mt-0.5 text-xs text-slate-600">{law.why}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {draftError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-sm text-red-800">{draftError}</p>
                {draftRetryable && (
                  <button
                    type="button"
                    onClick={handleGenerateDraft}
                    disabled={generating}
                    className="mt-2 text-sm font-semibold text-red-700 underline hover:text-red-900 disabled:opacity-50"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerateDraft}
              disabled={generating}
              className="mt-6 rounded-xl bg-saffron px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-saffron-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {generating ? "Generating Draft…" : "Generate Draft"}
            </button>
          </div>

          {draft && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-navy">{draft.title}</h3>
                <button
                  type="button"
                  onClick={handleCopyDraft}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  {copied ? "Copied!" : "Copy to Clipboard"}
                </button>
              </div>

              <pre className="max-h-96 overflow-auto whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-800">
                {draft.draft}
              </pre>

              {draft.appliedLaws && draft.appliedLaws.length > 0 && (
                <div className="mt-4 rounded-xl border border-navy/15 bg-navy/[0.03] p-4">
                  <h4 className="mb-2 text-sm font-bold text-navy">IPC / laws inserted in this notice</h4>
                  <ul className="space-y-1.5">
                    {draft.appliedLaws.map((law) => (
                      <li key={`${law.act}-${law.section}`} className="text-sm text-slate-700">
                        • {law.citation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {draft.instructions.length > 0 && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/50 p-4">
                  <h4 className="mb-2 text-sm font-bold text-blue-900">How to Use This Draft</h4>
                  <ol className="space-y-1.5">
                    {draft.instructions.map((inst, i) => (
                      <li key={i} className="text-sm text-blue-900">
                        {i + 1}. {inst}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <p className="mt-4 text-xs text-slate-500">{draft.disclaimer}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
