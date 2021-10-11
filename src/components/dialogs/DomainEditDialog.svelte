<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button, Modal, Form, TextArea, TextInput } from 'carbon-components-svelte';
	import { DomainConfig, IDomainForm, toDomainConfigInput, toDomainForm } from '../../types';
	import DomainEditForm from '../forms/DomainEditForm.svelte';

	export let data = [{}] as DomainConfig[];
	export let isEdit = false;
	export let isOpen = false;

	$: entries = data.map(toDomainForm);

	const dispatch = createEventDispatcher();

	function closeModal(data: IDomainForm[], doSumbit: boolean): void {
		if (doSumbit) {
			const domainInput = data.map(toDomainConfigInput);
			dispatch('submit', {
				data: domainInput
			});
		}
		isOpen = false;
	}
</script>

<Modal
	bind:open={isOpen}
	modalHeading={isEdit ? 'Edit domains' : 'Create a domain'}
	primaryButtonText={isEdit ? 'Save Changes' : 'Create domain'}
	secondaryButtonText="Cancel"
	on:click:button--secondary={() => closeModal(null, false)}
	on:open
	on:close
	on:submit={() => closeModal(entries, true)}
>
	{#each entries as dataInput}
		{#if isEdit}
			<h4 class="block data-header">{dataInput.name}</h4>
		{/if}
		{#if isOpen}
			<DomainEditForm {isEdit} data={dataInput} />
		{/if}
	{/each}
</Modal>

<style>
	.data-header {
		background-color: #0f62fe;
		color: white;
		padding: 0.7rem 1rem;
	}
</style>
