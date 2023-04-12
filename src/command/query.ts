import { ChatCompletionRequestMessage } from 'openai';
import { encode } from 'gpt-3-encoder';
import ora from 'ora';
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
  stream: boolean;
};

const intro = `Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "Sorry, I don't have that information.".`;

const getPrompt = (context: string, query: string) => {
  return `${intro}\n\nContext:${context}\n\nQuestion: ${query}\n\nAnswer:`;
};

const availableTokens = OPENAI_MAX_COMPLETION_TOKENS - OPENAI_TOKENS_FOR_COMPLETION - encode(getPrompt('', '')).length;

export const query = async ({ db, namespace, query, stream }: Options) => {
  if (!db || !(db in targets)) throw new Error(`Invalid --db: ${db}`);
  if (query.length < 3) throw new Error('Query must exceed 2 characters');

  const counters = {
    usage: getInitUsage()
  };

  const spinner = ora(`Creating query embedding`).start();

  try {
    const response = await createEmbedding({ input: query, model: OPENAI_EMBEDDING_MODEL });

    counters.usage = addTokens(counters.usage, [response.usage]);

    const DB = new targets[db as keyof typeof targets]();

    spinner.text = `Querying ${db} for matching vectors`;

    const metadata = await DB.query({ embedding: response.embeddings[0], namespace });

    if (metadata.length === 0) {
      throw new Error(`No results returned from ${db} query`);
    } else {
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

        spinner.text = `Requesting OpenAI chat completion`;

        if (stream) spinner.succeed('Streaming response:');

        const { text, usage } = await createChatCompletion({ messages, stream });

        if (!stream) spinner.succeed();

        if (usage) counters.usage = addTokens(counters.usage, [usage]);

        if (text) console.log(text);

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
