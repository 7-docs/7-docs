import { extname } from 'node:path';
import { load } from 'cheerio';
import { extractTextSections } from './text.js';

export const isHTML = (filePath: string) => ['.html'].includes(extname(filePath));

interface Section {
  header: string;
  content: string;
}

interface ExtractedDocument {
  title: string;
  sections: Section[];
}

export function extractHtmlSections(html: Buffer, maxLength: number): ExtractedDocument {
  const $ = load(html);

  const title = $('title').text() || $('h1').text();

  const body = $('main');
  body.find('style').remove();
  body.find('script').remove();

  const h2Elements = body.find('h2');

  const sections: Section[] = [];

  h2Elements.each((index, element) => {
    const header = $(element).text();

    let content = '';

    let currentNode = $(element).next();

    while (currentNode.length > 0 && currentNode[0].tagName !== 'h2') {
      content += currentNode.text();
      currentNode = currentNode.next();
    }

    const sectionTexts = extractTextSections(content, maxLength);

    sectionTexts.forEach(sectionContent => {
      sections.push({
        header,
        content: header + '. ' + sectionContent
      });
    });
  });

  return {
    title,
    sections
  };
}
