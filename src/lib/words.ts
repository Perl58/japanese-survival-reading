import type { Question, VocabWord } from "../types";

/** Unique words referenced by a question set, in first-appearance order. */
export function uniqueWords(questions: Question[]): VocabWord[] {
  const seen = new Map<string, VocabWord>();
  for (const q of questions) {
    if (!seen.has(q.word.id)) seen.set(q.word.id, q.word);
  }
  return Array.from(seen.values());
}
