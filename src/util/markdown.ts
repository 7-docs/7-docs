// TODO: Code below was largely generated by gpt-4, can likely be improved
import { extname } from 'node:path';
import { remark } from 'remark';
import gfm from 'remark-gfm';
import frontmatter from 'remark-frontmatter';
import stripMarkdown from 'strip-markdown';
import yaml from 'yaml';

export const isMarkdown = (filePath: string) => ['.md', '.markdown'].includes(extname(filePath));

const remarkInstance = remark().use(gfm).use(frontmatter);

function stripMarkdownSyntax(content: string): string {
  const tree = remarkInstance.parse(content);
  const strippedTree = remarkInstance().use(stripMarkdown).runSync(tree);
  return remarkInstance.stringify(strippedTree).trim();
}

function splitContentAtSentence(content: string, maxLength: number): string[] {
  const sentences = content.split(/[.?!]\s+/g);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    const strippedSentence = stripMarkdownSyntax(sentence);
    if (currentChunk.length + strippedSentence.length <= maxLength) {
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
}

interface Section {
  header: string;
  content: string;
}

interface ExtractedDocument {
  title: string;
  sections: Section[];
}

export function extractSections(markdown: string, maxLength: number): ExtractedDocument {
  const tree = remarkInstance.parse(markdown);

  let title: string | null = null;
  const rawSections: Section[] = [];
  let currentSection: Section | null = null;

  for (const node of tree.children) {
    if (node.type === 'yaml') {
      const parsedYaml = yaml.parse(node.value as string);
      if (parsedYaml.title) {
        title = parsedYaml.title;
      }
    } else if (node.type === 'heading') {
      const headerText = node.children.map(child => (child as any).value).join(' ');

      if ((node as any).depth === 1 && !title) {
        title = headerText;
      }

      if (currentSection) {
        rawSections.push(currentSection);
        currentSection = null;
      }

      currentSection = {
        header: headerText,
        content: ''
      };
    } else if (currentSection) {
      currentSection.content += remarkInstance.stringify(node);
    }
  }

  if (currentSection) {
    rawSections.push(currentSection);
    currentSection = null;
  }

  const sections: Section[] = [];
  for (const rawSection of rawSections) {
    const splitContent = splitContentAtSentence(rawSection.content, maxLength);
    splitContent.forEach(chunk => {
      sections.push({
        header: rawSection.header,
        content: stripMarkdownSyntax(chunk)
      });
    });
  }

  return {
    title: title || '',
    sections
  };
}