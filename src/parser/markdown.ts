import { toMarkdown } from 'mdast-util-to-markdown';
import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import gfm from 'remark-gfm';
import { u } from 'unist-builder';
import yaml from 'yaml';
import { splitContentAtSentence } from './util.js';
import type { DocumentParser } from '../types.js';
import type { Root, Literal, PhrasingContent } from 'mdast';

const remarkInstance = remark().use(gfm).use(frontmatter);

type Section = {
  title: string;
  tree: Root;
};

// @ts-ignore TODO
const isLiteral = (node: PhrasingContent): node is Literal => 'value' in node;

export const parser: DocumentParser = (markdown, maxLength) => {
  const tree = remarkInstance.parse(markdown);

  let documentTitle: string | null = null;

  const sectionTrees = tree.children.reduce<Section[]>((trees, node) => {
    if (node.type === 'yaml') {
      const parsedYaml = yaml.parse(node.value);
      if (parsedYaml.title) documentTitle = parsedYaml.title;
      return trees;
    }

    const [lastTree] = trees.slice(-1);

    if (!lastTree?.tree || node.type === 'heading') {
      let title = '';
      if (node.type === 'heading') {
        title = node.children.map(child => (isLiteral(child) ? child.value : '')).join(' ');
        if (node.depth === 1 && !documentTitle) {
          documentTitle = title;
        }
      }
      const tree = u('root', [node]);
      return trees.concat({ title, tree });
    }

    lastTree.tree.children.push(node);
    return trees;
  }, []);

  const sectionContents = sectionTrees.map(section => ({
    title: section.title,
    content: toMarkdown(section.tree)
  }));

  const sections = sectionContents.flatMap(section => {
    const subsections = splitContentAtSentence(section.content, maxLength);
    return subsections.map(s => ({ title: section.title, content: s }));
  });

  return {
    title: documentTitle || '',
    sections
  };
};
