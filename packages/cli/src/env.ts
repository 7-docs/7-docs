import * as dotenv from 'dotenv';
import { get } from './util/storage.js';

dotenv.config();

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? get('env', 'OPENAI_API_KEY');

export const PINECONE_URL = process.env.PINECONE_URL ?? get('env', 'PINECONE_URL');
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? get('env', 'PINECONE_API_KEY');

export const SUPABASE_URL = process.env.SUPABASE_URL ?? get('env', 'SUPABASE_URL');
export const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY ?? get('env', 'SUPABASE_API_KEY');

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? get('env', 'GITHUB_TOKEN');

export const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID ?? get('env', 'ALGOLIA_APP_ID');
export const ALGOLIA_API_KEY = process.env.ALGOLIA_API_KEY ?? get('env', 'ALGOLIA_API_KEY');
export const ALGOLIA_INDEX_NAME = process.env.ALGOLIA_INDEX_NAME ?? get('env', 'ALGOLIA_INDEX_NAME');
