export type QuestionType = "reading" | "meaning";

export interface VocabWord {
  id: string;
  kanji: string;
  hiragana: string;
  english: string;
  icon: string;
}

export interface Question {
  id: string;
  word: VocabWord;
  type: QuestionType;
  situationJa: string;
  situationEn: string;
  prompt: string;
  choices: string[];
  correctIndex: number;
}
