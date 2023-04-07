import { ParseArgsConfig, parseArgs } from 'util';
import { ChatCompletionRequestMessage } from 'openai';
import { encode } from 'gpt-3-encoder';
import { openai, createEmbedding } from '../client/openai';
import { pinecone } from '../client/pinecone';
import {
  OPENAI_MAX_COMPLETION_TOKENS,
  OPENAI_TOKENS_FOR_COMPLETION,
  PINECONE_NAMESPACE,
  PINECONE_INDEX,
  OPENAI_EMBEDDING_MODEL,
  OPENAI_COMPLETION_MODEL
} from '../env';
import { uniqueByProperty } from '../util/array';
import type { MetaData } from '../types';

const pineconeIndex = pinecone.Index(PINECONE_INDEX);

let input;
try {
  const parsed = parseArgs({ options: { query: { type: 'string', short: 'q' } }, allowPositionals: true });
  const { positionals, values } = parsed;
  input = values.query ?? positionals.join(' ').trim();
  if (!input) throw new Error('Usage: npm run query -- Does release-it generate a changelog?');
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
    process.exit(1);
  }
  throw error;
}

const intro = `Answer the question as truthfully as possible using the provided context,
               and if the answer is not contained within the text below, say "Sorry, I don't have that information.".`;

const getPrompt = (context: string, query: string) => {
  return `${intro}\n\nContext:${context}\n\nQuestion: ${query}\n\nAnswer:`;
};

const availableTokens = OPENAI_MAX_COMPLETION_TOKENS - OPENAI_TOKENS_FOR_COMPLETION - encode(getPrompt('', '')).length;

const ask = async (input: string) => {
  const embedding = await createEmbedding({ input, model: OPENAI_EMBEDDING_MODEL });

  const results = await pineconeIndex.query({
    queryRequest: {
      vector: embedding[0],
      namespace: PINECONE_NAMESPACE,
      topK: 5,
      includeMetadata: true
    }
  });

  if (!results.matches) return { text: 'No results from Pinecone query.', links: [] };

  const metadata = results.matches.map(match => match.metadata).filter((m): m is MetaData => !!m);
  const links = uniqueByProperty(metadata, 'url');
  const text = metadata.map(metadata => metadata.text);
  const [, promptText] = text.reduce(
    ([remainingTokens, context], text) => {
      const tokens = encode(text).length;
      if (tokens > remainingTokens) return [remainingTokens, context];
      return [remainingTokens - tokens, context + '\n' + text];
    },
    [availableTokens, ''] as [number, string]
  );

  if (text && text.length > 0) {
    const prompt = getPrompt(promptText, input);

    const messages: ChatCompletionRequestMessage[] = [];

    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await openai.createChatCompletion({
      model: OPENAI_COMPLETION_MODEL,
      messages: messages,
      temperature: 0,
      max_tokens: OPENAI_TOKENS_FOR_COMPLETION,
      top_p: 1,
      n: 1,
      stream: false,
      stop: undefined,
      presence_penalty: 0,
      frequency_penalty: 0
    });

    const text = response.data.choices[0].message?.content?.trim();

    return { text, links };
  }
};

if (input) {
  const response = await ask(input);
  if (response) {
    console.log(response.text);
    if (response.links.length > 0) {
      console.log('\nThe locations I used for this answer may contain more information:\n');
      console.log(response.links?.map(link => `- [${link.title}](${link.url})`).join('\n'));
    }
  }
}
