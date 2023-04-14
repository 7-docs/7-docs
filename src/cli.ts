#!/usr/bin/env node

import { parseConfig } from './cli-arguments.js';
import { ingest } from './command/ingest.js';
import { openaiListModels } from './command/openai-list-models.js';
import { pineconeClearNamespace } from './command/pinecone-clear-namespace.js';
import { pineconeCreateIndex } from './command/pinecone-create-index.js';
import { query } from './command/query.js';
import { createTable } from './command/supabase-create-table.js';
import { set } from './util/storage.js';

const main = async () => {
  try {
    const { command, source, db, repo, patterns, namespace, index, input, stream } = await parseConfig();

    switch (command) {
      case 'pinecone-create-index': {
        await pineconeCreateIndex(index);
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
        await ingest({ source, db, repo, patterns, namespace });
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

main();
