import { extname } from 'node:path';
import { parser as HTMLParser } from './html.js';
import { parser as MarkdownParser } from './markdown.js';
import { parser as PDFParser } from './pdf.js';
import { parser as TextParser } from './text.js';
import type { AsyncDocumentParser, DocumentParser } from '../types.js';

const parsers: Record<string, DocumentParser | AsyncDocumentParser> = {
  '.html': HTMLParser,
  '.md': MarkdownParser,
  '.markdown': MarkdownParser,
  '.pdf': PDFParser,
  default: TextParser
};

export const parseDocument = async (filePath: string, document: Buffer, maxLength: number) => {
  const ext = extname(filePath);
  const parser = ext in parsers ? parsers[ext] : parsers.default;
  const { title = filePath, sections } = await parser(document, maxLength);
  return { title, sections };
};
