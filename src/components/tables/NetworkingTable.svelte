<script lang="ts">
	import { CodeSnippet, DataTable } from 'carbon-components-svelte';
	import type { Server } from '../../types';
	export let server: Server;
</script>

<DataTable
	headers={[
		{ key: 'ipAddress', value: 'Address' },
		{ key: 'type', value: 'Type' }
	]}
	rows={[
		{
			id: '1',
			ipAddress: server?.ipv6Address,
			type: 'IPv6'
		},
		{
			id: '2',
			ipAddress: server?.ipv4Address,
			type: 'IPv4 (shared)'
		},
    {
      id: '3',
      ipAddress: server?.appId + '.fly.dev',
      type: 'Hostname'
    }
	].filter((row) => row.ipAddress)}
>
	<div slot="cell" let:row let:cell>
		<span>
			{#if cell.key === 'ipAddress'}
				<CodeSnippet type="inline" code={cell.value} feedback="Copied to clipboard!" />
			{:else}
				{cell.value}
			{/if}
		</span>
	</div>
</DataTable>
