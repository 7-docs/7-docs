import { Octokit } from '@octokit/rest';
import micromatch from 'micromatch';
import { GITHUB_TOKEN } from '../env.js';
import type { FetchFiles } from '../types.js';
import type { RestEndpointMethodTypes } from '@octokit/rest';

type Tree = RestEndpointMethodTypes['git']['getTree']['response']['data']['tree'];

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

const getFileData = async (repoId: string, filePath: string) => {
  const [owner, repo] = repoId.split('/');
  const { data: fileContent } = await octokit.rest.repos.getContent({ owner, repo, path: filePath });

  if (Array.isArray(fileContent) || fileContent.type !== 'file') {
    console.warn(`Unexpected response from octokit.rest.repos.getContent for file ${filePath}`);
    return { filePath, url: '', content: Buffer.from('') };
  }

  const { content, html_url } = fileContent;
  return { filePath, url: html_url ?? '', content: Buffer.from(content, 'base64') };
};

const getTree = async (repoId: string, tree_sha = 'HEAD'): Promise<Tree> => {
  const [owner, repo] = repoId.split('/');
  const response = await octokit.rest.git.getTree({ owner, repo, tree_sha, recursive: 'true' });
  return response.data.tree;
};

export const fetchFiles: FetchFiles = async (patterns, { repo: repoId }) => {
  const tree = await getTree(repoId);
  const files = tree.filter(file => file.path && file.type === 'blob' && micromatch.isMatch(file.path, patterns));
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return Promise.all(files.map(file => getFileData(repoId, file.path!)));
};
