import type { Question } from "../types";

// Spoken once ever, the first time a player reaches the home screen (see
// HomeScreen's hasSeenGreeting() check) — a self-introduction, not a
// per-visit line, so it doesn't get repetitive on every app open.
export const GREETING_LINE =
  "こんにちは！ひびきです。あなたの日本語の先生です。よろしくお願いします！";

export const COMPLETE_LINE =
  "すばらしい！最後までやりとげましたね！これで駅の日本語が少し読めるようになりましたよ。Not perfect, but enough!";

// Some single/short kanji (上, 下, 前, etc.) have multiple readings
// (e.g. 上 = うえ/じょう/かみ), and the TTS engine can't always pick the
// right one from context alone. For "meaning" questions this is a pure
// pronunciation bug worth fixing — the correct reading isn't the answer, so
// nothing is spoiled. For "reading" questions, the correct reading *is* the
// answer, so we deliberately leave the kanji as-is: speaking it correctly
// would give the answer away before the choices are even shown.
// Katakana words (empty hiragana) are already unambiguous either way.
function spokenKanji(q: Question): string {
  return q.type === "reading" || !q.word.hiragana
    ? q.word.kanji
    : q.word.hiragana;
}

function spokenSituation(q: Question): string {
  if (q.type === "reading" || !q.word.hiragana) return q.situationJa;
  return q.situationJa.split(q.word.kanji).join(q.word.hiragana);
}

export function askLine(q: Question): string {
  const ask =
    q.type === "reading"
      ? `「${q.word.kanji}」、読めますか？`
      : `「${spokenKanji(q)}」の意味、わかりますか？`;
  return `${spokenSituation(q)} ${ask}`;
}

// Every 5 correct answers (5, 15, 25, 35, ...): a solid, medium-sized praise.
const FIVE_MILESTONE_LINES = [
  "やったー！5問正解です！その調子！",
  "15問正解、すごくいい調子です！",
  "25問正解、その調子で続けましょう！",
  "35問正解、安定してますね！",
  "45問正解、あと少しで満点です！",
  "55問正解、まだまだ絶好調！",
  "65問正解、素晴らしい調子です！",
];

// Every 10 correct answers (10, 20, 30, ...): a bigger, more exaggerated
// praise — paired with a double bigCelebrate() in QuestionCard for a more
// over-the-top show than the every-5 milestone.
const TEN_MILESTONE_LINES = [
  "うわー！10問正解、天才かもしれません！！",
  "信じられない、20問正解です！！先生、感動しました！",
  "30問正解！！もう伝説級です！！",
  "40問正解、鳥肌ものです！！！",
  "50問正解、完全にマスターです！！！",
  "60問正解、もう先生超えてます！！！",
  "70問正解、歴代最高記録です！！！",
];

/** A bigger, once-every-5-correct-answers praise line. */
export function milestoneLine(score: number): string {
  if (score % 10 === 0) {
    const index = score / 10 - 1;
    return (
      TEN_MILESTONE_LINES[index] ?? `信じられない、${score}問正解です！！`
    );
  }
  const index = (score - 5) / 10;
  return FIVE_MILESTONE_LINES[index] ?? `やったー！${score}問正解です！`;
}

export function reactionLine(q: Question, correct: boolean): string {
  if (q.type === "reading") {
    return correct
      ? `そうです！「${q.word.kanji}」は「${q.word.hiragana}」です。Good!`
      : `おしい！「${q.word.kanji}」は「${q.word.hiragana}」と読みます。`;
  }
  return correct
    ? `そうです！「${spokenKanji(q)}」は "${q.word.english}" という意味です。Good!`
    : `おしい！「${spokenKanji(q)}」は "${q.word.english}" という意味です。`;
}
