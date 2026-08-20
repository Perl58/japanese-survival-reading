const KEY = "completedSubStages_v1";

/** IDs (e.g. "1-1") of sub-stages the player has finished at least once. */
export function getCompletedSubStages(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markSubStageComplete(id: string): void {
  const done = new Set(getCompletedSubStages());
  done.add(id);
  localStorage.setItem(KEY, JSON.stringify(Array.from(done)));
}

/** First sub-stage is always unlocked; every later one unlocks once the one
 * directly before it has been completed. */
export function isSubStageUnlocked(
  subStages: { id: string }[],
  index: number,
  completed: string[],
): boolean {
  if (index === 0) return true;
  return completed.includes(subStages[index - 1].id);
}

const GREETING_KEY = "hasSeenGreeting_v1";

/** True once the teacher's first-launch self-introduction has played. Used
 * to show GREETING_LINE (see lib/lines.ts) exactly once ever, not on every
 * home screen visit. */
export function hasSeenGreeting(): boolean {
  try {
    return localStorage.getItem(GREETING_KEY) === "1";
  } catch {
    return false;
  }
}

export function markGreetingSeen(): void {
  localStorage.setItem(GREETING_KEY, "1");
}
