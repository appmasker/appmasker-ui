<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		Dropdown,
		Form,
		InlineNotification,
		ListItem,
		SelectableTile,
		TextArea,
		TextInput,
		UnorderedList
	} from 'carbon-components-svelte';
	import CloudUpload32 from 'carbon-icons-svelte/lib/CloudUpload32';
	import { products } from '../../utils/billing';
	import { createEventDispatcher } from 'svelte';
	import {
		caddyFilePlaceholder,
		caddyJSONConfigPlaceholder,
		regionDictToList,
		serverToForm,
		validateForm
	} from '../../routes/dashboard/servers/_utils';
	import { launchServer$, showNotification$, updateServer$ } from '../../store';
	import { Server, ServerConfigType, ServerInput, ServerTier } from '../../types';
	import { flyRegions } from '../../utils/consts';
	import AsyncButton from '../AsyncButton.svelte';
	import CaddyServerHelp from '../dialogs/CaddyServerHelp.svelte';
	import InlineMessage from '../indicators/InlineMessage.svelte';
	import billingService from '../../services/billing-service';
	import { accountServers$ } from '../../store';
	import Tooltip from '../Tooltip.svelte';

	export let server: Server = null;
	export let isEdit = false;
	export let tier: ServerTier = ServerTier.BASIC;

	const dispatch = createEventDispatcher();

	let data = isEdit
		? serverToForm(server)
		: JSON.parse(localStorage.getItem('caddy-form')) || serverToForm(server);

	let selectedConfigTypeIndex = 0;
	$: data.configType =
		selectedConfigTypeIndex === 0 ? ServerConfigType.CADDYFILE : ServerConfigType.JSON;

	function onSubmit() {
		const validation = validateForm(data);
		const invalidText = Object.values(validation).find(Boolean);
		if (invalidText) {
			showNotification$.set({
				message: invalidText,
				title: 'Form Validation Error',
				kind: 'error'
			});
		} else {
			localStorage.setItem('caddy-form', JSON.stringify(data));
			dispatch('submit', {
				name: data.name,
				regions: regionDictToList(data.regions),
				uriEncodedCaddyfile:
					data.configType === ServerConfigType.CADDYFILE ? data.caddyFileConfig : undefined,
				caddyJSONConfig:
					data.configType === ServerConfigType.JSON ? JSON.parse(data.caddyJSONConfig) : undefined
			} as ServerInput);
		}
	}
</script>

<section class="block">
	<Accordion align="start" size="xl">
		<AccordionItem title="">
			<svelte:fragment slot="title">
				<h5>Limitations to our managed Caddy instances</h5>
			</svelte:fragment>
			<p style="margin-left: 20px">
				<UnorderedList>
					<ListItem>No custom modules yet</ListItem>

					<ListItem>
						You can't configure <a href="https://caddyserver.com/docs/json/admin" target="_blank"
							>admin</a
						>
						or <a href="https://caddyserver.com/docs/json/storage" target="_blank">storage</a>
					</ListItem>
					<ListItem>Configurable port range is 1-65535</ListItem>
					<ListItem
						>We <strong>highly</strong> recommend listening on at least port 80 and 443</ListItem
					>
					<ListItem>Environment variables are not yet supported</ListItem>
					<ListItem
						>API access to managed Caddy deployments is undocumented. Let us know if you want API
						access!</ListItem
					>
				</UnorderedList>
			</p>
			<p class="block">
				If you'd like to request a Caddy module to be supported or an advanced use case, email us at
				<a
					target="_blank"
					href="mailto:support@appmasker.com?subject=Help%20with%20Caddy%20configuration&body=Hi!%20I%20need%20help%20writing%20a%20Caddy%20config%20file.%20Here%20is%20my%20use-case%3A"
				>
					support@appmasker.com</a
				>.
			</p>
		</AccordionItem>
	</Accordion>
</section>

