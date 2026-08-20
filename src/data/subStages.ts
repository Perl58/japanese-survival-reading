import { stage1Questions } from "./stage1";
import type { Question } from "../types";

export interface SubStageDef {
  /** e.g. "1-1" */
  id: string;
  /** 0-based position within the stage. */
  index: number;
  /** e.g. "Stage 1-1" */
  label: string;
  questions: Question[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// 68 questions split into 4 even sub-stages of 17 each (chosen over an
// uneven 20/20/20/8 split so every sitting feels the same length — see
// project notes). Each sub-stage is a self-contained "session": short
// enough to finish in one sitting (Duolingo-lesson-length, ~15-20
// exercises), unlocked in order as the previous one is completed.
export const stage1SubStages: SubStageDef[] = chunk(stage1Questions, 17).map(
  (questions, i) => ({
    id: `1-${i + 1}`,
    index: i,
    label: `Stage 1-${i + 1}`,
    questions,
  }),
);
