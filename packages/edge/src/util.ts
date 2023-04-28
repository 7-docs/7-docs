import type { ChatCompletionEventData, CompletionEventData, EventData, Params } from '@7-docs/shared';
import type { CreateChatCompletionResponse } from '@7-docs/shared';

export const getParams = async (req: Request): Promise<Params> => {
  const method = req.method;
  if (method === 'GET') {
    const url = new URL(req.url);
    const query = url.searchParams.get('query') ?? '';
    const previousQueries = url.searchParams.getAll('previousQueries');
    const previousResponses = url.searchParams.getAll('previousResponses');
    const embedding_model = url.searchParams.get('embedding_model') ?? undefined;
    const completion_model = url.searchParams.get('completion_model') ?? undefined;
    const stream = true;

    return {
      query: decodeURIComponent(query),
      previousQueries: previousQueries.map(decodeURIComponent),
      previousResponses: previousResponses.map(decodeURIComponent),
      embedding_model,
      completion_model,
      stream
    };
  } else {
    return await req.json();
  }
};

export const streamResponse = (body: BodyInit | null) => {
  const headers = { 'Content-Type': 'text/event-stream' };
  return new Response(body, { headers });
};

const isChatCompletion = (data: EventData): data is ChatCompletionEventData => data.object === 'chat.completion.chunk';

const isCompletion = (data: EventData): data is CompletionEventData => data.object === 'text_completion';

export const getDelta = (data: EventData) =>
  isChatCompletion(data) ? data.choices[0].delta.content : isCompletion(data) ? data.choices[0].text : '';

export const getText = (response: CreateChatCompletionResponse) => response.choices[0].message?.content;
