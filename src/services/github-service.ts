import { backendCall } from '../api';

class GithubService {
	async searchRepositories(query: string): Promise<any[]> {
		const response = await backendCall<any[], { query: string }>(
			'/git-repo/github/search-repos',
			'POST',
			{ query }
		);
		return response.data;
	}

	async getRepositoryBranches(repo: string, owner: string): Promise<any[]> {
		const response = await backendCall<any[], { repo: string; owner: string }>(
			'/git-repo/github/get-branches',
			'POST',
			{ repo, owner }
		);
		return response.data;
	}
}

export const githubService = new GithubService();