<section class="block">
	<Form on:submit={onSubmit}>
		<div class="block bottom-margin">
			<div class="block form-medium">
				<h4>Name</h4>
				<TextInput
					bind:value={data.name}
					hideLabel={true}
					placeholder="My main server"
					helperText="Give this server a name"
					required
				/>
			</div>

			<div class="block">
				<div class="region-title-container">
					<h4>Regions</h4>
					<Tooltip>
						<p>Regions are redundant instances of Caddy, each with the same config.</p>
						<p>🔒 They share their TLS certificate storage backend for efficiency.</p>
						<p>
							🌎 Anycast DNS will automatically choose the closest instance when a user makes a
							request.
						</p>
						<p>🚀 Chose regions close to your customers for optimal performance!</p>
					</Tooltip>
				</div>
				<p>
					Choose which regions to deploy your server (${products[tier].monthlyPrice}/region/month).
				</p>
				<div class="region-tile-grid" role="group" aria-label="selectable tiles">
					{#each flyRegions as region}
						<SelectableTile bind:selected={data.regions[region.id]} value={region.id}
							>{region.label}</SelectableTile
						>
					{/each}
				</div>
				{#if isEdit && server?.regions.length !== Object.values(data?.regions).filter(Boolean).length}
					<InlineNotification
						lowContrast
						hideCloseButton={true}
						kind="info"
						title="Your new price:"
						subtitle={`$${billingService.computeMonthlySubtotal(
							tier,
							$accountServers$.data,
							Object.values(data.regions).filter(Boolean).length,
							server.id
						)}.00 USD per
			month`}
					/>
				{:else if !isEdit}
					<InlineNotification
						lowContrast
						hideCloseButton={true}
						kind="info"
						title="Subtotal:"
						subtitle={`$${billingService.computeMonthlySubtotal(
							tier,
							$accountServers$.data,
							Object.values(data.regions).filter(Boolean).length
						)}.00 USD per
					month (your first server & 1 region are on us 😊)`}
					/>
				{/if}
			</div>

			<div class="block">
				<h4>Caddy Config</h4>

				<div class="caddy-select-container">
					<Dropdown
						helperText="Are you using a Caddyfile or a JSON config?"
						bind:selectedIndex={selectedConfigTypeIndex}
						items={[
							{ id: 'caddy', text: 'Caddyfile' },
							{ id: 'json', text: 'JSON Config' }
						]}
					/>
					<CaddyServerHelp />
				</div>
				{#if !isEdit}
					<div class="block">
						<p>
							<strong>DNS:</strong>&nbsp;After launching this server, its IP addresses will be
							generated for you to point your DNS records.
						</p>
					</div>
				{/if}
			</div>
			{#if data.configType === ServerConfigType.CADDYFILE}
				<div class="block">
					<TextArea
						labelText="Caddyfile"
						bind:value={data.caddyFileConfig}
						rows={10}
						hideLabel={true}
						placeholder={caddyFilePlaceholder}
						helperText="Paste your Caddyfile contents here"
					/>
				</div>
			{:else}
				<div class="block">
					<TextArea
						labelText="Caddy JSON Config"
						bind:value={data.caddyJSONConfig}
						rows={10}
						hideLabel={true}
						placeholder={caddyJSONConfigPlaceholder}
						helperText="Paste your Caddy JSON config here"
					/>
				</div>
			{/if}

			{#if isEdit ? $updateServer$.isError : $launchServer$.isError}
				<div class="block">
					<InlineMessage
						title="Error"
						kind="error"
						state={isEdit ? $updateServer$ : $launchServer$}
					/>
				</div>
			{/if}

			<div class="block">
				<AsyncButton
					on:click={onSubmit}
					isLoading={isEdit ? $updateServer$.isLoading : $launchServer$.isLoading}
					icon={CloudUpload32}
				>
					{isEdit ? 'Update Server' : 'Launch Server'}
				</AsyncButton>
			</div>
		</div>
	</Form>
</section>

<style>
	.region-tile-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5em;
		max-height: 400px;
		overflow-y: auto;
	}

	.caddy-select-container {
		display: flex;
		gap: 2em;
		width: 500px;
		max-width: 100%;
	}

	.region-title-container {
		display: flex;
		gap: 15px;
		align-items: center;
	}
</style>
