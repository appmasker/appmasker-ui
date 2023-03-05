<script lang="ts">
	import { Modal } from 'carbon-components-svelte';
	import { createEventDispatcher } from 'svelte';
	import StripeElement from '../StripeElement.svelte';

	const dispatch = createEventDispatcher();

	export let modalIsOpen = false;
	export let price: number;

	let selectedDomainConfig: string = '';

	function closeModal(data, doSubmit) {
		modalIsOpen = false;
		if (doSubmit) {
			dispatch('submit', {
				config: JSON.parse(data)
			});
		}
		dispatch('close');
	}
</script>

<Modal
	bind:open={modalIsOpen}
	modalHeading="Add Billing Info"
	passiveModal
	on:click:button--secondary={() => closeModal(null, false)}
	on:open
	on:close
	on:submit={() => closeModal(selectedDomainConfig, true)}
>
	<p class="block"><strong>Subtotal:</strong>&nbsp; ${price} per month</p>

	<p class="block">
		You'll be charged based on hourly usage at the conclusion of each billing month.
	</p>

	<div class="block">
		<StripeElement />
	</div>
</Modal>
