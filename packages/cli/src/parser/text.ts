import { splitContentAtSentence } from './util.js';
import type { DocumentParser, DocumentSection } from '../types.js';

export const parser: DocumentParser = (text, maxLength) => {
  const sections: DocumentSection[] = [];

  const splitContent = splitContentAtSentence(String(text), maxLength);
  splitContent.forEach(chunk => {
    sections.push({ content: chunk.trim() });
  });

  return { sections };
};
