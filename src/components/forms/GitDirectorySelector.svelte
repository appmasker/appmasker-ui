<script lang="ts">
	import {
		Button,
		Form,
		Search,
		SelectableTile,
		SkeletonText
	} from 'carbon-components-svelte';
	import { githubService } from '../../services/github-service';
	import type { GitRepo } from '../../types';
  import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled16';

	let searchQuery = '';
	export let selection: GitRepo = {
		provider: '', // github, gitlab, bitbucket
		repo: '',
		owner: '',
		branch: '',
		path: '',
		url: ''
	};
	let repos = [];
	let showSearchResults = false;
	let isLoading = false;

  const clearSelection = () => {
    selection = {
      provider: 'github',
      repo: '',
      owner: '',
      branch: '',
      path: '',
      url: ''
    };
  }
</script>

<div class="form-control-lg">
	{#if selection?.url}
		<div class="selection-success">
      <p style="display: flex; align-items:center">
        <CheckmarkFilled />
        &nbsp;
        <b>Selected repo: <span>{selection.url}</span></b>
      </p>
      <p style="padding-left: 19px">
        <b>Selected branch: {selection.branch}</b>
      </p>
		</div>
	{/if}

	<Form
		on:submit={() => {
			isLoading = true;
			showSearchResults = true;
			githubService
				.searchRepositories(searchQuery)
				.then((res) => {
					repos = res?.slice(0, Math.min(res.length, 10));
				})
				.finally(() => {
					isLoading = false;
				});
		}}
	>
		<div style="display: flex">
			<Search
				size="sm"
				placeholder="Search repositories..."
				on:focus={() => {
					showSearchResults = true;
				}}
				on:clear={() => {
					showSearchResults = false;
          clearSelection();
				}}
				bind:value={searchQuery}
			/>
			<Button kind="secondary" size="small" label="Search" type="submit">Search</Button>
		</div>

		<div role="group" aria-label="selectable tiles">
			{#if showSearchResults && !isLoading}
				{#each repos as repo}
					<SelectableTile
            class="result-tile"
						on:click={() => {
              selection = {
                ...selection,
                provider: 'github',
                repo: repo.name,
                owner: repo.owner.login,
                url: repo.html_url,
                branch: repo.default_branch,
              }
							showSearchResults = false;
						}}
						selected={selection?.repo === repo.name && selection?.owner === repo.owner.login}
					>
						<span>{repo.html_url}</span>
					</SelectableTile>
				{/each}
			{/if}

			{#if isLoading}
				<SkeletonText paragraph lines={10} />
			{/if}
		</div></Form
	>

</div>

<style>
	.selection-success {
    margin-bottom: 10px;
  }
  .result-tile {
    display: flex;
    align-items: center;
    height: 50px;
  }
</style>
