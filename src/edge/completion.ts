import { getParams, streamResponse } from './util.js';
import { getPrompt } from '../util/prompt.js';
import { OpenAI } from '../client/openai/v1/client.js';
import { isChatCompletionModel } from '../client/openai/v1/util.js';
import type { ChatCompletionRequestMessage } from 'openai';
import type { MetaData } from '../types.js';
import { uniqueByProperty } from '../util/array.js';
import { TransformWithEvent } from '../util/stream.js';

interface Options {
  OPENAI_API_KEY: string;
  query: (vector: number[]) => Promise<MetaData[]>;
}

export const getCompletionHandler = (options: Options) => {
  const { OPENAI_API_KEY, query } = options;

  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY required');

  const client = new OpenAI(OPENAI_API_KEY);

  return async (req: Request): Promise<Response> => {
    const { query: input, embedding_model, completion_model } = await getParams(req);

    if (!input) throw new Error('input required');
    if (!embedding_model) throw new Error('embedding_model required');
    if (!completion_model) throw new Error('completion_model required');

    const { embeddings } = await client.createEmbeddings({ model: embedding_model, input });
    const [vector] = embeddings;

    const queryResults = await query(vector);

    const content = queryResults.map(metadata => metadata.content);
    const prompt = getPrompt(content, input);

    const uniqueByUrl = uniqueByProperty(queryResults, 'url');
    const metadata = uniqueByUrl.map(m => ({ title: m.title, url: m.url }));
    const streamWithEvent = new TransformWithEvent({ event: 'metadata', data: JSON.stringify(metadata) });

    if (isChatCompletionModel(completion_model)) {
      const messages: ChatCompletionRequestMessage[] = [];
      messages.push({
        role: 'user',
        content: prompt
      });

      const body = { model: completion_model, messages };
      const completionResponse = await client.chatCompletions(body);
      if (!completionResponse.body) return new Response();
      const transformedStream = completionResponse.body.pipeThrough(streamWithEvent.getTransformStream());
      return streamResponse(transformedStream);
    } else {
      const body = { model: completion_model, prompt };
      const completionResponse = await client.completions(body);
      return streamResponse(completionResponse.body);
    }
  };
};
