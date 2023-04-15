import { createClient } from '@supabase/supabase-js';
import { EMBEDDING_MATCH_COUNT, SUPABASE_SIMILARITY_THRESHOLD } from '../../constants.js';
import { normalizeNamespace } from '../../util/string.js';
import type { MetaData } from '../../types';

const defaults = {
  similarity_threshold: SUPABASE_SIMILARITY_THRESHOLD,
  match_count: EMBEDDING_MATCH_COUNT
};

type Result = { id: string; metadata: string; similarity: number };
type Results = undefined | Result[];

type Query = (options: { token: string; url: string; namespace: string; vector: number[] }) => Promise<MetaData[]>;

export const query: Query = async ({ token, url, namespace, vector }) => {
  const ns = normalizeNamespace(namespace);
  const client = createClient(url, token);

  const { error, data } = await client.rpc(`match_${ns}`, {
    ...defaults,
    query_embedding: vector
  });
  if (error instanceof Error) throw error;
  return (data as Results)?.map(d => JSON.parse(d.metadata)) ?? [];
};
