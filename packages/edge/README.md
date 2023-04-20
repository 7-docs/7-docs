# @7-docs/edge

Use [7-docs](https://github.com/7-docs/7-docs) from edge functions.

After ingesting content using 7-docs, it can be queried from web or the command-line interface.

## Usage

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.20.0';
import { getCompletionHandler } from '@7-docs/edge';
import * as supabase from '@7-docs/edge/supabase';

const namespace = 'table-in-supabase';

const prompt = `Answer the question using the provided context.
Context: {CONTEXT}
Question: {QUERY}
Answer:`;

const client = createClient(SUPABASE_URL, SUPABASE_API_KEY);
const query = (vector: number[]) => supabase.query({ client, namespace, vector });

const handler = getCompletionHandler({ OPENAI_API_KEY, query, prompt });

export default function (req: Request) {
  return handler(req);
}
```

## Edge + UI example using (P)react

See [github.com/7-docs/demo-react](https://github.com/7-docs/demo-react) for a full example.

## CLI

To query the content from the CLI, [7-docs](https://github.com/7-docs/7-docs) includes the `7d` executable to do this.
