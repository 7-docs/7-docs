import { parseArgs } from 'node:util';
import { ucFirst } from '@7-docs/shared';
import { getOrSet } from './util/storage.js';

const nodeMajor = parseInt(process.version.split('.')[0].slice(1), 10);

const helpText = `Tool to query content based on local files or GitHub repositories.

Usage: 7h [command] [options]

Commands:
  ingest
  query (default)

ingest
  --source [name]         Source to fetch content from. Options: fs, github, http (default: fs)
  --repo [owner/repo]     Repository to fetch file contents from (only required for --source github)
  --files [pattern]       Glob patterns for the source files (can be repeated)
  --url [url]             URL to fetch content from (use with --http, can be repeated)
  --db [name]             Target database to store the embedding vectors. Options: pinecone, supabase (default: pinecone)
  --namespace [name]      Namespace to store the embedding vectors
  --ignore [pattern]      Exclude files matching this pattern (can be repeated)

query
  [input]                 Query input
  --db [name]             Database to query. Options: pinecone, supabase (default: pinecone)
  --namespace [name]      Namespace to query
  --no-stream             Don't stream the response

set
  [name] [value]          Store name with value (alternative to exporting environment variables)

pinecone-create-index
  --index [name]          Name for the index
  --environment [name]    Environment (e.g. "us-east4-gcp")

pinecone-clear-namespace
  --namespace [name]      Clear namespace

supabase-create-table
  --namespace [name]      Print SQL query to enable pgvector and create table with function in Supabase SQL Editor

openai-list-models        Show list of available OpenAI models

Example using a GitHub repo and Pinecone:

$ 7d pinecone-create-index --environment us-east4-gcp --index react
$ 7d ingest --source github --repo reactjs/react.dev --files 'src/content/reference/react/*.md' --namespace react
$ 7d What is Suspense?

Use --db and/or --namespace to be explicit, and to switch db or namespace. Omit to keep using the latest provided.

More documentation: https://www.npmjs.com/package/@7-docs/cli
Bug reports: https://github.com/7-docs/7-docs`;

export const parseConfig = async () => {
  const parsedArgs = parseArgs({
    strict: true,
    allowPositionals: true,
    options: {
      help: { type: 'boolean', short: 'h' },
      debug: { type: 'boolean' },
      source: { type: 'string', default: 'fs' },
      files: { type: 'string', multiple: true },
      ignore: { type: 'string', multiple: true },
      url: { type: 'string', multiple: true },
      repo: { type: 'string' },
      index: { type: 'string' },
      environment: { type: 'string' },
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
  const sourceIdentifiers = [...(parsedArgs.values['files'] ?? []), ...(parsedArgs.values['url'] ?? [])];
  const ignore = parsedArgs.values['ignore'] ?? [];
  const input = restPositionals.join(' ').trim();

  const db = getOrSet('db', 'type', parsedArgs.values['db'], 'pinecone');
  const namespace = getOrSet(db, 'namespace', parsedArgs.values['namespace'], '');
  const index = parsedArgs.values['index'];
  const environment = parsedArgs.values['environment'];
  const repo = getOrSet('github', 'repo', parsedArgs.values['repo']);

  return {
    debug: parsedArgs.values.debug,
    command,
    source,
    sourceIdentifiers,
    ignore,
    repo,
    db: ucFirst(db),
    index,
    environment,
    namespace,
    input,
    stream: !parsedArgs.values['no-stream'] && nodeMajor >= 18,
    isDryRun: !!parsedArgs.values['dry-run']
  };
};
