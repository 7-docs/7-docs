import { OPENAI_OUTPUT_DIMENSIONS } from '@7-docs/shared/constants.js';
import { normalizeNamespace } from '@7-docs/shared/string.js';
import { set } from '../util/storage.js';

export const createTable = (namespace: string) => {
  if (!namespace) throw new Error('No name provided with --namespace');

  const ns = normalizeNamespace(namespace);

  const vectorExtenion = `CREATE EXTENSION IF NOT EXISTS vector;`;

  const query = `CREATE TABLE IF NOT EXISTS ${ns} (id uuid PRIMARY KEY, metadata jsonb, embedding vector(${OPENAI_OUTPUT_DIMENSIONS}));`;

  const fnQuery = `CREATE OR REPLACE function match_${ns} (
    query_embedding vector(${OPENAI_OUTPUT_DIMENSIONS}),
    similarity_threshold float,
    match_count int
  )
  returns TABLE (id uuid, metadata jsonb, similarity float)
  LANGUAGE plpgsql
  AS $$
  BEGIN
    return query
    SELECT ${ns}.id, ${ns}.metadata, 1 - (${ns}.embedding <=> query_embedding) AS similarity
    FROM ${ns}
    WHERE 1 - (${ns}.embedding <=> query_embedding) > similarity_threshold
    ORDER BY ${ns}.embedding <=> query_embedding
    LIMIT match_count;
  END; $$;`;

  console.log('Choose or create your project in https://app.supabase.com and paste the following in the SQL Editor:\n');
  console.log(vectorExtenion);
  console.log(query);
  console.log(fnQuery);

  set('db', 'type', 'supabase');
};
