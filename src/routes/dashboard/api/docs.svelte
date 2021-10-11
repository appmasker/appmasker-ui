<script>
	import {
		Tabs,
		Tab,
		TabContent,
		Tile,
		Button,
		Link,
		CodeSnippet,
		DataTable
	} from 'carbon-components-svelte';
	import {
		createDomainDocConfig,
		deleteManyDomainsDocConfig,
		editManyDomainsDocConfig,
		getDomainDocConfig
	} from '../../../utils/docs';
	import DocSection from '../../../components/DocSection.svelte';

	const tableHeaders = [
		{ key: 'fieldName', value: 'Field Name' },
		{ key: 'type', value: 'Type' },
		{ key: 'values', value: 'Values' },
		{ key: 'required', value: 'Required' }
	];
</script>

<div class="api-docs-container">
	<div class="top-bar">
		<h1>API Documentation</h1>
		<Button href="/dashboard/api/api-keys">Generate API Key</Button>
	</div>

	<div class="block">
		<Tile>
			<h3>Introduction</h3>
			<p class="block">
				AppMasker uses a simple REST API for programatic configuration. API's are available at <CodeSnippet
					type="inline">https://app.appmasker.com</CodeSnippet
				>. For example, if you wanted to create a domain, the url would be a <code>POST</code> call
				to
				<CodeSnippet type="inline">https://app.appmasker.com/domain</CodeSnippet>.
			</p>
			<h4>Response Payloads</h4>
			<p>All response payloads are JSON objects with the following structure:</p>

			<CodeSnippet
				type="multi"
				light={false}
				code={JSON.stringify(
					{ data: 'Object | Array', message: 'string', errors: 'Array' },
					null,
					2
				)}
			/>

			<p>
				The type signature of the objects and arrays will depend on which endpoint you're calling.
			</p>
		</Tile>
	</div>

	<div class="block">
		<Tile>
			<h3>Authentication</h3>
			<p class="block">
				All endpoints require an API Key to authenticate. <a href="/dashboard/api/api-keys"
					>You can create one here</a
				>. Set the <CodeSnippet type="inline" code="x-api-key" /> HTTP header with your generated token.
			</p>

			<div class="block">
				<h4>API Key safety</h4>
				<p>
					Do not share the API Key or expose it in a web client. Keep it safe on your backend
					server. Have your client code request these endpoints through your server or add the
					aforementioned header through a proxy.
				</p>
			</div>
		</Tile>
	</div>

	<div class="block">
		<DocSection config={createDomainDocConfig} headers={tableHeaders} />
	</div>

	<div class="block">
		<DocSection config={getDomainDocConfig} headers={tableHeaders} />
	</div>

	<div class="block">
		<DocSection config={editManyDomainsDocConfig} headers={tableHeaders} />
	</div>

	<div class="block">
		<DocSection config={deleteManyDomainsDocConfig} headers={tableHeaders} />
	</div>
</div>

<style>
	.api-docs-container {
		max-width: 1200px;
	}
	.top-bar {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
	}
</style>
