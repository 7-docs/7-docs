import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import gfm from 'remark-gfm';
import inlineLinks from 'remark-inline-links';
import mdx from 'remark-mdx';
import { u } from 'unist-builder';
import yaml from 'yaml';
import { splitContentAtSentence } from './util.js';
import type { DocumentParser } from '../types.js';
import type { Root, Literal, Node } from 'mdast';

const remarkInstance = remark().use(frontmatter).use(gfm).use(inlineLinks).use(mdx);

type Section = {
  title: string;
  header: string;
  tree: Root;
};

const isLiteral = (node: Node): node is Literal => 'value' in node;

export const parser: DocumentParser = (markdown, maxLength) => {
  const ast = remarkInstance.parse(markdown);
  const tree = remarkInstance.runSync(ast);

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
      let sectionHeader = '';
      if (node.type === 'heading') {
        title = node.children.map(child => (isLiteral(child) ? child.value : '')).join(' ');
        if (node.depth === 1 && !documentTitle) {
          documentTitle = title;
        }
        if (node.depth > 1 && !sectionHeader) {
          sectionHeader = title;
        }
      }
      const tree = u('root', [node]);
      // @ts-ignore TODO
      return trees.concat({ title, header: sectionHeader, tree });
    }

    // @ts-ignore TODO
    lastTree.tree.children.push(node);
    return trees;
  }, []);

  const sectionContents = sectionTrees.map(section => ({
    title: section.title,
    header: section.header,
    content: toMarkdown(section.tree, { extensions: [gfmToMarkdown()] })
  }));

  const sections = sectionContents.flatMap(section => {
    const subsections = splitContentAtSentence(section.content, maxLength);
    return subsections.map(s => ({ title: section.title, header: section.header, content: s }));
  });

  return {
    title: documentTitle || '',
    sections
  };
};
