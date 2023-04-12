import ora from 'ora';
import { createEmbedding } from '../client/openai.js';
import { stripMarkdown, chunkSentences, getTitle } from '../util/text.js';
import { generateId } from '../util/array.js';
import { CHUNK_SIZE, OPENAI_EMBEDDING_MODEL } from '../constants.js';
import * as fs from '../client/fs.js';
import * as github from '../client/github.js';
import { Pinecone } from '../client/pinecone.js';
import { Supabase } from '../client/supabase.js';
import { getInitUsage, addTokens } from '../util/usage.js';
import type { MetaData } from '../types';

const sources = {
  github,
  fs
};

const targets = {
  Pinecone,
  Supabase
};

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

  const spinner = ora(`Fetching files`).start();

  const files = await sources[source as keyof typeof sources].fetchFiles(patterns, repo);

  spinner.succeed();

  if (files.length > 0) {
    const spinner = ora('Creating and upserting vectors').start();

    const DB = new targets[db as keyof typeof targets]();

    const counters = {
      files: files.length,
      vectors: 0,
      usage: getInitUsage()
    };

    try {
      for (const file of files) {
        const { content, url, filePath } = file;

        spinner.text = `Creating and upserting embedding for: ${filePath}`;

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

      spinner.succeed();
    } catch (error) {
      if (error instanceof Error) spinner.fail(error.message);
      else throw error;
    } finally {
      const messages = [
        `Fetched ${counters.files} file(s) from ${source}`,
        `used ${counters.usage.total_tokens} OpenAI tokens`,
        `upserted ${counters.vectors} vectors to ${db}`
      ];
      ora(messages.join(', ')).info();
    }
  }
};
