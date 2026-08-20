import { useEffect, useState } from "react";
import { usePresenter } from "../context/PresenterContext";
import { stage1SubStages } from "../data/subStages";
import { GREETING_LINE } from "../lib/lines";
import { hasSeenGreeting, isSubStageUnlocked, markGreetingSeen } from "../lib/progress";
import { uniqueWords } from "../lib/words";

interface Props {
  isDemo?: boolean;
  demoQuestionCount?: number;
  completedSubStages: string[];
  onStartDemo: () => void;
  onStartSubStage: (index: number) => void;
  onOpenLanguage: () => void;
}

const futureStages = [
  { icon: "🛍️", label: "Shopping" },
  { icon: "🏠", label: "Daily Life" },
  { icon: "🍜", label: "Food" },
  { icon: "🏥", label: "Hospital" },
];

export default function HomeScreen({
  isDemo,
  demoQuestionCount,
  completedSubStages,
  onStartDemo,
  onStartSubStage,
  onOpenLanguage,
}: Props) {
  const { unlockAudio, speak } = usePresenter();
  const [lockedStage, setLockedStage] = useState<string | null>(null);

  // Self-introduction, once ever — not on every home screen visit, so
  // returning players aren't greeted again each time they back out of a
  // stage. NOTE: today speak() has no real audio (caption + mouth-flap
  // only), so firing this on mount is safe. Once real VOICEVOX audio lands
  // (Phase 2), browsers will block autoplay of real <audio> without a user
  // gesture — at that point this will need to move behind the player's
  // first tap instead of running on mount.
  useEffect(() => {
    if (isDemo || hasSeenGreeting()) return;
    markGreetingSeen();
    speak(GREETING_LINE, { emotion: "joy" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStartDemo() {
    unlockAudio();
    onStartDemo();
  }

  function handleStartSubStage(index: number) {
    unlockAudio();
    onStartSubStage(index);
  }

  return (
    <div className="flex h-full flex-col px-6 pb-8 pt-6 text-center">
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <div className="flex-1" />
          <h1 className="flex-1 text-2xl font-extrabold tracking-tight text-stone-900">
            Japanese Survival Reading
          </h1>
          <div className="flex flex-1 justify-end">
            <button
              onClick={onOpenLanguage}
              className="rounded-full bg-stone-100 px-2.5 py-1.5 text-sm"
              aria-label="Language settings"
            >
              🌐
            </button>
          </div>
        </div>
        {isDemo && (
          <span className="mt-2 inline-block rounded-full bg-stone-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            Showcase Demo
          </span>
        )}
        <p className="mt-1 text-sm font-medium text-rose-500">
          Not perfect, but enough. 🇯🇵
        </p>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-stone-500">
          Your AI Japanese teacher helps you read just enough to get around
          Japan — stations, exits, taxis, and signs.
        </p>

        {isDemo ? (
          <div className="mt-6 rounded-2xl border-2 border-rose-200 bg-rose-50/50 p-4 text-left">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-rose-400">
                Demo
              </p>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-600">
                Unlocked
              </span>
            </div>
            <p className="mt-1 text-lg font-extrabold text-stone-900">
              Getting Around Japan
            </p>
            <p className="mt-1 text-xs text-stone-400">
              {demoQuestionCount ?? 0} questions · ~2 min
            </p>
            <button
              onClick={handleStartDemo}
              className="mt-3 w-full rounded-2xl bg-rose-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-rose-500/30 transition active:scale-95"
            >
              Start Demo · 10 questions
            </button>
          </div>
        ) : (
          <div className="mt-6 text-left">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-stone-400">
              Stage 1 · Getting Around Japan
            </p>
            <div className="flex flex-col gap-2">
              {stage1SubStages.map((sub, i) => {
                const completed = completedSubStages.includes(sub.id);
                const unlocked = isSubStageUnlocked(
                  stage1SubStages,
                  i,
                  completedSubStages,
                );
                const words = uniqueWords(sub.questions);
                return (
                  <button
                    key={sub.id}
                    disabled={!unlocked}
                    onClick={() => unlocked && handleStartSubStage(i)}
                    className={[
                      "rounded-2xl border-2 p-4 text-left transition active:scale-95",
                      completed
                        ? "border-emerald-200 bg-emerald-50"
                        : unlocked
                          ? "border-rose-200 bg-rose-50/50"
                          : "border-stone-200 bg-stone-50 opacity-60",
                    ].join(" ")}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-extrabold text-stone-900">
                        {sub.label}
                      </p>
                      <span className="text-lg">
                        {completed ? "✅" : unlocked ? "▶️" : "🔒"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-stone-400">
                      {sub.questions.length} questions · {words.length} words
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!isDemo && (
          <div className="mt-8 text-left">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                More stages
              </p>
              <button
                onClick={() => setLockedStage("Unlock All Stages")}
                className="text-[11px] font-bold text-rose-400"
              >
                Unlock All →
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {futureStages.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setLockedStage(s.label)}
                  className="flex items-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-400 transition active:scale-95"
                >
                  <span className="text-lg grayscale">{s.icon}</span>
                  <span>{s.label}</span>
                  <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-stone-300">
                    🔒
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {lockedStage && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => setLockedStage(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-3xl bg-white p-6 text-center shadow-xl sm:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-4xl">🔒</div>
            <h2 className="mt-3 text-lg font-extrabold text-stone-900">
              {lockedStage === "Unlock All Stages"
                ? "Unlock All Stages"
                : `${lockedStage} is locked`}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              More stages are on the way. Stage 1 · Getting Around Japan is
              free to play right now.
            </p>
            <button
              onClick={() => setLockedStage(null)}
              className="mt-6 w-full rounded-2xl bg-stone-900 px-6 py-3 text-base font-bold text-white transition active:scale-95"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
