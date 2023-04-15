# 7-docs

Build a knowledge base and ask it questions through OpenAI APIs.

`7d` is a powerful tool to ingest text files and store them in a vector database, ready to get queried like you would
with ChatGPT. Multiple sources can be combined into one namespace.

## Impression

### CLI

![Demo of ingest and query][1]

### Web GUI

A basic demonstration is currently running at [7-docs-deno-supabase.deno.dev][2] (content ingested from the release-it
package and related plugin repositories). The source code is at [github.com/7-docs/deno-supabase][3].

## Content

- [Status][4]
- [Prerequisites][5]
- [Installation][6]
- [Pinecone][7]
- [Supabase][8]
- [GitHub][9]

## Status

This is still in an early alpha phase. There is a command-line interface, it supports text and Markdown files as input,
uses OpenAI `text-embedding-ada-002` for embeddings, [Pinecone][10] and [Supabase][11] for vector storage, and the
OpenAI `gpt-3.5-turbo` completion model.

Ideas for extension:

- Make it chatty, conversational (it's only single shots now)
- Better support for source code files (e.g. Python, TypeScript).
- Support more source file formats (e.g. PDF, HTML, web scraping).
- Make it easy to create a user-friendly web UI to query.

## Prerequisites

- Node.js v16+
- OpenAI API key
- Pinecone or Supabase account, plus API keys
- When ingesting lots of files from GitHub, a GitHub token

## Installation

You can install 7-docs in two ways:

- [Global][12] to manage knowledge base(s) from the command line.
- [Local][13] to manage the knowledge base(s) of a repository.

### Global

Use `7d` from anywhere to manage your personal knowledge bases:

```shell
npm install --global 7-docs
```

Get an [OpenAI API key][14] and make it available as en environment variable:

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

Now let's choose either [Pinecone][7] or [Supabase][8]!

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

![Demo of Pinecone index creation][15]

Let's ingest some text or Markdown files, make sure to adjust the `--files` pattern to match yours:

```shell
7d ingest --files README.md --files 'docs/**/*.md' --namespace my-collection
```

Now you can start asking questions about it:

```shell
7d Can you please give me a summary?
```

## Supabase

Make sure to have a Supabase account and set `SUPABASE_URL` and `SUPABASE_API_KEY`:

```shell
export SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
export SUPABASE_API_KEY="ey..."
```

Print the SQL query to enable [pgvector][16] and create a table (paste the output in the [Supabase web admin][17]):

```shell
7d supabase-create-table --namespace my-collection
```

Let's ingest some text or Markdown files, make sure to adjust the `--files` pattern to match yours:

```shell
7d ingest --files README.md --files 'docs/**/*.md'
```

Now you can start asking questions about it:

```shell
7d Can you please give me a summary?
```

## GitHub

Instead of local files, ingest files from any GitHub repo, for instance:

```shell
7d ingest --source github --repo reactjs/react.dev --files 'src/content/reference/react/*.md' --namespace react
```

You can start without it, but once you start fetching lots of files you'll need to set `GITHUB_TOKEN`:

    export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

![Demo of ingest and query][18]

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

The recommended [text-embedding-ada-002][19] model is used to create embeddings. Ingestion uses some tokens when
ingesting lots of files. Queries use only a few tokens (using the [gpt-3.5-turbo][20] model by default). See the console
for details.

## Inspired by

- [Paul Kinlan][21]
- [OpenAI Cookbook][22]
- [Polymath][23]

[1]: ./assets/ingest-and-query.gif
[2]: https://7-docs-deno-supabase.deno.dev
[3]: https://github.com/7-docs/deno-supabase
[4]: #status
[5]: #prerequisites
[6]: #installation
[7]: #pinecone
[8]: #supabase
[9]: #github
[10]: https://www.pinecone.io
[11]: https://supabase.com
[12]: #global
[13]: #local
[14]: https://platform.openai.com/account/api-keys
[15]: assets/pinecone-create-index.gif
[16]: https://supabase.com/docs/guides/database/extensions/pgvector
[17]: https://app.supabase.com/projects
[18]: ./assets/ingest-and-query-2.gif
[19]: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
[20]: https://platform.openai.com/docs/guides/chat
[21]: https://github.com/PaulKinlan/paul.kinlan.me
[22]: https://github.com/openai/openai-cookbook
[23]: https://github.com/polymath-ai/polymath-ai
