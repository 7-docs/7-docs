# 7-docs

Build a knowledge base and ask it questions through OpenAI APIs.

`7d` is a powerful tool to ingest text files and store them in a vector database, ready to get queried like you would
with ChatGPT. Multiple sources can be combined into one namespace.

## Impression

### CLI

![Demo of ingest and query][1]

### Web GUI

A demo runs at [7d-next.fly.dev][2] (content ingested from the [react.dev][3] documentation). The source code is at
[github.com/7-docs/demo-next][4].

## Content

- [Status][5]
- [Prerequisites][6]
- [Installation][7]
- [Pinecone][8]
- [Supabase][9]
- [Ingestion][10]
  - [Local][11]
  - [GitHub][12]
  - [HTTP][13]
  - [PDF][14]

## Status

This is still in an early alpha phase. There is a command-line interface, it supports text and Markdown files as input,
uses OpenAI `text-embedding-ada-002` for embeddings, [Pinecone][15] and [Supabase][16] for vector storage, and the
OpenAI `gpt-3.5-turbo` completion model.

Ideas for extension:

- Make it chatty, conversational (it's only single shots now)
- Better support for source code files (e.g. Python, TypeScript).
- Make it easy to create a user-friendly web UI to query.
- Follow links when fetching HTML using `--source http`

## Prerequisites

- Node.js v16+
- OpenAI API key
- Pinecone or Supabase account, plus API keys
- When ingesting lots of files from GitHub, a GitHub token

## Installation

You can install 7-docs in two ways:

- [Global][17] to manage knowledge base(s) from the command line.
- [Local][11] to manage the knowledge base(s) of a repository.

### Global

Use `7d` from anywhere to manage your personal knowledge bases:

```shell
npm install --global 7-docs
```

Get an [OpenAI API key][18] and make it available as en environment variable:

```shell
export OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Alternative storage (in `~/.7d.json`) so it's available in your next session too:

```shell
7d set OPENAI_API_KEY sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

This works for the other `export` values shown later as well.

### Local

Add `7d` to the `devDependencies` of a repository to manage its knowledge base(s):

```shell
npm install --save-dev 7-docs
```

Store the variables you need in a local `.env` file in the root of your project:

```shell
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

For local installations, use `npx 7d` (over just `7d`).

Now let's choose either [Pinecone][8] or [Supabase][9]!

## Pinecone

Make sure to have a Pinecone account and set `PINECONE_URL` and `PINECONE_API_KEY`:

```shell
export PINECONE_URL=xxxxx-xxxxxxx.svc.us-xxxxx-gcp.pinecone.io
export PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Create or select an index:

```shell
7d pinecone-create-index --index my-index
```

![Demo of Pinecone index creation][19]

## Supabase

Make sure to have a Supabase account and set `SUPABASE_URL` and `SUPABASE_API_KEY`:

```shell
export SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
export SUPABASE_API_KEY="ey..."
```

Print the SQL query to enable [pgvector][20] and create a table (paste the output in the [Supabase web admin][21]):

```shell
7d supabase-create-table --namespace my-collection
```

## Ingestion

Let's ingest some text or Markdown files, make sure to adjust the `--files` pattern to match yours:

```shell
7d ingest --files README.md --files 'docs/**/*.md' --namespace my-collection
```

Note that ingestion from remote resources ([GitHub][12] and/or [HTTP][13]) has the benefit to link back to the
original source when retrieving answers. This is not possible when using local files.

### GitHub

Use `--source github` and file patterns to ingest from a GitHub repo:

```shell
7d ingest --source github --repo reactjs/react.dev --files 'src/content/reference/react/*.md' --namespace react
```

![Demo of ingest and query][22]

You can start without it, but once you start fetching lots of files you'll need to set `GITHUB_TOKEN`:

```shell
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### HTTP

Crawl content from web pages:

```shell
7d ingest --source http --url https://en.wikipedia.org/wiki/Butterfly
```

### PDF

`7d` supports PDF files as well:

```shell
7d ingest --files ./my-article.pdf
7d ingest --source github --repo webpro/webpro.nl --files 'content/*.pdf'
```

## Query

Now you can start asking questions about it:

```shell
7d Can you please give me a summary?
```

## Other commands

Other convenience flags and commands not mentioned yet.

### `--help`

Shows available commands and how they can be used:

```shell
7d --help
```

### `openai-list-models`

List available OpenAI models:

```shell
7d openai-list-models
```

### `pinecone-clear-namespace`

Clear a single namespace from the current Pinecone index:

```shell
7d pinecone-clear-namespace --namespace my-collection
```

## Token Usage

The OpenAI recommendation [text-embedding-ada-002][23] model is used to create embeddings. Ingestion uses some tokens
when ingesting lots of files. Queries use only a few tokens (using the [gpt-3.5-turbo][24] model by default). See the
console for details.

## Inspired by

- [Paul Kinlan][25]
- [OpenAI Cookbook][26]
- [Polymath][27]

[1]: ./assets/ingest-and-query.gif
[2]: https://7d-next.fly.dev
[3]: https://react.dev
[4]: https://github.com/7-docs/demo-react
[5]: #status
[6]: #prerequisites
[7]: #installation
[8]: #pinecone
[9]: #supabase
[10]: #ingestion
[11]: #local
[12]: #github
[13]: #http
[14]: #pdf
[15]: https://www.pinecone.io
[16]: https://supabase.com
[17]: #global
[18]: https://platform.openai.com/account/api-keys
[19]: ./assets/pinecone-create-index.gif
[20]: https://supabase.com/docs/guides/database/extensions/pgvector
[21]: https://app.supabase.com/projects
[22]: ./assets/ingest-and-query-2.gif
[23]: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
[24]: https://platform.openai.com/docs/guides/chat
[25]: https://github.com/PaulKinlan/paul.kinlan.me
[26]: https://github.com/openai/openai-cookbook
[27]: https://github.com/polymath-ai/polymath-ai
