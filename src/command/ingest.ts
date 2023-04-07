import { pinecone } from '../client/pinecone';
import { createEmbedding } from '../client/openai';
import { stripMarkdown, chunkSentences, getTitle } from '../util/text';
import { processArrayInChunks, generateId } from '../util/array';
import { fetchMarkdownFiles } from '../client/github';
import {
  OPENAI_MAX_INPUT_TOKENS,
  PINECONE_INDEX,
  GITHUB_REPO,
  GITHUB_FILES,
  OPENAI_EMBEDDING_MODEL,
  PINECONE_UPSERT_VECTOR_LIMIT,
  PINECONE_NAMESPACE,
  TOKENS_PER_WORD
} from '../env';
import { Vector } from '@pinecone-database/pinecone';
import { MetaData } from '../types';

let estTotalTokens = 0;
const CHUNK_DIVIDER = 0.1; // Keep under 0.9 as a safe guard. Lower means smaller embeddings/more fine-grained results.
const CHUNK_SIZE = (OPENAI_MAX_INPUT_TOKENS / TOKENS_PER_WORD) * CHUNK_DIVIDER;
const pineconeIndex = pinecone.Index(PINECONE_INDEX);
const fileDataList = await fetchMarkdownFiles(GITHUB_REPO, GITHUB_FILES);

for (const file of fileDataList) {
  const { content, url, filePath } = file;

  const text = await stripMarkdown(content);
  const title = getTitle(content) ?? filePath;
  const chunks = chunkSentences(text, CHUNK_SIZE);

  const batchPromises = chunks.map((input, index) => {
    const words = input.split(' ').length;
    const tokens = Math.ceil(words * TOKENS_PER_WORD);
    console.log(`Create embeddings for ${filePath} (est. tokens: ${tokens})`);
    estTotalTokens += tokens;
    return createEmbedding({ input, model: OPENAI_EMBEDDING_MODEL });
  });

  const embeddings = await Promise.all(batchPromises);

  const vectors: Vector[] = embeddings.flat().map((values, index) => {
    const text = chunks[index];
    const id = generateId(filePath + '\n' + text.trim());
    const metadata: MetaData = { title, url, filePath, text };
    return { id, values, metadata };
  });

  processArrayInChunks(vectors, PINECONE_UPSERT_VECTOR_LIMIT, async vectors => {
    console.log(`Upserting vectors of ${filePath} to ${PINECONE_NAMESPACE} (${vectors.length} vectors)`);
    const upsertRequest = { vectors, namespace: PINECONE_NAMESPACE };
    const upsertResponse = await pineconeIndex.upsert({ upsertRequest });
    console.log('Pinecone response:', upsertResponse);
  });
}

console.log(`Est. total tokens used: ${estTotalTokens}`);
