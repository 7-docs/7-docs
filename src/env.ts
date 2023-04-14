import * as dotenv from 'dotenv';
import { get } from './util/storage.js';

dotenv.config();

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? get('env', 'OPENAI_API_KEY');
export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION; // Not required

export const PINECONE_URL = process.env.PINECONE_URL;
export const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY ?? get('env', 'PINECONE_API_KEY');

export const SUPABASE_URL = process.env.SUPABASE_URL ?? get('env', 'SUPABASE_URL');
export const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY ?? get('env', 'SUPABASE_API_KEY');

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN ?? get('env', 'GITHUB_TOKEN');
