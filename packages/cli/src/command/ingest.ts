import { OpenAI } from '@7-docs/edge';
import { CHUNK_SIZE, OPENAI_EMBEDDING_MODEL } from '@7-docs/shared';
import { Algolia } from '../client/algolia.js';
import { Pinecone } from '../client/pinecone.js';
import { Supabase } from '../client/supabase.js';
import { OPENAI_API_KEY } from '../env.js';
import { fetchDocuments, sources } from '../fetcher/index.js';
import { parseDocument } from '../parser/index.js';
import { generateId } from '../util/crypto.js';
import ora from '../util/ora.js';
import { getInitUsage, addTokens } from '../util/usage.js';
import type { MetaData } from '@7-docs/shared';

const targets = {
  Pinecone,
  Supabase,
  Algolia,
};

type Options = {
  source?: string;
  sourceIdentifiers: string[];
  ignore: string[];
  repo: string;
  db?: string;
  namespace: string;
  isDryRun: boolean;
};

const isValidSource = (source?: string): source is keyof typeof sources => Boolean(source && source in sources);
const isValidTarget = (target?: string): target is keyof typeof targets => Boolean(target && target in targets);

export const ingest = async ({ source, sourceIdentifiers, ignore, repo, db, namespace, isDryRun }: Options) => {
  if (!isValidSource(source)) throw new Error(`Invalid --source: ${source}`);
  if (!isValidTarget(db)) throw new Error(`Invalid --db: ${db}`);
  if (source === 'github' && !repo) throw new Error('No --repo provided');

  const client = new OpenAI(OPENAI_API_KEY);

  const spinner = ora(`Fetching files`).start();

  const files = await fetchDocuments(source, sourceIdentifiers, { repo, ignore });

  spinner.succeed();

  if (files.length > 0) {
    const spinner = ora('Creating and upserting vector embeddings').start();

    const DB = new targets[db]();

    const counters = {
      files: files.length,
      vectors: 0,
      usage: getInitUsage()
    };

    try {
      for (const file of files) {
        const { content, url, filePath } = file;

        if (!content) continue;

        spinner.text = `Creating and upserting vector embedding for: ${filePath}`;

        const { title, sections } = await parseDocument(filePath, content, CHUNK_SIZE);

        if (isDryRun) continue;

        const requests = sections.map(section => {
          return client.createEmbeddings({ input: section.content, model: OPENAI_EMBEDDING_MODEL });
        });
        const responses = await Promise.all(requests);
        const embeddings = responses.flatMap(response => response.embeddings);

        const vectors = embeddings.map((values, index) => {
          const section = sections[index];
          const id = generateId(filePath + '\n' + section.content.trim());
          const metadata: MetaData = { title, url, filePath, content: section.content, header: section.header, tags: section.tags };
          return { id, values, metadata };
        });

        const insertedVectorCount = await DB.upsertVectors({ namespace, vectors });

        counters.vectors += insertedVectorCount;

        const usages = responses.map(response => response.usage);
        counters.usage = addTokens(counters.usage, usages);
      }

      spinner.succeed('Creating and upserting vectors');
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
  } else {
    throw new Error(`Unable to find files to ingest (source: ${source}, patterns: ${sourceIdentifiers.join(',')})`);
  }
};
