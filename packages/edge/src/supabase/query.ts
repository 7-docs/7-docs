import { EMBEDDING_MATCH_COUNT, SUPABASE_SIMILARITY_THRESHOLD } from '@7-docs/shared/constants.js';
import { normalizeNamespace } from '@7-docs/shared/string.js';
import type { MetaData } from '@7-docs/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

const defaults = {
  similarity_threshold: SUPABASE_SIMILARITY_THRESHOLD,
  match_count: EMBEDDING_MATCH_COUNT
};

type Result = { id: string; metadata: string; similarity: number };
type Results = undefined | Result[];

type Query = (options: { client: SupabaseClient; namespace: string; vector: number[] }) => Promise<MetaData[]>;

export const query: Query = async ({ client, namespace, vector }) => {
  const ns = normalizeNamespace(namespace);

  const { error, data } = await client.rpc(`match_${ns}`, {
    ...defaults,
    query_embedding: vector
  });

  if (error instanceof Error) throw error;

  return (data as Results)?.map(d => JSON.parse(d.metadata)) ?? [];
};
