# @7-docs/edge

Query your content from anywhere JavaScript runs.

After ingesting content using [@7-docs/cli][1], request "chat completions" using `@7-docs/edge`.

No dependencies, uses `fetch()`.

## Usage

Curently there are adapters for Pinecone and Supabase. Pull requests to add more are welcome.

### Pinecone

```ts
import { getCompletionHandler, pinecone } from 'https://esm.sh/@7-docs/edge'; // from '@7-docs/edge' in Node.js

const namespace = 'namespace-within-pinecone-index';

const sytem = 'Answer the question using the provided context.';

const prompt = `Context: {CONTEXT}
Question: {QUERY}
Answer: `;

const query = (vector: number[]) =>
  pinecone.query({
    url: PINECONE_URL,
    token: PINECONE_API_KEY,
    vector,
    namespace,
  });

const handler = getCompletionHandler({ OPENAI_API_KEY, query, system, prompt });

export function GET(req: Request) {
  return handler(req);
}
```

### Supabase

```ts
import { getCompletionHandler, supabase } from 'https://esm.sh/@7-docs/edge'; // from '@7-docs/edge' in Node.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js'; // from '@supabase/supabase-js' in Node.js

const namespace = 'table-in-supabase';

const sytem = 'Answer the question using the provided context.';

const prompt = `Context: {CONTEXT}
Question: {QUERY}
Answer: `;

const client = createClient(SUPABASE_URL, SUPABASE_API_KEY);
const query = (vector: number[]) => supabase.query({ client, namespace, vector });

const handler = getCompletionHandler({ OPENAI_API_KEY, query, system, prompt });

export default function (req: Request) {
  return handler(req);
}
```

## Edge + UI example using (P)react

See [github.com/7-docs/demo-react][2] for a full example.

## CLI

To query the content from the CLI, use [@7-docs/cli][1].

[1]: https://github.com/7-docs/7-docs/blob/main/packages/cli/README.md
[2]: https://github.com/7-docs/demo-react
