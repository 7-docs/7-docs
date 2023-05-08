import { ensureProtocol } from '../util.js';
import type { UpsertRequest } from '@pinecone-database/pinecone';
import type { UpsertResponse } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

type Upsert = (options: { url: string; token: string; body: UpsertRequest }) => Promise<UpsertResponse>;

export const upsert: Upsert = async ({ url, token, body }) => {
  const response = await fetch(`${ensureProtocol(url)}/vectors/upsert`, {
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
    const message = `${response.status} ${response.statusText}: ${text ?? `Unable to upsert vectors`})`;
    throw new Error(message);
  }

  return response.json();
};
