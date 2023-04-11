import { listModels } from '../client/openai.js';

export const models = async () => {
  const models = await listModels();
  const names = models.map(model => model.id);
  console.log(names.sort().join('\n'));
};
