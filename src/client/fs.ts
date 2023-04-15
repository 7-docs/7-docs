import fs from 'node:fs/promises';
import fg from 'fast-glob';
import type { FetchFiles } from '../types.js';

const getFileData = async (filePath: string) => {
  return { filePath, url: '', content: await fs.readFile(filePath) };
};

export const fetchFiles: FetchFiles = async patterns => {
  const files = await fg(patterns);
  return Promise.all(files.map(getFileData));
};
