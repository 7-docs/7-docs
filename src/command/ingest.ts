import _fs from 'node:fs/promises';
import { createEmbedding } from '../client/openai.js';
import { stripMarkdown, chunkSentences, getTitle } from '../util/text.js';
import { generateId } from '../util/array.js';
import { OPENAI_MAX_INPUT_TOKENS, OPENAI_EMBEDDING_MODEL, OPENAI_TOKENS_PER_WORD } from '../constants.js';
import * as fs from '../client/fs.js';
import * as github from '../client/github.js';
import { Pinecone } from '../client/pinecone.js';
import { Supabase } from '../client/supabase.js';
import type { MetaData } from '../types';
import { getInitUsage, addTokens } from '../util/usage.js';

const sources = {
  github,
  fs
};

const targets = {
  Pinecone,
  Supabase
};

const CHUNK_DIVIDER = 0.1; // Keep under 0.9 as a safe guard. Lower means smaller embeddings/more fine-grained results.
const CHUNK_SIZE = (OPENAI_MAX_INPUT_TOKENS / OPENAI_TOKENS_PER_WORD) * CHUNK_DIVIDER;

type Options = {
  source?: string;
  db?: string;
  repo: string;
  patterns: string | string[];
  namespace: string;
};

export const ingest = async ({ source, repo, patterns, db, namespace }: Options) => {
  if (!source || !(source in sources)) throw new Error(`Invalid --source: ${source}`);
  if (!db || !(db in targets)) throw new Error(`Invalid --db: ${db}`);
  if (source === 'github' && !repo) throw new Error('No --repo provided');

  const files = await sources[source as keyof typeof sources].fetchFiles(patterns, repo);

  if (files.length > 0) {
    console.log(`Connecting to OpenAI and ${db} (${namespace})`);

    const DB = new targets[db as keyof typeof targets]();

    const counters = {
      files: files.length,
      vectors: 0,
      usage: getInitUsage()
    };

    for (const file of files) {
      const { content, url, filePath } = file;

      const text = await stripMarkdown(content);
      const title = getTitle(content) || filePath;
      const chunks = chunkSentences(text, CHUNK_SIZE);

      const requests = chunks.map(input => createEmbedding({ input, model: OPENAI_EMBEDDING_MODEL }));
      const responses = await Promise.all(requests);
      const embeddings = responses.flatMap(response => response.embeddings);

      const vectors = embeddings.map((values, index) => {
        const text = chunks[index];
        const id = generateId(filePath + '\n' + text.trim());
        const metadata: MetaData = { title, url, filePath, content: text };
        return { id, values, metadata };
      });

      const insertedVectorCount = await DB.upsertVectors({ namespace, vectors });

      counters.vectors += insertedVectorCount;

      const usages = responses.map(response => response.usage);
      counters.usage = addTokens(counters.usage, usages);
    }

    console.log(`Files fetched from ${source}: ${counters.files}`);
    console.log(`OpenAI tokens used: ${counters.usage.total_tokens}`);
    console.log(`Vectors upserted to ${db}: ${counters.vectors}`);
  }
};
