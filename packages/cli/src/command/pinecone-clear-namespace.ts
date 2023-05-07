import { Pinecone } from '../client/pinecone.js';
import ora from '../util/ora.js';

export const pineconeClearNamespace = async (namespace: string) => {
  const pinecone = new Pinecone();
  const spinner = ora(`Clearing Pinecone namespace: ${namespace}`).start();
  try {
    await pinecone.clearNamespace(namespace);
    spinner.succeed();
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    }
  }
};
