import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.OPENAI_API_KEY) throw new Error('Missing OPENAI_API_KEY environment variable');
if (!process.env.PINECONE_API_KEY) throw new Error('Missing PINECONE_API_KEY environment variable');
if (!process.env.PINECONE_INDEX) throw new Error('Missing PINECONE_INDEX environment variable');
if (!process.env.PINECONE_ENVIRONMENT) throw new Error('Missing PINECONE_ENVIRONMENT environment variable');
if (!process.env.GITHUB_REPO) throw new Error('Missing GITHUB_REPO environment variable');

export const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION; // Not required
export const OPENAI_EMBEDDING_MODEL = 'text-embedding-ada-002';
export const OPENAI_COMPLETION_MODEL = 'gpt-3.5-turbo'; // text-davinci-003, gpt-4
export const OPENAI_MAX_INPUT_TOKENS = 8191;
export const OPENAI_MAX_COMPLETION_TOKENS = 4096;
export const OPENAI_TOKENS_FOR_COMPLETION = 1024; // Tokens reserved for the answer
export const TOKENS_PER_WORD = 4 / 3;

export const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT;
export const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
export const PINECONE_NAMESPACE = process.env.PINECONE_NAMESPACE;
export const PINECONE_INDEX = process.env.PINECONE_INDEX;
export const PINECONE_UPSERT_VECTOR_LIMIT = 100;

export const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
export const GITHUB_REPO = process.env.GITHUB_REPO;
export const GITHUB_FILES = ['*.md', 'docs/*.md'];
