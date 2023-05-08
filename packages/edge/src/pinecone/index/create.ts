import { getControllerUrl } from '../util.js';
import type { CreateRequest } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

type CreateIndex = (options: { environment: string; token: string; body: CreateRequest }) => Promise<void>;

export const createIndex: CreateIndex = async ({ environment, token, body }) => {
  const response = await fetch(getControllerUrl(environment), {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': token
    },
    method: 'POST',
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const text = await response.text();
    const message = `${response.status} ${response.statusText}: ${text ?? `Unable to create new index`})`;
    throw new Error(message);
  }
};
