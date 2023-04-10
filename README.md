# 7-docs

Use local files or any GitHub repository as a source, and ask questions through ChatGPT about it.

Works with OpenAI and a [Pinecone][1] or [Supabase][2] vector database.

## Install

You can install 7-docs in two ways:

- Use a [global](#global) installation to manage knowledge base(s) from the command line.
- Use a [local](#local) installation to manage the knowledge base(s) of a single repository.

### Global

Use `7d` from anywhere to manage your personal knowledge bases:

```shell
npm install --global 7-docs
```

Get an [OpenAI API key][3] and store it:

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

Store only the variables you need in a local `.env` file in the root of your project:

```shell
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
PINECONE_ENVIRONMENT="us-xxxxx-xxx"
PINECONE_API_KEY="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
SUPABASE_URL="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
SUPABASE_API_KEY="eyxxx.xxx.xxx"
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

For local installations, use `npx 7d` (over just `7d`).

Now let's choose either [Pinecone][4] or [Supabase][5]!

## Pinecone

Make sure to have a Pinecone account and set `PINECONE_ENVIRONMENT` and `PINECONE_API_KEY`:

```shell
export PINECONE_ENVIRONMENT=us-xxxxx-xxx
export PINECONE_API_KEY=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Create or select an index:

```shell
7d pinecone-set-index --index my-index
```

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

Print the SQL query to enable [pgvector][6] and create a table (paste the output in the [Supabase web admin][7]):

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

## Other commands

Other convenience commands not mentioned yet.

### `pinecone-clear-namespace`

Clear a single namespace from the current Pinecone index:

```shell
 7d pinecone-clear-namespace --namespace my-collection
```

## Token Usage

The recommended [text-embedding-ada-002][8] model is used to create embeddings. Ingestion uses some tokens when
ingesting lots of files. Queries use only a few tokens (using the [gpt-3.5-turbo][9] model by default). See the console
for details.

## Inspired by

- [Paul Kinlan][10]
- [OpenAI Cookbook][11]
- [Polymath][12]

[1]: https://www.pinecone.io
[2]: https://supabase.com
[3]: https://platform.openai.com/account/api-keys
[4]: #pinecone
[5]: #supabase
[6]: https://supabase.com/docs/guides/database/extensions/pgvector
[7]: https://app.supabase.com/projects
[8]: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
[9]: https://platform.openai.com/docs/guides/chat
[10]: https://github.com/PaulKinlan/paul.kinlan.me
[11]: https://github.com/openai/openai-cookbook
[12]: https://github.com/polymath-ai/polymath-ai
