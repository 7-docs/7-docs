export const ucFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const normalizeNamespace = (value: string) => value.replace(/[./-]/g, '_');

export const splitTextIntoSentences = (content: string) =>
  content
    .replace(/\s+/gm, ' ')
    .trim()
    .split(/(?<=[.?!]\s)\s*/g);
