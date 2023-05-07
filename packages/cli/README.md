# @7-docs/cli

`7d` is a powerful CLI tool to ingest content and store into a vector database, ready to get queried like you would with
ChatGPT.

Uses OpenAI APIs, part of [7-docs][1].

## Impression

### CLI

![Demo of ingest and query][2]

## Content

- [Status][3]
- [Prerequisites][4]
- [Installation][5]
- [Pinecone][6]
- [Supabase][7]
- [Ingestion][8]
  - [Local][9]
  - [GitHub][10]
  - [HTTP][11]
  - [PDF][12]

## Status

This is still in the early days, but already offers a variety of features:

- Plain text, Markdown and PDF files are supported as input.
- Ingest from local files, from HTML pages over HTTP, and from GitHub repositories.
- The OpenAI `text-embedding-ada-002` model is used to create embeddings.
- [Pinecone][13] and [Supabase][14] are supported for vector storage.
- The OpenAI `gpt-3.5-turbo` model is used for chat completions from the CLI.

See the [7-docs overview][1] for more packages and starter kits.

## Prerequisites

- Node.js v16+
- OpenAI API key
- Pinecone or Supabase account, plus API keys
- When ingesting lots of files from GitHub, a GitHub token

## Installation

You can install 7-docs in two ways:

- [Global][15] to manage knowledge base(s) from the command line.
- [Local][9] to manage the knowledge base(s) of a repository.

### Global

Use `7d` from anywhere to manage your personal knowledge bases:

```shell
npm install --global 7-docs
```

Get an [OpenAI API key][16] and make it available as en environment variable:

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

Now let's choose either [Pinecone][6] or [Supabase][7]!

## Pinecone

Make sure to have a Pinecone account and set `PINECONE_API_KEY`:

```shell
export PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Create or select an index:

```shell
7d pinecone-create-index --index my-index --environment us-east4-gcp
```

![Demo of Pinecone index creation][17]

Keep working with this index by setting the `PINECONE_URL` from the [Pinecone Console][18] like so:

```shell
export PINECONE_URL=xxxxx-xxxxxxx.svc.us-xxxxx-gcp.pinecone.io
export PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

## Supabase

Make sure to have a Supabase account and set `SUPABASE_URL` and `SUPABASE_API_KEY`:

```shell
export SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
export SUPABASE_API_KEY="ey..."
```

Print the SQL query to enable [pgvector][19] and create a table (paste the output in the [Supabase web admin][20]):

```shell
7d supabase-create-table --namespace my-collection
```

## Ingestion

Let's ingest some text or Markdown files, make sure to adjust the `--files` pattern to match yours:

```shell
7d ingest --files README.md --files 'docs/**/*.md' --namespace my-collection
```

Note that ingestion from remote resources ([GitHub][10] and/or [HTTP][11]) has the benefit to link back to the original
source when retrieving answers. This is not possible when using local files.

### GitHub

Use `--source github` and file patterns to ingest from a GitHub repo:

```shell
7d ingest --source github --repo reactjs/react.dev --files 'src/content/reference/react/*.md' --namespace react
```

![Demo of ingest and query][21]

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

When you see the `cannot find module "canvas"` error, please see [node-canvas#compiling][22].

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

[1]: https://github.com/7-docs
[2]: ./assets/ingest-and-query.gif
[3]: #status
[4]: #prerequisites
[5]: #installation
[6]: #pinecone
[7]: #supabase
[8]: #ingestion
[9]: #local
[10]: #github
[11]: #http
[12]: #pdf
[13]: https://www.pinecone.io
[14]: https://supabase.com
[15]: #global
[16]: https://platform.openai.com/account/api-keys
[17]: ./assets/pinecone-create-index.gif
[18]: https://app.pinecone.io
[19]: https://supabase.com/docs/guides/database/extensions/pgvector
[20]: https://app.supabase.com/projects
[21]: ./assets/ingest-and-query-2.gif
[22]: https://github.com/Automattic/node-canvas#compiling
[23]: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
[24]: https://platform.openai.com/docs/guides/chat
