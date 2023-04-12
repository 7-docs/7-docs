import ora from 'ora';
import { Pinecone } from '../client/pinecone.js';

export const pineconeClearNamespace = async (namespace: string) => {
  const pinecone = new Pinecone();
  const spinner = ora(`Clear Pinecone namespace: ${namespace}`).start();
  try {
    const indexName = await pinecone.getIndexName();
    spinner.text = `Clear Pinecone namespace: ${namespace} (index: ${indexName})`;
    await pinecone.clearNamespace(namespace);
    spinner.succeed();
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    }
  }
};
