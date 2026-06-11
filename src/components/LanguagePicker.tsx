"use client";

import { LANGUAGES, type Language } from "@/lib/languages";

interface LanguagePickerProps {
  onSelect: (language: Language) => void;
}

export default function LanguagePicker({ onSelect }: LanguagePickerProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6 sm:p-10">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-saffron to-saffron-dark text-3xl text-white shadow-lg">
          ⚖
        </div>
        <h2 className="text-xl font-bold text-navy sm:text-2xl">Choose your language</h2>
        <p className="mt-2 text-sm text-slate-500">
          अपनी भाषा चुनें · तुमची भाषा निवडा
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Select the language you&apos;d like to chat in
        </p>
      </div>

      <div className="grid w-full max-w-md gap-3">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.id}
            onClick={() => onSelect(lang.id)}
            className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition-all hover:border-saffron hover:shadow-md"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy/5 text-lg font-bold text-navy transition-colors group-hover:bg-saffron/10 group-hover:text-saffron-dark">
              {lang.greeting}
            </span>
            <div>
              <p className="font-semibold text-navy">{lang.nativeLabel}</p>
              <p className="text-sm text-slate-500">{lang.label}</p>
            </div>
            <span className="ml-auto text-slate-300 transition-colors group-hover:text-saffron">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
