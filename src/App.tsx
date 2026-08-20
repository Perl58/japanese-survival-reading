import { useMemo, useState } from "react";
import HomeScreen from "./components/HomeScreen";
import StageIntro from "./components/StageIntro";
import QuestionCard from "./components/QuestionCard";
import StageComplete from "./components/StageComplete";
import ProgressBar from "./components/ProgressBar";
import AvatarStage from "./components/AvatarStage";
import LanguagePage from "./components/LanguagePage";
import { PresenterProvider } from "./context/PresenterContext";
import { stage1SubStages } from "./data/subStages";
import { demoQuestions } from "./data/demo";
import { uniqueWords } from "./lib/words";
import { getCompletedSubStages, markSubStageComplete } from "./lib/progress";
import type { Question, VocabWord } from "./types";

type Screen = "home" | "intro" | "quiz" | "complete" | "language";

export interface AnsweredEntry {
  word: VocabWord;
  correct: boolean;
}

function AppShell() {
  // ?demo=1 swaps in the 10-question quick showcase set instead of the
  // Stage 1 sub-stages — a quick, self-contained loop for live demos/booths.
  // Read once at mount; this app has no other routing, so it never needs to
  // react to the URL changing later.
  const [isDemo] = useState(
    () => new URLSearchParams(window.location.search).get("demo") === "1",
  );

  const [screen, setScreen] = useState<Screen>("home");
  const [activeSubStageIndex, setActiveSubStageIndex] = useState(0);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<AnsweredEntry[]>([]);
  const [completedSubStages, setCompletedSubStages] = useState<string[]>(() =>
    getCompletedSubStages(),
  );

  const activeSubStage = stage1SubStages[activeSubStageIndex];
  const questions: Question[] = isDemo ? demoQuestions : activeSubStage.questions;
  const words = useMemo(() => uniqueWords(questions), [questions]);
  const total = questions.length;

  function openSubStageIntro(subStageIndex: number) {
    setActiveSubStageIndex(subStageIndex);
    setScreen("intro");
  }

  function openDemoIntro() {
    setScreen("intro");
  }

  function startQuiz() {
    setIndex(0);
    setScore(0);
    setAnswers([]);
    setScreen("quiz");
  }

  function handleAnswered(question: Question, correct: boolean) {
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { word: question.word, correct }]);
  }

  function handleNext() {
    if (index + 1 >= total) {
      if (!isDemo) {
        markSubStageComplete(activeSubStage.id);
        setCompletedSubStages(getCompletedSubStages());
      }
      setScreen("complete");
    } else {
      setIndex((i) => i + 1);
    }
  }

  const isFullClear =
    !isDemo && activeSubStage.index === stage1SubStages.length - 1;
  const nextSubStage = isDemo
    ? undefined
    : stage1SubStages[activeSubStage.index + 1];

  return (
    <div className="flex h-svh justify-center bg-stone-100 sm:h-auto sm:py-6">
      <div className="flex h-svh w-full max-w-md flex-col bg-white shadow-xl sm:h-[780px] sm:rounded-[2rem] sm:border sm:border-stone-200">
        <AvatarStage />

        <div className="min-h-0 flex-1 overflow-y-auto">
          {screen === "home" && (
            <HomeScreen
              isDemo={isDemo}
              demoQuestionCount={demoQuestions.length}
              completedSubStages={completedSubStages}
              onStartDemo={openDemoIntro}
              onStartSubStage={openSubStageIntro}
              onOpenLanguage={() => setScreen("language")}
            />
          )}

          {screen === "language" && (
            <LanguagePage onBack={() => setScreen("home")} />
          )}

          {screen === "intro" && (
            <StageIntro
              words={words}
              isDemo={isDemo}
              label={activeSubStage.label}
              onBack={() => setScreen("home")}
              onBegin={startQuiz}
            />
          )}

          {screen === "quiz" && (
            <div className="flex h-full flex-col px-6 pb-8 pt-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScreen("home")}
                  className="text-sm font-medium text-stone-400"
                >
                  ✕
                </button>
                <div className="flex-1">
                  <ProgressBar current={index} total={total} />
                </div>
                <span className="text-xs font-bold text-stone-400">
                  {index + 1}/{total}
                </span>
              </div>
              <div className="mt-1 self-end text-xs font-bold text-rose-400">
                Score: {score}
              </div>

              <div className="mt-4 flex-1">
                <QuestionCard
                  key={questions[index].id}
                  question={questions[index]}
                  isFirst={index === 0}
                  score={score}
                  onAnswered={handleAnswered}
                  onNext={handleNext}
                />
              </div>
            </div>
          )}

          {screen === "complete" && (
            <StageComplete
              score={score}
              total={total}
              answers={answers}
              stageLabel={isDemo ? "Demo" : activeSubStage.label}
              isFullClear={isFullClear}
              nextLabel={nextSubStage?.label}
              onHome={() => setScreen("home")}
              onRetry={startQuiz}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PresenterProvider>
      <AppShell />
    </PresenterProvider>
  );
}
