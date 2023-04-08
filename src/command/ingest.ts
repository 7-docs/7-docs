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
import type { MetaData } from '../types';
import { getInitUsage, addTokens } from '../util/usage';

const pineconeIndex = pinecone.Index(PINECONE_INDEX);

const files = await fetchMarkdownFiles(GITHUB_REPO, GITHUB_FILES);

const CHUNK_DIVIDER = 0.1; // Keep under 0.9 as a safe guard. Lower means smaller embeddings/more fine-grained results.
const CHUNK_SIZE = (OPENAI_MAX_INPUT_TOKENS / TOKENS_PER_WORD) * CHUNK_DIVIDER;

if (files.length > 0) {
  console.log(`Connecting to OpenAI and Pinecone (index: ${PINECONE_INDEX}, namespace: ${PINECONE_NAMESPACE})`);

  const counters = {
    files: files.length,
    vectors: 0,
    usage: getInitUsage()
  };

  for (const file of files) {
    const { content, url, filePath } = file;

    const text = await stripMarkdown(content);
    const title = getTitle(content) ?? filePath;
    const chunks = chunkSentences(text, CHUNK_SIZE);

    const requests = chunks.map(input => createEmbedding({ input, model: OPENAI_EMBEDDING_MODEL }));
    const responses = await Promise.all(requests);
    const embeddings = responses.flatMap(response => response.embeddings);

    const vectors = embeddings.map((values, index) => {
      const text = chunks[index];
      const id = generateId(filePath + '\n' + text.trim());
      const metadata: MetaData = { title, url, filePath, text };
      return { id, values, metadata };
    });

    counters.vectors += vectors.length;

    processArrayInChunks(vectors, PINECONE_UPSERT_VECTOR_LIMIT, async vectors => {
      console.log(`Upserting ${vectors.length} vectors for ${filePath}`);
      const upsertRequest = { vectors, namespace: PINECONE_NAMESPACE };
      const response = await pineconeIndex.upsert({ upsertRequest });
      if (response.upsertedCount !== vectors.length) console.warn('Pinecone response did not match:', response);
    });

    const usages = responses.map(response => response.usage);
    counters.usage = addTokens(counters.usage, usages);
  }

  console.log(`Files fetched: ${counters.files}`);
  console.log(`OpenAI tokens used: ${counters.usage.total_tokens}`);
  console.log(`Vectors upserted: ${counters.vectors}`);
}
