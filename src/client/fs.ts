import fs from 'node:fs/promises';
import fg from 'fast-glob';
import { FetchFiles } from '../types';

const getFileData = async (filePath: string) => {
  return { filePath, url: '', content: String(await fs.readFile(filePath)) };
};

export const fetchFiles: FetchFiles = async (patterns: string | string[]) => {
  const files = await fg(patterns);
  return Promise.all(files.map(getFileData));
};
