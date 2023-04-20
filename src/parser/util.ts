const splitTextIntoSentences = (content: string) =>
  content
    .replace(/\s+/gm, ' ')
    .trim()
    .split(/(?<=[.?!]\s)\s*/g);

export const splitContentAtSentence = (content: string, maxLength: number): string[] => {
  const sentences = splitTextIntoSentences(content);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length <= maxLength) {
      currentChunk += sentence;
    } else {
      chunks.push(currentChunk);
      currentChunk = sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
};
