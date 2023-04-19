import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import gfm from 'remark-gfm';
import stripMarkdown from 'strip-markdown';
import yaml from 'yaml';
import { splitContentAtSentence } from './util.js';
import type { DocumentParser, DocumentSection } from '../types.js';

const remarkInstance = remark().use(gfm).use(frontmatter);

function stripMarkdownSyntax(content: string): string {
  const tree = remarkInstance.parse(content);
  const strippedTree = remarkInstance().use(stripMarkdown).runSync(tree);
  return remarkInstance.stringify(strippedTree).trim();
}

export const parser: DocumentParser = (markdown, maxLength) => {
  const tree = remarkInstance.parse(markdown);

  let title: string | null = null;
  const rawSections: DocumentSection[] = [];
  let currentSection: DocumentSection | null = null;

  for (const node of tree.children) {
    if (node.type === 'yaml') {
      const parsedYaml = yaml.parse(node.value as string);
      if (parsedYaml.title) {
        title = parsedYaml.title;
      }
    } else if (node.type === 'heading') {
      const headerText = node.children.map(child => (child.type === 'text' ? child.value : '')).join(' ');

      if (node.depth === 1 && !title) {
        title = headerText;
      }

      if (currentSection) {
        rawSections.push(currentSection);
        currentSection = null;
      }

      currentSection = {
        header: headerText,
        content: headerText + '. '
      };
    } else if (currentSection) {
      currentSection.content += remarkInstance.stringify({ type: 'root', children: [node] });
    }
  }

  if (currentSection) {
    rawSections.push(currentSection);
    currentSection = null;
  }

  const sections: DocumentSection[] = [];
  for (const rawSection of rawSections) {
    const splitContent = splitContentAtSentence(rawSection.content, maxLength, stripMarkdownSyntax);
    splitContent.forEach(chunk => {
      sections.push({
        header: rawSection.header,
        content: rawSection.header + '. ' + chunk
      });
    });
  }

  return {
    title: title || '',
    sections
  };
};
