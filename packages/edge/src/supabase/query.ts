import { EMBEDDING_MATCH_COUNT, SUPABASE_SIMILARITY_THRESHOLD } from '@7-docs/shared';
import { normalizeNamespace } from '@7-docs/shared';
import type { MetaData } from '@7-docs/shared';
import type { SupabaseClient } from '@supabase/supabase-js';

export type SupabaseRpcArgs = {
  similarity_threshold: number;
  match_count: number;
};

const defaults: SupabaseRpcArgs = {
  similarity_threshold: SUPABASE_SIMILARITY_THRESHOLD,
  match_count: EMBEDDING_MATCH_COUNT
};

type Result = { id: string; metadata: string; similarity: number };
type Results = undefined | Result[];

type Query = (options: {
  client: SupabaseClient;
  namespace: string;
  vector: number[];
  args?: Partial<SupabaseRpcArgs>;
}) => Promise<MetaData[]>;

export const query: Query = async ({ client, namespace, vector, args }) => {
  const ns = normalizeNamespace(namespace);

  const { error, data } = await client.rpc(`match_${ns}`, {
    ...defaults,
    ...args,
    query_embedding: vector
  });

  if (error instanceof Error) throw error;

  return (
    (data as Results)?.map(d => {
      const metadata = JSON.parse(d.metadata);
      return { ...metadata, score: d.similarity };
    }) ?? []
  );
};
