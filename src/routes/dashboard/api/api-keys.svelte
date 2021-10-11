<script lang="ts">
	import {
		Button,
		CodeSnippet,
		Form,
		InlineNotification,
		TextInput,
		Tile,
		Breadcrumb,
		BreadcrumbItem
	} from 'carbon-components-svelte';
	import { generateApiKey, generateApiKey$ } from '../../../store';

	let name: string;

	function createApiKey() {
		generateApiKey.dispatch({ name });
		name = '';
	}
</script>

<div class="block">
	<Breadcrumb noTrailingSlash>
		<BreadcrumbItem href="/dashboard/api">API Docs</BreadcrumbItem>
		<BreadcrumbItem href="/dashboard/api-keys" isCurrentPage>API Keys</BreadcrumbItem>
	</Breadcrumb>
</div>

<h1>API Keys</h1>

<div class="max-width">
	<div class="block">
		<Tile>
			<h3>Generate an API Key</h3>
			<div class="block">
				<Form on:submit={createApiKey}>
					<TextInput
						bind:value={name}
						required
						autofocus
						labelText="Name"
						placeholder="My API Key"
					/>
					<br />
					<div class="actions-row">
						<Button disabled={$generateApiKey$.isLoading || !name} type="submit"
							>Generate API Key</Button
						>
					</div>
				</Form>
			</div>
		</Tile>
	</div>

	{#if $generateApiKey$.data}
		<div class="block">
			<Tile>
				<InlineNotification
					hideCloseButton
					kind="warning"
					title="Notice:"
					subtitle="This key is only shown once. Keep it secret, keep it safe!"
				/>
				<br />
				<b>{$generateApiKey$.data.name}</b> <br />
				<CodeSnippet skeleton={$generateApiKey$.isLoading} code={$generateApiKey$.data.apiKey} />
			</Tile>
		</div>
	{/if}
</div>

<style>
	.max-width {
		max-width: 600px;
	}
</style>
