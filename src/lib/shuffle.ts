export function shuffledChoices(
  choices: string[],
  correctIndex: number,
): { choices: string[]; correctIndex: number } {
  const indices = choices.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return {
    choices: indices.map((i) => choices[i]),
    correctIndex: indices.indexOf(correctIndex),
  };
}
