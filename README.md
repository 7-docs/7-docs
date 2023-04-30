# 7-docs

Build a knowledge base and ask it questions through OpenAI APIs. Chat with your content!

7-docs is a powerful set of OpenAI-based tools and ingest content to store into a vector database, ready to get queried
like you would with ChatGPT.

- Use `@7-docs/cli` to ingest content from the command-line
- Use `@7-docs/edge` for deploying functions to query the content (aka "chat completions")

## Impression

### Ingest from CLI

![Demo of ingest and query][1]

Use the `7d` CLI tool from [@7-docs/cli][2] to ingest content.

As shown in the example, you can also use `7d` to query the content from the CLI (just like chat completions).

### Query from UI

Use [@7-docs/edge][3] to build your own functions for chat completions.

See the [7-docs organization page][4] for demos and starter kits.

## Inspired by

- [Paul Kinlan][5]
- [OpenAI Cookbook][6]
- [Polymath][7]

[1]: ./assets/ingest-and-query.gif
[2]: https://github.com/7-docs/7-docs/blob/main/packages/cli/README.md
[3]: https://github.com/7-docs/7-docs/blob/main/packages/edge/README.md
[4]: https://github.com/7-docs
[5]: https://github.com/PaulKinlan/paul.kinlan.me
[6]: https://github.com/openai/openai-cookbook
[7]: https://github.com/polymath-ai/polymath-ai
