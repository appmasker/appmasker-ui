<script lang="ts">
	import { Modal } from 'carbon-components-svelte';
	import {
		displayFirstError,
		domainEditFormValidator,
		DomainFormValidation
	} from '../../utils/validators';
	import { createEventDispatcher } from 'svelte';
	import { DomainConfig, IDomainForm, toDomainConfigInput, toDomainForm } from '../../types';
	import DomainEditForm from '../forms/DomainEditForm.svelte';

	export let data = [{}] as DomainConfig[];
	export let isEdit = false;
	export let isOpen = false;

	let errors: Array<DomainFormValidation>;
	let showErrorModal = false;

	$: entries = data.map(toDomainForm);

	const dispatch = createEventDispatcher();

	function handleSubmit(event: Event): void {
		errors = entries.map(domainEditFormValidator);
		console.log('errors', errors);
		if (errors.some(Boolean)) {
			showErrorModal = true;
		} else {
			closeModal(entries, true);
		}
	}

	function closeModal(data: IDomainForm[], doSubmit: boolean): void {
		if (doSubmit) {
			const domainInput = data.map(toDomainConfigInput);
			dispatch('submit', {
				data: domainInput
			});
		}
		isOpen = false;
	}
</script>

<!-- Main Modal -->
<Modal
	bind:open={isOpen}
	modalHeading={isEdit ? 'Edit domains' : 'Create a domain'}
	primaryButtonText={isEdit ? 'Save Changes' : 'Create domain'}
	secondaryButtonText="Cancel"
	selectorPrimaryFocus={isEdit ? 'ipAddress' : 'domain-name'}
	on:click:button--secondary={() => closeModal(null, false)}
	on:open
	on:close
	on:submit={handleSubmit}
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

<!-- Error Modal -->
<Modal
	bind:open={showErrorModal}
	modalHeading="There are some errors"
	primaryButtonText="Okay"
	size="sm"
	on:click:button--primary={() => (showErrorModal = false)}
>
	{#each entries as entry, i}
		{#if errors?.[i]}
			<b>{entry.name}</b>
			<br />
			<p>{displayFirstError(errors[i]).join(': ')}</p>
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
