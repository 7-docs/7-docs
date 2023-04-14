import ora from 'ora';
import { Pinecone } from '../client/pinecone.js';

export const pineconeCreateIndex = async (index?: string) => {
  const pinecone = new Pinecone();
  const spinner = ora(`Set or create Pinecone index: ${index}`).start();
  try {
    const message = await pinecone.createIndex(index);
    spinner.succeed(message);
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    }
  }
};
