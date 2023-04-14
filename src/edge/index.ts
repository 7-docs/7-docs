import { query as pineconeQuery } from '../client/pinecone/query.js';
import { query as supabaseQuery } from '../client/supabase/query.js';

export { getCompletionHandler } from './completion.js';

export const pinecone = { query: pineconeQuery };

export const supabase = { query: supabaseQuery };
