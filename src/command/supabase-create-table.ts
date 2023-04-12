import { OPENAI_OUTPUT_DIMENSIONS } from '../constants.js';
import { set } from '../util/storage.js';

export const createTable = (name: string) => {
  if (!name) throw new Error('No name provided with --namespace');

  const vectorExtenion = `CREATE EXTENSION IF NOT EXISTS vector;`;

  const query = `CREATE TABLE IF NOT EXISTS ${name} (id uuid PRIMARY KEY, metadata jsonb, embedding vector(${OPENAI_OUTPUT_DIMENSIONS}));`;

  const fnQuery = `CREATE OR REPLACE function match_${name} (
    query_embedding vector(${OPENAI_OUTPUT_DIMENSIONS}),
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
