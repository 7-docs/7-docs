import { OpenAI } from '@7-docs/edge/openai';
import { OPENAI_EMBEDDING_MODEL } from '@7-docs/shared';
import { getPrompt } from '@7-docs/shared';
import { Pinecone } from '../client/pinecone.js';
import { Supabase } from '../client/supabase.js';
import { OPENAI_API_KEY } from '../env.js';
import { uniqueByProperty } from '../util/array.js';
import ora from '../util/ora.js';
import { writeToStdOut } from '../util/stream.js';
import { addTokens, getInitUsage } from '../util/usage.js';
import type { ChatCompletionRequestMessage } from '@7-docs/shared';

const targets = {
  Pinecone,
  Supabase
};

type Options = {
  db?: string;
  namespace: string;
  query: string;
  stream: boolean;
};

export const query = async ({ db, namespace, query, stream }: Options) => {
  if (!db || !(db in targets)) throw new Error(`Invalid --db: ${db}`);
  if (query.length < 3) throw new Error('Query must exceed 2 characters');

  const counters = {
    usage: getInitUsage()
  };

  const spinner = ora(`Creating query embedding`).start();

  try {
    const client = new OpenAI(OPENAI_API_KEY);
    const response = await client.createEmbeddings({ input: query, model: OPENAI_EMBEDDING_MODEL });

    counters.usage = addTokens(counters.usage, [response.usage]);

    const DB = new targets[db as keyof typeof targets]();

    spinner.text = `Querying ${db} for matching vectors`;

    const metadata = await DB.query({ embedding: response.embeddings[0], namespace });

    if (metadata.length === 0) {
      throw new Error(`No results returned from ${db} query`);
    } else {
      const links = uniqueByProperty(metadata, 'url');
      const context = metadata.map(metadata => metadata.content);
      const prompt = getPrompt({ context, query });

      if (prompt) {
        const messages: ChatCompletionRequestMessage[] = [];

        messages.push({
          role: 'user',
          content: prompt
        });

        spinner.text = `Requesting OpenAI chat completion`;

        const body = { model: 'gpt-3.5-turbo', messages, stream };
        const response = await client.chatCompletions(body);

        if (stream) {
          spinner.succeed('Streaming response:');

          if (response.body) {
            const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
            let done = false;
            while (!done) {
              const { value, done: doneReading } = await reader.read();
              done = doneReading;
              writeToStdOut(value);
            }
          }
        } else {
          const data = await response.json();
          const text = data.choices[0].message?.content?.trim();
          const usage = data.usage;

          spinner.succeed();

          console.log(`\n${text}`);

          if (usage) counters.usage = addTokens(counters.usage, [usage]);
        }

        if (links.length > 0) {
          console.log('\nThe locations used to answer your question may contain more information:\n');
          console.log(links?.map(link => `- ${link.url ?? link.filePath}`).join('\n'));
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) spinner.fail(error.message);
    else throw error;
  } finally {
    const { total_tokens, prompt_tokens, completion_tokens } = counters.usage;
    ora(`OpenAI token usage: ${total_tokens} (${prompt_tokens} prompt + ${completion_tokens} completion)`).info();
  }
};
