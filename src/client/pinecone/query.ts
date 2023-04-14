import { ensureProtocol, sortByScoreDesc } from './util.js';
import type { QueryResponse } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';
import type { MetaData } from '../../types';
import { EMBEDDING_MATCH_COUNT } from '../../constants.js';

const defaults = {
  topK: EMBEDDING_MATCH_COUNT,
  includeMetadata: true
};

type Query = (options: { url: string; token: string; vector: number[]; namespace: string }) => Promise<MetaData[]>;

export const query: Query = async ({ url, token, vector, namespace }) => {
  const response = await fetch(`${ensureProtocol(url)}/query`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': token
    },
    method: 'POST',
    body: JSON.stringify({ ...defaults, vector, namespace })
  });

  const data: QueryResponse = await response.json();
  const matches = data.matches?.sort(sortByScoreDesc) ?? [];
  return matches.map(match => match.metadata).filter((m): m is MetaData => !!m) ?? [];
};
