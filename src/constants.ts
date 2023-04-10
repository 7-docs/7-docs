import * as dotenv from 'dotenv';
import { get } from './util/storage.js';

dotenv.config();

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? get('env', 'OPENAI_API_KEY');
export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION; // Not required
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-ada-002';
export const OPENAI_COMPLETION_MODEL = 'gpt-3.5-turbo'; // text-davinci-003, gpt-4
export const OPENAI_MAX_INPUT_TOKENS = 8191;
export const OPENAI_MAX_COMPLETION_TOKENS = 4096;
export const OPENAI_TOKENS_FOR_COMPLETION = 1024; // Tokens reserved for the answer
export const OPENAI_VECTOR_DIMENSION = 1536;
export const OPENAI_TOKENS_PER_WORD = 4 / 3;

export const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT ?? get('env', 'PINECONE_ENVIRONMENT');
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? get('env', 'PINECONE_API_KEY');
export const PINECONE_METRIC = 'cosine';
export const PINECONE_POD_TYPE = 'p2.x1';
export const PINECONE_UPSERT_VECTOR_LIMIT = 100;

export const SUPABASE_URL = process.env.SUPABASE_URL ?? get('env', 'SUPABASE_URL');
export const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY ?? get('env', 'SUPABASE_API_KEY');

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? get('env', 'GITHUB_TOKEN');
