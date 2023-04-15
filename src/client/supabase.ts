import { EMBEDDING_MATCH_COUNT, SUPABASE_SIMILARITY_THRESHOLD } from '@7-docs/shared/constants.js';
import { normalizeNamespace } from '@7-docs/shared/string.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_API_KEY } from '../env.js';
import type { VectorDatabase, UpsertVectorOptions, QueryOptions } from '../types.js';
import type { MetaData } from '@7-docs/shared';

type Result = { id: string; metadata: string; similarity: number };
type Results = undefined | Result[];

export class Supabase implements VectorDatabase {
  client: SupabaseClient;

  constructor() {
    if (!SUPABASE_URL) throw new Error('Missing SUPABASE_URL environment variable');
    if (!SUPABASE_API_KEY) throw new Error('Missing SUPABASE_API_KEY environment variable');
    this.client = createClient(SUPABASE_URL, SUPABASE_API_KEY);
  }

  async upsertVectors({ namespace, vectors }: UpsertVectorOptions) {
    const ns = normalizeNamespace(namespace);
    const rows = vectors.map(v => ({ id: v.id, embedding: v.values, metadata: JSON.stringify(v.metadata) }));
    const { error } = await this.client.from(ns).upsert(rows);
    if (error instanceof Error) throw error;
    return vectors.length;
  }

  async query({ embedding, namespace }: QueryOptions): Promise<MetaData[]> {
    const ns = normalizeNamespace(namespace);
    const { error, data } = await this.client.rpc(`match_${ns}`, {
      query_embedding: embedding,
      similarity_threshold: SUPABASE_SIMILARITY_THRESHOLD,
      match_count: EMBEDDING_MATCH_COUNT
    });
    if (error instanceof Error) throw error;
    return (data as Results)?.map(d => JSON.parse(d.metadata)) ?? [];
  }
}
