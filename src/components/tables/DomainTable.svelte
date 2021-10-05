<script lang="ts">
	import {
		Button,
		DataTable,
		Link,
		Toolbar,
		ToolbarBatchActions,
		ToolbarContent
	} from 'carbon-components-svelte';
	import Delete16 from 'carbon-icons-svelte/lib/Delete16';
	import Edit16 from 'carbon-icons-svelte/lib/Edit16';
	import type { DomainConfig, Redirect } from '../../types';
	import ConfigDialog from '../dialogs/ConfigDialog.svelte';
	import DomainEditDialog from '../dialogs/DomainEditDialog.svelte';

	export let rows: DomainConfig[] = [];

	let selectedRowIds: string[] = [];
	let expandedRowIds: string[] = [];

	const headers: { key: keyof DomainConfig; value: number | string }[] = [
		{ key: 'name', value: 'Name' },
		{ key: 'ipAddresses', value: 'IP Addresses' },
		{ key: 'data', value: 'Custom Data' },
		{ key: 'redirects', value: 'Redirects' }
	];

	let domainModalOpen = false;
	let domainModalIsEdit = false;
	let domainModalData: DomainConfig[];

	function submitConfigChange(data) {
		console.log('final submit now', data);
	}

	function toggleRow(id: string): void {
		if (expandedRowIds.includes(id)) {
			expandedRowIds = expandedRowIds.filter((rowId) => rowId !== id);
		} else {
			const list = [...expandedRowIds, id];
			expandedRowIds = Array.from(new Set(list));
		}
	}

	function openDomainEditForm(isEdit: boolean): void {
		domainModalIsEdit = isEdit;
		domainModalData = isEdit
			? rows.filter((row) => selectedRowIds.includes(row.id))
			: ([{}] as DomainConfig[]);
		domainModalOpen = true;

		console.log(domainModalIsEdit, domainModalData, domainModalOpen);
	}

	function formatRedirect(redir: Redirect): string {
		if (redir) {
			return `${redir.from} → ${redir.to}`;
		}
		return '';
	}
</script>

<DataTable
	zebra
	expandable
	batchSelection
	{expandedRowIds}
	bind:selectedRowIds
	{headers}
	{rows}
	on:click:row={(e) => toggleRow(e.detail.id)}
>
	<Toolbar>
		<ToolbarBatchActions>
			<Button icon={Edit16} on:click={() => openDomainEditForm(true)}>Edit</Button>
			<Button icon={Delete16}>Delete</Button>
		</ToolbarBatchActions>
		<ToolbarContent>
			<Button on:click={() => openDomainEditForm(false)}>+ Create A Domain</Button>
		</ToolbarContent>
	</Toolbar>

	<div slot="expanded-row" let:row class="expanded-row">
		<h5>Redirects</h5>
		{#each row.redirects as redir, i}
			{formatRedirect(redir)}
			{#if i !== row.redirects.length - 1}
				<br />
			{/if}
		{/each}
	</div>

	<div slot="cell" let:row let:cell>
		<span>
			{#if cell.key === 'data'}
				<ConfigDialog data={row} on:submit={submitConfigChange} />
			{:else if cell.key === 'redirects'}
				<Link style="cursor: pointer">Expand</Link>
			{:else}
				{cell.value}
			{/if}
		</span>
	</div>
</DataTable>

<DomainEditDialog
	isOpen={domainModalOpen}
	isEdit={domainModalIsEdit}
	data={domainModalData}
	on:close={() => (domainModalOpen = false)}
/>

<style>
	.expanded-row {
		padding-top: 0.5em;
		padding-bottom: 0.5em;
	}
</style>
