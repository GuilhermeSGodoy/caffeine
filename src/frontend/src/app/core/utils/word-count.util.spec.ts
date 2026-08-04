import { calculateWordCount } from './word-count.util';

describe('calculateWordCount', () => {
  it.each([
    ['', 0, 0],
    ['   ', 0, 0],
    ['Hello', 1, 5],
    ['Hello world', 2, 10],
    ['Hello   world\nnew line', 4, 17]
  ])('para "%s" retorna %i palavras e %i caracteres', (text, expectedWords, expectedChars) => {
    const { wordCount, charCount } = calculateWordCount(text);

    expect(wordCount).toBe(expectedWords);
    expect(charCount).toBe(expectedChars);
  });
});
