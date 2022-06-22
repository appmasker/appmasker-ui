<script lang="ts">
	import {
		Button,
		Checkbox,
		ComposedModal,
		DataTable,
		DataTableSkeleton,
		InlineLoading,
		Link,
		ModalBody,
		ModalFooter,
		ModalHeader,
		Toolbar,
		ToolbarBatchActions,
		ToolbarContent
	} from 'carbon-components-svelte';
	import Delete16 from 'carbon-icons-svelte/lib/Delete16';
	import Edit16 from 'carbon-icons-svelte/lib/Edit16';
	import { createDomain, createDomain$, deleteDomains, editDomains } from '../../store';
	import type {
		DomainConfig,
		DomainConfigInput,
		DomainRecordCheckResponse,
		Redirect
	} from '../../types';
	import { getDomainPresetFromUrl } from '../../utils/domain-presets';
	import ConfigDialog from '../dialogs/ConfigDialog.svelte';
	import DomainEditDialog from '../dialogs/DomainEditDialog.svelte';
	import DomainStatus from '../DomainStatus.svelte';

	export let rows: DomainConfig[] = [];
	export let dnsStatus: DomainRecordCheckResponse = {};
	export let isLoading = false;

	let selectedRowIds: string[] = [];
	let expandedRowIds: string[] = [];

	const headers: { key: string; value: number | string }[] = [
		{ key: 'name', value: 'Name' },
		{ key: 'ipAddresses', value: 'Addresses' },
		// { key: 'data', value: 'Custom Data' },
		{ key: 'redirects', value: 'Redirects' },
		{ key: 'dns', value: 'Status' }
	];

	let domainModalOpen = false;
	let domainModalIsEdit = false;
	let domainModalData: DomainConfig[];
	let confirmDeleteOpened = false;
	let confirmDeleteCheck = false;

	function toggleRow(id: string): void {
		if (expandedRowIds.includes(id)) {
			expandedRowIds = expandedRowIds.filter((rowId) => rowId !== id);
		} else {
			const list = [...expandedRowIds, id];
			expandedRowIds = Array.from(new Set(list));
		}
	}

	function openDomainEditForm(isEdit: boolean): void {
		const preset = getDomainPresetFromUrl();

		domainModalIsEdit = isEdit;
		domainModalData = isEdit
			? rows.filter((row) => selectedRowIds.includes(row.id))
			: preset
			? [preset.config as DomainConfig]
			: ([{}] as DomainConfig[]);
		domainModalOpen = true;
	}

	function formatRedirect(redir: Redirect): string {
		if (redir) {
			return `${redir.from} → ${redir.to}`;
		}
		return '';
	}

	function onDialogSubmit(event: { detail: { data: DomainConfigInput[] } }): void {
		if (domainModalIsEdit) {
			const submission = event.detail.data;
			editDomains.dispatch(submission);
		} else {
			const submission = event.detail.data[0];
			createDomain.dispatch(submission);
		}
	}

	function onDeleteSubmit() {
		confirmDeleteOpened = false;
		confirmDeleteCheck = false;
		deleteDomains.dispatch(selectedRowIds.map((id) => rows.find((r) => r.id === id).name));
		selectedRowIds = [];
	}
</script>

{#if !isLoading}
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
				<Button icon={Delete16} on:click={() => (confirmDeleteOpened = true)}>Delete</Button>
			</ToolbarBatchActions>
			<ToolbarContent>
				{#if !$createDomain$.isLoading}
					<Button on:click={() => openDomainEditForm(false)}>+ Create A Domain</Button>
				{:else}
					<div class="loading-row">
						<InlineLoading />
					</div>
				{/if}
			</ToolbarContent>
		</Toolbar>

		<div slot="expanded-row" let:row class="expanded-row">
			<h5>Redirects</h5>
			{#if row.redirects.length}
				{#each row.redirects as redir, i}
					{formatRedirect(redir)}
					{#if i !== row.redirects.length - 1}
						<br />
					{/if}
				{/each}
			{:else}
				None
			{/if}
		</div>

		<div slot="cell" let:row let:cell>
			<span>
				{#if cell.key === 'data'}
					{#if row.redirects.length}
						<ConfigDialog data={row} />
					{:else}
						None
					{/if}
				{:else if cell.key === 'redirects'}
					{#if row.redirects.length}
						<Link style="cursor: pointer">Expand</Link>
					{:else}
						None
					{/if}
				{:else if cell.key === 'dns'}
					<DomainStatus status={dnsStatus[row.name]} />
				{:else}
					{cell.value}
				{/if}
			</span>
		</div>
	</DataTable>
{:else}
	<DataTableSkeleton {headers} rows={5} />
{/if}

<DomainEditDialog
	isOpen={domainModalOpen}
	isEdit={domainModalIsEdit}
	data={domainModalData}
	on:submit={(data) => onDialogSubmit(data)}
	on:close={() => (domainModalOpen = false)}
/>

<ComposedModal
	open={confirmDeleteOpened}
	on:submit={onDeleteSubmit}
	on:close={() => (confirmDeleteOpened = false)}
>
	<ModalHeader title="Confirm Deletion" />
	<ModalBody hasForm>
		<p class="block">
			{#each selectedRowIds as id}
				{rows?.find((r) => r.id === id)?.name}
				<br />
			{/each}
		</p>
		<Checkbox labelText="I wish to delete the above domains" bind:checked={confirmDeleteCheck} />
	</ModalBody>
	<ModalFooter
		danger={true}
		primaryButtonText="Delete Domains"
		secondaryButtonText="Cancel"
		primaryButtonDisabled={!confirmDeleteCheck}
	/>
</ComposedModal>

<style>
	.expanded-row {
		padding-top: 0.5em;
		padding-bottom: 0.5em;
	}
</style>
