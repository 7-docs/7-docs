import type { CreateCompletionRequest } from 'openai';

interface CompletionsOptions {
  token: string;
  body: CreateCompletionRequest;
}

export const completions = async ({ token, body }: CompletionsOptions) => {
  const response = await fetch('https://api.openai.com/v1/completions', {
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
