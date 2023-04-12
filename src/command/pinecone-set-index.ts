import ora from 'ora';
import { Pinecone } from '../client/pinecone.js';

export const pineconeSetIndex = async (index: string) => {
  const pinecone = new Pinecone();
  const spinner = ora(`Set or create Pinecone index: ${index}`).start();
  try {
    const message = await pinecone.createOrSetIndex(index);
    spinner.succeed(message);
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    }
  }
};
