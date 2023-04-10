#!/usr/bin/env node

import { parseConfig, helpText } from './cli-arguments.js';
import { Pinecone } from './client/pinecone.js';
import { createTable } from './client/supabase.js';
import { ingest } from './command/ingest.js';
import { query } from './command/query.js';
import { set } from './util/storage.js';
import { ConfigurationError } from './util/errors.js';

const main = async () => {
  try {
    const { command, source, db, repo, patterns, namespace, index, input } = await parseConfig();

    switch (command) {
      case 'pinecone-set-index': {
        const pinecone = new Pinecone();
        pinecone.createOrSetIndex(index);
        break;
      }
      case 'pinecone-clear-namespace': {
        const pinecone = new Pinecone();
        pinecone.clearNamespace(namespace);
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
      case 'ingest': {
        await ingest({ source, db, repo, patterns, namespace });
        break;
      }
      case 'query': {
        query({ db, namespace, query: input });
        break;
      }
      default:
        query({ db, namespace, query: `${command} ${input}` });
        break;
    }
  } catch (error: unknown) {
    if (error instanceof ConfigurationError) {
      console.error(error.message);
      console.log('\n' + helpText);
      process.exit(1);
    }
    throw error;
  }
};

main();
