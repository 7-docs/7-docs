import type { CreateChatCompletionRequest } from '@7-docs/shared';

interface ChatCompletionsOptions {
  token: string;
  body: CreateChatCompletionRequest;
}

export const chatCompletions = async ({ token, body }: ChatCompletionsOptions) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) console.log(response);

  return response;
};
