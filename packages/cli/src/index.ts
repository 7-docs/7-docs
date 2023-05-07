#!/usr/bin/env node

import 'isomorphic-unfetch';
import { parseConfig } from './cli-arguments.js';
import { ingest } from './command/ingest.js';
import { openaiListModels } from './command/openai-list-models.js';
import { pineconeClearNamespace } from './command/pinecone-clear-namespace.js';
import { pineconeCreateIndex } from './command/pinecone-create-index.js';
import { query } from './command/query.js';
import { createTable } from './command/supabase-create-table.js';
import { set } from './util/storage.js';

export const main = async () => {
  try {
    const { command, source, db, repo, sourceIdentifiers, namespace, index, environment, input, stream, isDryRun } =
      await parseConfig();

    switch (command) {
      case 'pinecone-create-index': {
        await pineconeCreateIndex(index, environment);
        break;
      }
      case 'pinecone-clear-namespace': {
        await pineconeClearNamespace(namespace);
        break;
      }
      case 'supabase-create-table': {
        createTable(namespace);
        break;
      }
      case 'set': {
        const [key, value] = input.replace(/'"/g, '').split(/[ =]/);
        set('env', key, value);
        break;
      }
      case 'openai-list-models': {
        await openaiListModels();
        break;
      }
      case 'ingest': {
        await ingest({ source, db, repo, sourceIdentifiers, namespace, isDryRun });
        break;
      }
      case 'query': {
        await query({ db, namespace, query: input, stream });
        break;
      }
      default:
        await query({ db, namespace, query: `${command} ${input}`, stream });
        break;
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
};
