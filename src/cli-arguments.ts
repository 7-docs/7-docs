import { parseArgs } from 'node:util';
import { ucFirst } from '@7-docs/shared/string.js';
import { getOrSet } from './util/storage.js';

const helpText = `Tool to query content based on local files or GitHub repositories.

Usage: 7h [command] [options]

Commands:
  ingest
  query (default)

ingest
  --source [name]         Source to fetch content from. Options: fs, github (default: fs)
  --repo [owner/repo]     Repository to fetch file contents from (only required for --source github)
  --files [pattern]       Glob patterns for the source text files (can be repeated)
  --db [name]             Target database to store the embedding vectors. Options: pinecone, supabase (default: pinecone)
  --namespace [name]      Namespace to store the embedding vectors

query
  [input]                 Query input
  --db [name]             Database to query. Options: pinecone, supabase (default: pinecone)
  --namespace [name]      Namespace to query
  --no-stream             Don't stream the response

Additional helper commands:
  set
  pinecone-create-index
  pinecone-clear-namespace
  supabase-create-table
  openai-list-models

set
  [name] [value]          Store name with value (alternative to exporting environment variables)

pinecone-create-index
  --index [name]          Create or set index

pinecone-clear-namespace
  --namespace [name]      Clear namespace

supabase-create-table
  --namespace [name]      Print SQL query to enable pgvector and create table with function in Supabase SQL Editor

openai-list-models        Show list of available OpenAI models


Examples:

> Using Pinecone

$ 7d pinecone-create-index --index my-index
$ 7d ingest --files '*.md' --namespace my-namespace
$ 7d Can you give a summary?

> Using Supabase

$ 7d supabase-create-table --namespace knip
$ 7d ingest --files README.md --files 'docs/**/*.md' --namespace my-namespace
$ 7d Can you give an introduction?

> Using a GitHub repo

$ 7d pinecone-create-index --index knip
$ 7d ingest --source github --repo reactjs/react.dev --files 'src/content/reference/react/*.md' --namespace react
$ 7d What is Suspense?

Use --db and/or --namespace to be explicit, and to switch db or namespace. Omit to keep using the latest provided.

More documentation and bug reports: https://github.com/webpro/7-docs`;

export const parseConfig = async () => {
  const parsedArgs = parseArgs({
    strict: true,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      debug: { type: 'boolean' },
      source: { type: 'string', default: 'fs' },
      files: { type: 'string', multiple: true },
      repo: { type: 'string' },
      index: { type: 'string' },
      namespace: { type: 'string' },
      db: { type: 'string' },
      'no-stream': { type: 'boolean', default: false },
      'dry-run': { type: 'boolean', default: false }
    }
  });

  if (parsedArgs.values['help']) {
    console.log(helpText);
    process.exit(0);
  }

  const [command, ...restPositionals] = parsedArgs.positionals;
  const source = parsedArgs.values['source'];
  const patterns = parsedArgs.values['files'] ?? [];
  const input = restPositionals.join(' ').trim();

  const db = getOrSet('db', 'type', parsedArgs.values['db'], 'pinecone');
  const namespace = getOrSet(db, 'namespace', parsedArgs.values['namespace'], '');
  const index = parsedArgs.values['index'];
  const repo = getOrSet('github', 'repo', parsedArgs.values['repo']);

  return {
    debug: parsedArgs.values.debug,
    command,
    source,
    db: ucFirst(db),
    repo,
    patterns,
    index,
    namespace,
    input,
    stream: !parsedArgs.values['no-stream'],
    isDryRun: !!parsedArgs.values['dry-run']
  };
};
