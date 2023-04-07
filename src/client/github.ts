import { Octokit } from '@octokit/rest';
import minimatch from 'minimatch';
import { GITHUB_TOKEN } from '../env';

const octokit = new Octokit({
  auth: GITHUB_TOKEN
});

const getFileData = async (repoId: string, filePath: string) => {
  const [owner, repo] = repoId.split('/');
  const response = await octokit.rest.repos.getContent({ owner, repo, path: filePath });
  // @ts-ignore
  const { content, html_url: url } = response.data;
  return { filePath, url, content: Buffer.from(content, 'base64').toString() };
};

const getTree = async (repoId: string, sha: string = 'HEAD'): Promise<Array<any>> => {
  const [owner, repo] = repoId.split('/');
  const response = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: sha,
    recursive: 'true'
  });
  return response.data.tree;
};

export const fetchMarkdownFiles = async (repoId: string, globPattern: string | string[]) => {
  const tree = await getTree(repoId);
  const files = tree.filter(file => file.type === 'blob' && [globPattern].flat().some(p => minimatch(file.path, p)));
  const fileDataPromises = files.map(file => getFileData(repoId, file.path));
  return Promise.all(fileDataPromises);
};
