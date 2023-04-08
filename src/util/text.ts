import { remark } from 'remark';
import gfm from 'remark-gfm';
import strip from 'strip-markdown';

const prepareHeaders = (markdown: string) => markdown.replace(/(#+ .*)/g, '$1. ');

const fixWhitespace = (text: string) => text.replace(/\s+/g, ' ').replace(/([a-zA-Z])[.:)!?]{1}([A-Z])/g, '$1. $2');

export const stripMarkdown = async (input: string) => {
  const markdown = prepareHeaders(input);
  const vFile = await remark().use(gfm).use(strip).process(markdown);
  return fixWhitespace(String(vFile));
};

export const getTitle = (markdown: string) => {
  const match = markdown.match(/(?<=# ).+/);
  return match?.[0].trim();
};

export function chunkSentences(inputString: string, maxLength: number) {
  const sentenceEndRegex = /([.!?])(\s|$)/g;
  const chunks = [];
  let startIndex = 0;
  let match;

  while ((match = sentenceEndRegex.exec(inputString)) !== null) {
    const endIndex = match.index + match[0].length;
    if (endIndex - startIndex > maxLength) {
      chunks.push(inputString.slice(startIndex, endIndex));
      startIndex = endIndex;
    }
  }

  if (startIndex < inputString.length) {
    chunks.push(inputString.slice(startIndex));
  }

  return chunks;
}
