import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_API_KEY, OPENAI_VECTOR_DIMENSION } from '../constants.js';
import { VectorDatabase, UpsertVectorOptions, QueryOptions, MetaData } from '../types.js';
import { set } from '../util/storage.js';

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
    console.log(`Upserting ${vectors.length} vectors for ${vectors[0].metadata?.filePath}`);
    let vectorCount = 0;
    const rows = vectors.map(v => ({ id: v.id, embedding: v.values, metadata: JSON.stringify(v.metadata) }));
    const { error } = await this.client.from(namespace).upsert(rows);
    if (error instanceof Error) throw error;
    if (!error) vectorCount += vectors.length;
    return vectorCount;
  }

  async query({ embedding, namespace }: QueryOptions): Promise<MetaData[]> {
    const { error, data } = await this.client.rpc(`match_${namespace}`, {
      query_embedding: embedding,
      similarity_threshold: 0.78, // Choose an appropriate threshold for your data
      match_count: 10 // Choose the number of matches
    });
    if (error instanceof Error) throw error;
    return (data as Results)?.map(d => JSON.parse(d.metadata)) ?? [];
  }
}

export const createTable = async (name: string) => {
  if (!name) throw new Error('No name provided with --namespace');

  const vectorExtenion = `CREATE EXTENSION IF NOT EXISTS vector;`;

  const query = `CREATE TABLE IF NOT EXISTS ${name} (id uuid PRIMARY KEY, metadata jsonb, embedding vector(${OPENAI_VECTOR_DIMENSION}));`;

  const fnQuery = `CREATE OR REPLACE function match_${name} (
    query_embedding vector(${OPENAI_VECTOR_DIMENSION}),
    similarity_threshold float,
    match_count int
  )
  returns TABLE (id uuid, metadata jsonb, similarity float)
  LANGUAGE plpgsql
  AS $$
  BEGIN
    return query
    SELECT ${name}.id, ${name}.metadata, 1 - (${name}.embedding <=> query_embedding) AS similarity
    FROM ${name}
    WHERE 1 - (${name}.embedding <=> query_embedding) > similarity_threshold
    ORDER BY ${name}.embedding <=> query_embedding
    LIMIT match_count;
  END; $$;`;

  console.log('Choose or create your project in https://app.supabase.com and paste the following in the SQL Editor:\n');
  console.log(vectorExtenion);
  console.log(query);
  console.log(fnQuery);

  set('db', 'type', 'supabase');
};
