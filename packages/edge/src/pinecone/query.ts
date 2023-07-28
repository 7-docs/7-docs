import { EMBEDDING_MATCH_COUNT } from '@7-docs/shared';
import { ensureProtocol, sortByScoreDesc } from './util.js';
import type { MetaData } from '@7-docs/shared';
import type { QueryRequest, QueryResponse } from '@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch';

const defaults: QueryRequest = {
  topK: EMBEDDING_MATCH_COUNT,
  includeMetadata: true
};

type Query = (options: {
  url: string;
  token: string;
  vector: number[];
  namespace: string;
  options?: Partial<QueryRequest>;
}) => Promise<MetaData[]>;

export const query: Query = async ({ url, token, vector, namespace, options }) => {
  const response = await fetch(`${ensureProtocol(url)}/query`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Api-Key': token
    },
    method: 'POST',
    body: JSON.stringify({ ...defaults, ...options, vector, namespace })
  });

  const data: QueryResponse = await response.json();
  const matches = data.matches?.sort(sortByScoreDesc) ?? [];

  return matches
    .map(match => ({ ...match.metadata, score: match.score } as MetaData))
    .filter((m): m is MetaData => !!m);
};
