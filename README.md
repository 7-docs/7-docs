# 7-docs

Use any public GitHub repository as a source and ask questions through ChatGPT about it.

Two steps to get it up and running:

1.  **Create**: [Pinecone][1] account + index (a single instance is free)
2.  **Ingest**: choose a public GitHub repo and use its Markdown files as data sources for ingestion

Then it's ready to ask it anything like you would using ChatGPT.

## Prerequisites

- Clone the repo
- [OpenAI API key][2]
- [Pinecone API key][3]
- [GitHub token][4]
- Copy [.env.example][5] (`cp .env.example .env`) and set your own tokens.

## Pinecone

- Make sure the Pinecone index has **1536** dimensions.
- OpenAI recommends using the `cosine` distance function, so let's use that metric.

You can use multiple, separated namespaces (set `PINECONE_NAMESPACE`) to ingest and query.

## GitHub

- Point `GITHUB_REPO` to any public repo (i.e. `owner/repo`)
- Set `GITHUB_FILES` (default: `['*.md', 'docs/*.md']`), use e.g. `**/*.md` for all Markdown files in the repo.
- Plain text files should be fine too.

## Commands

Note that running the following commands uses OpenAI tokens. By default, the recommended [text-embedding-ada-002][6]
model is used to create embeddings. Ingestion uses some tokens when ingesting lots of files. Queries use only a few
tokens (using the [gpt-3.5-turbo][7] model by default). See the console for details.

### Ingest

Download the GitHub repo files, create embeddings and upsert everything into Pinecone:

```shell
npm run ingest
```

### Query

Now it's ready to be queried. Ask it anything:

```shell
npm run query -- How do I configure this thing?
```

## Inspired by

- [Paul Kinlan][8]
- [OpenAI Cookbook][9]
- [Polymath][10]

[1]: https://www.pinecone.io
[2]: https://platform.openai.com/account/api-keys
[3]: https://app.pinecone.io
[4]: https://github.com/settings/tokens
[5]: ./.env.example
[6]: https://platform.openai.com/docs/guides/embeddings/what-are-embeddings
[7]: https://platform.openai.com/docs/guides/chat
[8]: https://github.com/PaulKinlan/paul.kinlan.me
[9]: https://github.com/openai/openai-cookbook
[10]: https://github.com/polymath-ai/polymath-ai
