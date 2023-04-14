# 7-docs

Build a knowledge base and ask it questions through OpenAI APIs.

`7d` is a powerful tool to ingest text files and store them in a vector database, ready to get queried like you would
with ChatGPT. Multiple sources can be combined into one namespace.

## Impression

![Demo of ingest and query](./assets/ingest-and-query.gif)

## Content

- [Status](#status)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Pinecone](#pinecone)
- [Supabase](#supabase)
- [GitHub](#github)

## Status

This is still in an early alpha phase. There is a command-line interface, it supports text and Markdown files as input,
uses OpenAI `text-embedding-ada-002` for embeddings, [Pinecone][1] and [Supabase][2] for vector storage, and the OpenAI
`gpt-3.5-turbo` completion model.

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

- [Global][3] to manage knowledge base(s) from the command line.
- [Local][4] to manage the knowledge base(s) of a repository.

### Global

Use `7d` from anywhere to manage your personal knowledge bases:

```shell
npm install --global 7-docs
```

Get an [OpenAI API key][5] and make it available as en environment variable:

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

Make sure to have a Pinecone account and set `PINECONE_URL` and `PINECONE_API_KEY`:

```shell
export PINECONE_URL=xxxxx-xxxxxxx.svc.us-xxxxx-gcp.pinecone.io
export PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Create or select an index:

```shell
7d pinecone-create-index --index my-index
```

![Demo of Pinecone index creation](assets/pinecone-create-index.gif)

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

Print the SQL query to enable [pgvector][8] and create a table (paste the output in the [Supabase web admin][9]):

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

![Demo of ingest and query](./assets/ingest-and-query-2.gif)

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

The recommended [text-embedding-ada-002][10] model is used to create embeddings. Ingestion uses some tokens when
ingesting lots of files. Queries use only a few tokens (using the [gpt-3.5-turbo][11] model by default). See the console
for details.

## Inspired by

- [Paul Kinlan][12]
- [OpenAI Cookbook][13]
- [Polymath][14]

[1]: https://www.pinecone.io
[2]: https://supabase.com
[3]: #global
[4]: #local
[5]: https://platform.openai.com/account/api-keys
[6]: #pinecone
[7]: #supabase
[8]: https://supabase.com/docs/guides/database/extensions/pgvector
[9]: https://app.supabase.com/projects
[10]: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
[11]: https://platform.openai.com/docs/guides/chat
[12]: https://github.com/PaulKinlan/paul.kinlan.me
[13]: https://github.com/openai/openai-cookbook
[14]: https://github.com/polymath-ai/polymath-ai
