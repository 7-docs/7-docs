import ora from '../util/ora.js';
import { Pinecone } from '../client/pinecone.js';

export const pineconeClearNamespace = async (namespace: string) => {
  const pinecone = new Pinecone();
  const spinner = ora(`Clear Pinecone namespace: ${namespace}`).start();
  try {
    await pinecone.clearNamespace(namespace);
    spinner.succeed();
  } catch (error) {
    if (error instanceof Error) {
      spinner.fail(error.message);
    }
  }
};
