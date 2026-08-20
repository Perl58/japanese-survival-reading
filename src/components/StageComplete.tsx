import { useEffect, useRef } from "react";
import { COMPLETE_LINE } from "../lib/lines";
import { usePresenter } from "../context/PresenterContext";
import SakuraOverlay from "./SakuraOverlay";
import type { AnsweredEntry } from "../App";
import type { VocabWord } from "../types";

interface Props {
  score: number;
  total: number;
  answers: AnsweredEntry[];
  /** e.g. "Stage 1-2" */
  stageLabel: string;
  /** True once every Stage 1 sub-stage has been completed at least once. */
  isFullClear: boolean;
  /** e.g. "Stage 1-3" — omitted once there's no next sub-stage to unlock. */
  nextLabel?: string;
  onHome: () => void;
  onRetry: () => void;
}

/** Collapses answers to one entry per word (first-seen order), keeping the
 * word if it was ever missed so the review list can flag it. */
function dedupeWords(
  answers: AnsweredEntry[],
  onlyWrong: boolean,
): VocabWord[] {
  const seen = new Map<string, VocabWord>();
  const wrongIds = new Set(
    answers.filter((a) => !a.correct).map((a) => a.word.id),
  );
  for (const a of answers) {
    if (onlyWrong && !wrongIds.has(a.word.id)) continue;
    if (!seen.has(a.word.id)) seen.set(a.word.id, a.word);
  }
  return Array.from(seen.values());
}

function WordRow({ word }: { word: VocabWord }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-3 py-2">
      <span className="text-xl">{word.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-extrabold text-stone-900">
          {word.kanji}
          {word.hiragana && (
            <span className="ml-2 text-xs font-medium text-stone-400">
              {word.hiragana}
            </span>
          )}
        </p>
      </div>
      <p className="shrink-0 text-xs font-medium text-stone-500">
        {word.english}
      </p>
    </div>
  );
}

export default function StageComplete({
  score,
  total,
  answers,
  stageLabel,
  isFullClear,
  nextLabel,
  onHome,
  onRetry,
}: Props) {
  const { speak, bigCelebrate, waitUntilIdle } = usePresenter();
  const pct = Math.round((score / total) * 100);
  const spoken = useRef(false);

  const practiced = dedupeWords(answers, false);
  const reviewAgain = dedupeWords(answers, true);

  useEffect(() => {
    if (spoken.current) return;
    spoken.current = true;
    (async () => {
      await speak(COMPLETE_LINE, { emotion: "joy", intensity: "high" });
      // "バンザイ" finale: reuses the Raisehand "two-hands-up cheer" pose
      // (see PresenterContext's bigCelebrate), played twice for a bigger
      // finish than the mid-quiz milestone cheer.
      await waitUntilIdle();
      bigCelebrate();
      await new Promise((resolve) => setTimeout(resolve, 500));
      bigCelebrate();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex h-full flex-col px-6 pb-8 pt-12 text-center">
      {isFullClear && <SakuraOverlay />}

      <div className="flex-1">
        <div className="text-6xl">{isFullClear ? "🌸" : "🎉"}</div>
        <h1 className="mt-4 text-2xl font-extrabold text-stone-900">
          {isFullClear ? "Stage 1 All Clear!" : `${stageLabel} Complete!`}
        </h1>

        <div className="mt-6 rounded-2xl bg-stone-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
            Your Score
          </p>
          <p className="mt-1 text-4xl font-extrabold text-stone-900">
            {score}
            <span className="text-lg font-medium text-stone-400">
              {" "}
              / {total}
            </span>
          </p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wide text-stone-400">
            {pct}% correct
          </p>
        </div>

        {practiced.length > 0 && (
          <div className="mt-8 text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">
              Words you practiced
            </p>
            <div className="flex flex-col gap-1.5">
              {practiced.map((w) => (
                <WordRow key={w.id} word={w} />
              ))}
            </div>
          </div>
        )}

        {reviewAgain.length > 0 && (
          <div className="mt-6 text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-rose-400">
              Review these again
            </p>
            <div className="flex flex-col gap-1.5">
              {reviewAgain.map((w) => (
                <WordRow key={w.id} word={w} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-left">
          <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">
            Next up
          </p>
          {nextLabel ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm font-bold text-emerald-600">
              <span className="text-lg">▶️</span>
              {nextLabel} unlocked!
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-stone-200 px-3 py-3 text-sm text-stone-400">
              <span className="text-lg grayscale">🛍️</span>
              Stage 2 · Shopping — locked
            </div>
          )}
        </div>

        <p className="mt-8 text-sm font-semibold text-rose-500">
          "Not perfect, but enough."
        </p>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-stone-500">
          You can now recognize some of the Japanese you'll encounter while
          getting around Japan.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={onRetry}
          className="w-full rounded-2xl border-2 border-stone-200 px-6 py-3 text-base font-bold text-stone-600 transition active:scale-95"
        >
          Retry {stageLabel}
        </button>
        <button
          onClick={onHome}
          className="w-full rounded-2xl bg-rose-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-rose-500/30 transition active:scale-95"
        >
          Back to Stages
        </button>
      </div>
    </div>
  );
}
