<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Button,
		CodeSnippet,
		DataTable,
		DataTableSkeleton,
		InlineLoading,
		Toolbar,
		ToolbarContent
	} from 'carbon-components-svelte';
	import Edit from 'carbon-icons-svelte/lib/Edit16';
	import Renew from 'carbon-icons-svelte/lib/Renew16';
	import { formatRelative } from 'date-fns';
	import { onMount } from 'svelte';
	import CaddyServerHelp from '../../../components/dialogs/CaddyServerHelp.svelte';
	import ServerStatus from '../../../components/indicators/ServerStatus.svelte';
	import { accountServers$, getServers } from '../../../store';
	import { flyRegionsIndex } from '../../../utils/consts';

	onMount(() => {
		loadServers();
	});

	const headers: { key: string; value: string | number }[] = [
		{ key: 'status', value: 'Status' },
		{ key: 'name', value: 'Name' },
		{ key: 'ipAddress', value: 'Public Networking' },
		{ key: 'regions', value: 'Regions' },
		{ key: 'createdDate', value: 'Created' },
		{ key: 'actions', value: '' }
	];

	function selectRow(id: string) {
		goto(`/dashboard/servers/${id}`);
	}

	function loadServers() {
		getServers.dispatch();
	}
</script>

<h1>Caddy Servers</h1>

<section>
	<p>
		<CaddyServerHelp />
	</p>
</section>

<section class="servers-container block">
	{#if !$accountServers$.isLoading}
		<DataTable class="server-table" size="tall" {headers} rows={$accountServers$.data}>
			<Toolbar>
				<ToolbarContent>
					<Button
						iconDescription="Reload Server Data"
						on:click={loadServers}
						kind="ghost"
						icon={Renew}
					/>
					{#if !$accountServers$.isLoading}
						<Button href="servers/create">+ Create a Server</Button>
					{:else}
						<div class="loading-row">
							<InlineLoading />
						</div>
					{/if}
				</ToolbarContent>
			</Toolbar>
			<div slot="cell" let:row let:cell>
				<span>
					{#if cell.key === 'ipAddress'}
						<div
							style="display: flex; flex-direction: column; justify-content: flex-start; align-items: flex-start"
						>
							<CodeSnippet type="inline" code={row.appHostname} feedback="Copied to clipboard!" />
							{#if row.ipv4Address}
								<div class="ipv4">
									<CodeSnippet type="inline" code={row.ipv4Address} feedback="Copied to clipboard!" />
									<div>(shared)</div>
								</div>
							{/if}
							{#if row.ipv6Address}
								<CodeSnippet type="inline" code={row.ipv6Address} feedback="Copied to clipboard!" />
							{/if}
						</div>
					{:else if cell.key === 'status'}
						<ServerStatus server={row} />
					{:else if cell.key === 'regions'}
						{@html cell.value.map(region => flyRegionsIndex[region]).join('<br>')}
					{:else if cell.key === 'createdDate'}
						{formatRelative(new Date(cell.value), new Date())}
					{:else if cell.key === 'actions'}
						<div class="actions-col">
							<Button
								tooltipPosition="left"
								tooltipAlignment="end"
								iconDescription={`Modify ${row.name}`}
								icon={Edit}
								kind="ghost"
								style="padding-top: 0"
								on:click={() => selectRow(row?.id)}
							/>
						</div>
					{:else}
						{cell.value}
					{/if}
				</span>
			</div>
		</DataTable>
	{:else}
		<DataTableSkeleton {headers} rows={3} />
	{/if}
</section>

<style>
	.actions-col {
		min-width: 50px;
	}
	.ipv4 {
		display: flex;
		align-items: center;
	}
</style>
