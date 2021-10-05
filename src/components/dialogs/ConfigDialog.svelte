<script lang="ts">
	import { Link, Modal, TextArea } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';
	import { DomainConfig, toDomainForm } from '../../types';

	const dispatch = createEventDispatcher();

	export let data: DomainConfig;

	let modalIsOpen = false;
	let selectedDomainConfig: string = '';

	function openModal() {
		selectedDomainConfig = toDomainForm(data).data;
		modalIsOpen = true;
	}
	function closeModal(data, doSubmit) {
		modalIsOpen = false;
		if (doSubmit) {
			console.log(data);
			dispatch('submit', {
				config: JSON.parse(data)
			});
		}
	}
</script>

<Link style="cursor:pointer" on:click={() => openModal()}>View</Link>

<Modal
	bind:open={modalIsOpen}
	modalHeading="Config for {data.name}"
	passiveModal
	on:click:button--secondary={() => closeModal(null, false)}
	on:open
	on:close
	on:submit={() => closeModal(selectedDomainConfig, true)}
>
	<TextArea
		labelText="Data that relates to your tenant that owns this domain. Edit this by selecting the row from the table and clicking 'Edit'."
		placeholder="Valid JSON only!"
		readonly
		rows={15}
		bind:value={selectedDomainConfig}
	/>
</Modal>
