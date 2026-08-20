import { useState } from "react";

interface LanguageDef {
  code: string;
  label: string;
  nativeLabel: string;
  flag: string;
  /** English is the language the app is currently written in — everything
   * else is a translation that ships behind the paywall. */
  free: boolean;
}

const LANGUAGES: LanguageDef[] = [
  { code: "en", label: "English", nativeLabel: "English", flag: "🇺🇸", free: true },
  { code: "zh-Hans", label: "Chinese (Simplified)", nativeLabel: "中文（简体）", flag: "🇨🇳", free: false },
  { code: "zh-Hant", label: "Chinese (Traditional)", nativeLabel: "中文（繁體）", flag: "🇹🇼", free: false },
  { code: "ko", label: "Korean", nativeLabel: "한국어", flag: "🇰🇷", free: false },
  { code: "es", label: "Spanish", nativeLabel: "Español", flag: "🇪🇸", free: false },
  { code: "fr", label: "French", nativeLabel: "Français", flag: "🇫🇷", free: false },
  { code: "vi", label: "Vietnamese", nativeLabel: "Tiếng Việt", flag: "🇻🇳", free: false },
  { code: "th", label: "Thai", nativeLabel: "ภาษาไทย", flag: "🇹🇭", free: false },
];

interface Props {
  onBack: () => void;
}

export default function LanguagePage({ onBack }: Props) {
  const lockedCount = LANGUAGES.filter((l) => !l.free).length;
  // TODO: wire to RevenueCat once the paywall is integrated. This is a
  // self-contained stub so the page is fully navigable/demoable before that
  // lands, without App.tsx needing to know about purchase state yet.
  const [requested, setRequested] = useState(false);

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-6">
      <button
        onClick={onBack}
        className="self-start text-sm font-medium text-stone-400"
      >
        ← Home
      </button>

      <div className="mt-4">
        <p className="text-xs font-bold uppercase tracking-wide text-rose-400">
          Language
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-stone-900">
          App Language
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          The app currently runs in English. Unlock the rest to use it — and
          get situation explanations — in your own language.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-2 overflow-y-auto">
        {LANGUAGES.map((lang) => (
          <div
            key={lang.code}
            className={[
              "flex items-center gap-3 rounded-2xl border-2 px-4 py-3",
              lang.free
                ? "border-emerald-200 bg-emerald-50"
                : "border-stone-200 bg-stone-50",
            ].join(" ")}
          >
            <span className="text-2xl">{lang.flag}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-bold text-stone-900">
                {lang.nativeLabel}
              </p>
              <p className="truncate text-xs text-stone-400">{lang.label}</p>
            </div>
            {lang.free ? (
              <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                Current
              </span>
            ) : (
              <span className="shrink-0 text-lg text-stone-300" aria-label="locked">
                🔒
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={() => setRequested(true)}
          className="w-full rounded-2xl bg-rose-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-rose-500/30 transition active:scale-95"
        >
          Unlock all {lockedCount} languages
        </button>
        <p className="mt-2 text-center text-xs text-stone-400">
          {requested
            ? "Purchases aren't set up yet — coming soon!"
            : "One purchase unlocks every language, on this device."}
        </p>
      </div>
    </div>
  );
}
