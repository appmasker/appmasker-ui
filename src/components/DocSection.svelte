<script lang="ts">
	import { CodeSnippet, DataTable, Tile } from 'carbon-components-svelte';
	import type { DocConfig } from '../types';

	export let config: DocConfig;
	export let headers = [];
	$: responseHeaders = headers.filter((h) => h.key !== 'required');
</script>

<Tile>
	<div class="tile-header">
		<h3>{config.title}</h3>
		<code>{config.method}: {config.path.join(' or ')}</code>
	</div>

	{#each config.notes as note}
		<p class="block">
			{note}
		</p>
	{/each}

	<div class="block">
		<h4>Request</h4>
		<div class="block">
			<h5>Type: {config.requestType}</h5>
			{#if config.requestType !== 'URL' && !config.hideTable}
				<DataTable {headers} rows={config.requestRows} />
			{/if}
		</div>
		<div class="block">
			<h5>Example Request</h5>
			{#if typeof config.exampleRequest === 'string'}
				<div class="block">
					<CodeSnippet type="inline" code={config.exampleRequest} />
				</div>
			{:else}
				<CodeSnippet type="multi" code={JSON.stringify(config.exampleRequest, null, 2)} />
			{/if}
		</div>

		<div class="block">
			{#if config.responseType !== 'None'}
				<h4>Response</h4>
				<div class="block">
					<h5>Data Type: {config.responseType}</h5>
					{#if !config.hideTable}
						<DataTable headers={responseHeaders} rows={config.responseRows} />
					{/if}
				</div>
				<div class="block">
					<h5>Example Response</h5>
					{#if typeof config.exampleResponse === 'string'}
						<div class="block">
							<CodeSnippet type="inline" code={config.exampleResponse} />
						</div>
					{:else}
						<CodeSnippet type="multi" code={JSON.stringify(config.exampleResponse, null, 2)} />
					{/if}
				</div>
			{/if}
		</div>
	</div></Tile
>

<style>
	.tile-header {
		display: flex;
		justify-content: space-between;
		flex-wrap: wrap;
	}
</style>
