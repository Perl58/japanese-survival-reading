import { stage1Questions } from "./stage1";
import type { Question } from "../types";

// Curated 10-question set for the quick showcase/booth demo — finishes in
// ~2 minutes instead of the full ~8-minute, 68-question Stage 1 deck.
// Covers the requested words (station, train, east/west exit, taxi, bus);
// 地下鉄 (subway) was dropped to land on exactly 10 questions since 電車
// already represents "train" travel and 東口/西口 were explicitly requested
// as a pair.
// Sourced by question id from stage1Questions so wording/choices always
// stay in sync with Stage 1 — no duplicated question content to maintain.
const DEMO_QUESTION_IDS = [
  "station-reading",
  "station-meaning",
  "train-reading",
  "train-meaning",
  "east-exit-reading",
  "east-exit-meaning",
  "west-exit-reading",
  "west-exit-meaning",
  "taxi-meaning",
  "bus-meaning",
] as const;

export const demoQuestions: Question[] = DEMO_QUESTION_IDS.map((id) => {
  const q = stage1Questions.find((question) => question.id === id);
  if (!q) throw new Error(`Unknown demo question id: ${id}`);
  return q;
});
