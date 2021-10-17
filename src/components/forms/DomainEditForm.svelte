<script lang="ts">
	import { Button, Form, TextArea, TextInput } from 'carbon-components-svelte';
	import ArrowRight16 from 'carbon-icons-svelte/lib/ArrowRight16';
	import TrashCan16 from 'carbon-icons-svelte/lib/TrashCan16';
	import { createEventDispatcher } from 'svelte';
	import { IDomainForm, Redirect } from '../../types';
	import { jsonPlaceholder } from '../../utils/consts';
	import BackendAddressInput from './BackendAddressInput.svelte';

	export let data = {} as IDomainForm;
	export let isEdit = false;
	const dispatch = createEventDispatcher();

	function onSubmit(): void {
		dispatch('submit', data);
	}

	function addAddress(): void {
		data.ipAddresses = [...data.ipAddresses, ''];
		console.log(data.ipAddresses);
	}

	function removeAddress(index: number): void {
		data.ipAddresses = data.ipAddresses.filter((value, i) => i !== index);
	}

	function addRedirect(): void {
		data.redirects = [...data.redirects, new Redirect()];
	}

	function removeRedir(index: number): void {
		data.redirects = data.redirects.filter((value, i) => i !== index);
	}
</script>

<Form on:submit={onSubmit}>
	<div class="block">
		<TextInput
			bind:value={data.name}
			disabled={isEdit}
			labelText="Domain name"
			placeholder="example.com or tenant.yoursite.com"
			helperText="Enter a root domain or subdomain that your tenant will use to access your service"
		/>
	</div>
	<div class="block">
		<div class="block">
			<h5>Your Service Addresses</h5>
			<p>
				Enter your service's IP Address or a domain name with the port number (probably :443). More
				than 1 address enables loadbalancing.
			</p>
		</div>
		{#each data.ipAddresses as addr, index}
			<div class="block redirect-form-row">
				<BackendAddressInput bind:value={addr} />

				<div class="row-inline-container">
					<Button
						kind="danger-tertiary"
						size="field"
						iconDescription="Delete"
						icon={TrashCan16}
						on:click={() => removeAddress(index)}
					/>
				</div>
			</div>
		{/each}
		<Button kind="tertiary" size="field" on:click={addAddress}>+ Add Address</Button>
	</div>
	<div class="block redirect-form-row">
		<TextArea
			bind:value={data.data}
			rows={10}
			labelText="Tenant Data"
			placeholder={jsonPlaceholder}
			helperText="Generally the structure of this object will be consistent with all your tenants but the values should vary."
		/>
	</div>
	<div class="block">
		<div class="block">
			<h5>Redirects</h5>
			<p>
				Redirect from a path on the tenant's domain to some url that returns the relevant content
				for the tenant.
			</p>
		</div>
		{#each data.redirects as redir, index}
			<div class="block redirect-form-row">
				<div class="redirect-from">
					<TextInput bind:value={redir.from} labelText="From" placeholder="/logo" />
				</div>
				<div>
					<ArrowRight16 style="position:relative; top:2.5em" />
				</div>
				<div class="redirect-to">
					<TextInput
						bind:value={redir.to}
						labelText="To"
						placeholder="https://s3.aws.com/example-customer-logo.png"
					/>
				</div>
				<div class="row-inline-container">
					<Button
						kind="danger-tertiary"
						size="field"
						iconDescription="Delete"
						icon={TrashCan16}
						on:click={() => removeRedir(index)}
					/>
				</div>
			</div>
		{/each}
		<Button kind="tertiary" size="field" on:click={addRedirect}>+ Add A Redirect</Button>
	</div>
</Form>

<style>
	.redirect-form-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1em;
	}

	.row-inline-container {
		height: 64px;
		display: flex;
		align-items: flex-end;
	}

	.redirect-from {
		flex: 1;
	}
	.redirect-to {
		flex: 2;
	}
</style>
