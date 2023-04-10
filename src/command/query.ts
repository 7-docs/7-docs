import _fs from 'node:fs/promises';
import { ChatCompletionRequestMessage } from 'openai';
import { encode } from 'gpt-3-encoder';
import { createEmbedding, createChatCompletion } from '../client/openai.js';
import { Pinecone } from '../client/pinecone.js';
import { Supabase } from '../client/supabase.js';
import { OPENAI_MAX_COMPLETION_TOKENS, OPENAI_TOKENS_FOR_COMPLETION, OPENAI_EMBEDDING_MODEL } from '../constants.js';
import { uniqueByProperty } from '../util/array.js';
import { addTokens, getInitUsage } from '../util/usage.js';

const targets = {
  Pinecone,
  Supabase
};

type Options = {
  db?: string;
  namespace: string;
  query: string;
};

const intro = `Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "Sorry, I don't have that information.".`;

const getPrompt = (context: string, query: string) => {
  return `${intro}\n\nContext:${context}\n\nQuestion: ${query}\n\nAnswer:`;
};

const availableTokens = OPENAI_MAX_COMPLETION_TOKENS - OPENAI_TOKENS_FOR_COMPLETION - encode(getPrompt('', '')).length;

const ask = async ({ db, namespace, query }: Options) => {
  const counters = {
    usage: getInitUsage()
  };

  const response = await createEmbedding({ input: query, model: OPENAI_EMBEDDING_MODEL });

  counters.usage = addTokens(counters.usage, [response.usage]);

  const DB = new targets[db as keyof typeof targets]();

  const metadata = await DB.query({ embedding: response.embeddings[0], namespace });

  if (metadata.length === 0) return { text: `No results from ${db} query.`, links: [], counters };

  const links = uniqueByProperty(metadata, 'url');
  const text = metadata.map(metadata => metadata.content);
  const [, promptText] = text.reduce(
    ([remainingTokens, context], text) => {
      const tokens = encode(text).length;
      if (tokens > remainingTokens) return [remainingTokens, context];
      return [remainingTokens - tokens, context + '\n' + text];
    },
    [availableTokens, ''] as [number, string]
  );

  if (text && text.length > 0) {
    const prompt = getPrompt(promptText, query);

    const messages: ChatCompletionRequestMessage[] = [];

    messages.push({
      role: 'user',
      content: prompt
    });

    const { text, usage } = await createChatCompletion({ messages });

    if (usage) counters.usage = addTokens(counters.usage, [usage]);

    return { text, links, counters };
  }
};

export const query = async ({ db, namespace, query }: Options) => {
  if (!db || !(db in targets)) throw new Error(`Invalid --db: ${db}`);
  if (query.length < 3) throw new Error('Query must exceed 2 characters');

  const response = await ask({ db, namespace, query });
  if (response) {
    console.log(response.text);
    if (response.links.length > 0) {
      console.log('\nThe locations received to answer your question may contain more information:\n');
      console.log(response.links?.map(link => `- ${link.url ?? link.filePath}`).join('\n'));
    }
    if (response.counters) {
      const { total_tokens, prompt_tokens, completion_tokens } = response.counters.usage;
      console.log(`\nOpenAI token usage: ${total_tokens} (${prompt_tokens} prompt + ${completion_tokens} completion)`);
    }
  }
};
