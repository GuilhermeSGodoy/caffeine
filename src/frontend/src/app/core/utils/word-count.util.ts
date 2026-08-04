export interface WordCount {
  wordCount: number;
  charCount: number;
}

export function calculateWordCount(plainText: string): WordCount {
  if (!plainText.trim()) {
    return { wordCount: 0, charCount: 0 };
  }

  const wordCount = (plainText.match(/\S+/g) ?? []).length;
  const charCount = plainText.replace(/\s/g, '').length;

  return { wordCount, charCount };
}
