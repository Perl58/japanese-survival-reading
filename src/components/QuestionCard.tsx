import { useEffect, useMemo, useRef, useState } from "react";
import type { Question } from "../types";
import { shuffledChoices } from "../lib/shuffle";
import {
  GREETING_LINE,
  askLine,
  milestoneLine,
  reactionLine,
} from "../lib/lines";
import { usePresenter } from "../context/PresenterContext";

interface Props {
  question: Question;
  isFirst: boolean;
  /** Score *before* this question is answered. */
  score: number;
  onAnswered: (question: Question, correct: boolean) => void;
  onNext: () => void;
}

export default function QuestionCard({
  question,
  isFirst,
  score,
  onAnswered,
  onNext,
}: Props) {
  const { speak, celebrate, bigCelebrate, waitUntilIdle, unlockAudio } =
    usePresenter();
  const { choices, correctIndex } = useMemo(
    () => shuffledChoices(question.choices, question.correctIndex),
    [question],
  );
  const [selected, setSelected] = useState<number | null>(null);
  const lastSpokenId = useRef<string | null>(null);

  useEffect(() => {
    setSelected(null);
    // Guards against React StrictMode's dev-only double-invoke firing speak()
    // twice for the same question (the second call would interrupt the first
    // mid-sentence).
    if (lastSpokenId.current === question.id) return;
    lastSpokenId.current = question.id;
    const line = isFirst ? `${GREETING_LINE} ${askLine(question)}` : askLine(question);
    speak(line);
    // Only re-run when the question itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question]);

  const answered = selected !== null;
  const isCorrect = selected === correctIndex;

  async function pick(i: number) {
    if (answered) return;
    unlockAudio();
    setSelected(i);
    const correct = i === correctIndex;
    onAnswered(question, correct);

    const newScore = correct ? score + 1 : score;
    // Every 5 correct: a solid cheer. Every 10 (a subset of every-5): an
    // extra-exaggerated double cheer, per the "5問→たくさん褒める /
    // 10問→おおげさにたくさん褒める" spec.
    const isBigMilestone = correct && newScore % 10 === 0;
    const isMilestone = correct && !isBigMilestone && newScore % 5 === 0;
    const joyOptions = correct
      ? ({ emotion: "joy", intensity: "high" } as const)
      : undefined;

    await speak(reactionLine(question, correct), joyOptions);

    if (isBigMilestone) {
      // playMotion() competes with present()'s Talking animation for the
      // same priority slot, so it can render invisibly if fired while she's
      // still speaking — wait for the reaction line to finish first so the
      // cheer motions are clearly visible on their own.
      await waitUntilIdle();
      bigCelebrate();
      await new Promise((resolve) => setTimeout(resolve, 500));
      bigCelebrate(); // repeat once more for the exaggerated 10-question cheer
      await new Promise((resolve) => setTimeout(resolve, 700));
      speak(milestoneLine(newScore), joyOptions);
    } else if (isMilestone) {
      await waitUntilIdle();
      bigCelebrate();
      await new Promise((resolve) => setTimeout(resolve, 600));
      speak(milestoneLine(newScore), joyOptions);
    } else if (correct) {
      celebrate();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="rounded-2xl bg-stone-50 p-4 text-center">
        <p className="text-2xl font-bold text-stone-900">
          {question.situationJa}
        </p>
        <p className="mt-1 text-xs text-stone-400">{question.situationEn}</p>
      </div>

      <p className="mt-6 text-center text-base font-semibold text-stone-700">
        {question.prompt}
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {choices.map((choice, i) => {
          const isSelected = selected === i;
          const showCorrect = answered && i === correctIndex;
          const showWrong = answered && isSelected && i !== correctIndex;

          return (
            <button
              key={choice}
              onClick={() => pick(i)}
              disabled={answered}
              className={[
                "rounded-2xl border-2 px-4 py-3 text-left text-lg font-bold transition",
                showCorrect
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : showWrong
                    ? "border-rose-300 bg-rose-50 text-rose-500"
                    : "border-stone-200 bg-white text-stone-800 active:scale-[0.98]",
              ].join(" ")}
            >
              <span className="mr-2 text-sm font-semibold text-stone-300">
                {String.fromCharCode(65 + i)}
              </span>
              {choice}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-6 flex flex-1 flex-col">
          <div
            className={[
              "rounded-2xl p-4",
              isCorrect ? "bg-emerald-50" : "bg-rose-50",
            ].join(" ")}
          >
            <p
              className={[
                "text-sm font-bold",
                isCorrect ? "text-emerald-600" : "text-rose-500",
              ].join(" ")}
            >
              {isCorrect ? "Correct!" : "Not quite!"}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl">{question.word.icon}</span>
              <div>
                <p className="text-xl font-extrabold text-stone-900">
                  {question.word.kanji}
                  {question.word.hiragana && (
                    <span className="ml-2 text-base font-medium text-stone-400">
                      {question.word.hiragana}
                    </span>
                  )}
                </p>
                <p className="text-sm text-stone-500">
                  {question.word.english}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onNext}
            className="mt-auto w-full rounded-2xl bg-stone-900 px-6 py-4 text-lg font-bold text-white shadow-lg transition active:scale-95"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
