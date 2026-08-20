import { usePresenter } from "../context/PresenterContext";
import type { VocabWord } from "../types";

interface Props {
  words: VocabWord[];
  isDemo?: boolean;
  /** e.g. "Stage 1-2" — falls back to "Stage 1" for the demo showcase. */
  label?: string;
  onBack: () => void;
  onBegin: () => void;
}

export default function StageIntro({
  words,
  isDemo,
  label,
  onBack,
  onBegin,
}: Props) {
  const { unlockAudio } = usePresenter();
  const kanjiWords = words.filter((w) => w.hiragana);
  const katakanaWords = words.filter((w) => !w.hiragana);

  function handleBegin() {
    unlockAudio();
    onBegin();
  }

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
          {isDemo ? "Demo" : (label ?? "Stage 1")}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-stone-900">
          Getting Around Japan
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          You'll meet these words the moment you land — at the airport, on
          the train, and finding your way through the station. Read them in
          real situations, not as a list to memorize.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2 overflow-y-auto">
        {[...kanjiWords, ...katakanaWords].map((w) => (
          <div
            key={w.id}
            className="flex flex-col items-center gap-1 rounded-xl bg-stone-50 py-3"
          >
            <span className="text-xl">{w.icon}</span>
            <span className="text-sm font-bold text-stone-800">
              {w.kanji}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <button
          onClick={handleBegin}
          className="w-full rounded-2xl bg-rose-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-rose-500/30 transition active:scale-95"
        >
          Let's go →
        </button>
      </div>
    </div>
  );
}
