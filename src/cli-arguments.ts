import { parseArgs } from 'node:util';
import { getOrSet } from './util/storage.js';
import { ucFirst } from './util/text.js';

export const helpText = `Tool to query content based on local files or GitHub repositories.

Usage: 7h [command] [options]

Commands:
  set
  pinecone-set-index
  pinecone-clear-namespace
  supabase-create-table
  ingest
  query (default)

set
  name value              Store name and value (alternative to exporting environment variables)

pinecone-set-index
  --index [name]          Create or set index

pinecone-clear-namespace
  --namespace [name]      Clear namespace

supabase-create-table
  --namespace [name]      Print SQL query to enable pgvector and create table with function in Supabase SQL Editor

ingest
  --source [name]         Source to fetch content from. Options: fs, github (default: fs)
  --repo [owner/repo]     Repository to fetch file contents from (only required for --source github)
  --files [pattern]       Glob patterns for the source text files (can be repeated)
  --db [name]             Where to store/query the embedding vectors. Options: pinecone, supabase (default: pinecone)
  --namespace [name]      Namespace to store the embedding vectors

query
  [query]                 Query
  --db [name]             Database to query. Options: pinecone, supabase (default: pinecone)
  --namespace [name]      Namespace to query
  --no-stream             Don't stream the response

Examples:

> Using Pinecone

$ 7d pinecone-set-index --index my-index
$ 7d ingest --files '*.md' --namespace my-namespace
$ 7d Can you give a summary?

> Using Supabase

$ 7d supabase-create-table --namespace knip
$ 7d ingest --files README.md --namespace my-namespace
$ 7d Can you give an introduction?

> Using a GitHub repo

$ 7d pinecone-set-index --index knip
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
      source: { type: 'string' },
      files: { type: 'string', multiple: true },
      repo: { type: 'string' },
      index: { type: 'string' },
      namespace: { type: 'string' },
      db: { type: 'string' },
      'no-stream': { type: 'boolean', default: false }
    }
  });

  if (parsedArgs.values['help']) {
    console.log(helpText);
    process.exit(0);
  }

  const [command, ...restPositionals] = parsedArgs.positionals;
  const patterns = parsedArgs.values['files'] ?? [];
  const input = restPositionals.join(' ').trim();

  const db = getOrSet('db', 'type', parsedArgs.values['db'], 'pinecone');
  const source = getOrSet('source', 'type', parsedArgs.values['source'], 'fs');
  const namespace = getOrSet(db, 'namespace', parsedArgs.values['namespace'], '');
  const index = getOrSet(db, 'index', parsedArgs.values['index']);
  const repo = getOrSet('github', 'repo', parsedArgs.values['repo']);

  return {
    command,
    source,
    db: ucFirst(db),
    repo,
    patterns,
    index,
    namespace: namespace.replace(/[.\/-]/g, '_'),
    input,
    stream: !parsedArgs.values['no-stream']
  };
};
