import 'path2d-polyfill';
import { parser as textParser } from './text.js';
import type { AsyncDocumentParser } from '../types.js';
import type { TextItem } from 'pdfjs-dist/types/src/display/api.js';

export const parser: AsyncDocumentParser = async (content, maxLength) => {
  const { default: pdf } = await import('pdfjs-dist/legacy/build/pdf.js');
  const data = Buffer.isBuffer(content) ? new Uint8Array(content) : content;
  const loadingTask = pdf.getDocument(data);
  const pdfDocument = await loadingTask.promise;
  const numPages = pdfDocument.numPages;

  let fullText = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDocument.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .filter((item): item is TextItem => 'str' in item)
      .map(item => item.str)
      .join(' ');

    fullText += ' ' + pageText;
  }

  return textParser(fullText, maxLength);
};
