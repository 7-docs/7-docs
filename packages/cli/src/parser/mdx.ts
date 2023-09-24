import { remark } from 'remark';
import frontmatter from 'remark-frontmatter';
import gfm from 'remark-gfm';
import inlineLinks from 'remark-inline-links';
import mdx from 'remark-mdx';
import { createParser } from './md.js';

const remarkInstance = remark().use(frontmatter).use(gfm).use(inlineLinks).use(mdx);

export const parser = createParser(remarkInstance);
