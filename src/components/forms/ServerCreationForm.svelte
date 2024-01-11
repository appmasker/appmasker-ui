<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		Checkbox,
		CodeSnippet,
		DataTable,
		Dropdown,
		Form,
		FormGroup,
		InlineNotification,
		Link,
		ListItem,
		SelectableTile,
		TextArea,
		TextInput,
		UnorderedList
	} from 'carbon-components-svelte';
	import CloudUpload32 from 'carbon-icons-svelte/lib/CloudUpload32';
	import AddAlt32 from 'carbon-icons-svelte/lib/AddAlt32';
	import { products } from '../../utils/billing';
	import { createEventDispatcher } from 'svelte';
	import {
		caddyFilePlaceholder,
		caddyJSONConfigPlaceholder,
		regionDictToList,
		serverToForm,
		validateForm
	} from '../../routes/dashboard/servers/_utils';
	import { flyRegions } from '../../utils/consts';
	import AsyncButton from '../AsyncButton.svelte';
	import CaddyServerHelp from '../dialogs/CaddyServerHelp.svelte';
	import InlineMessage from '../indicators/InlineMessage.svelte';
	import { showNotification$, updateServer$, createServer$, launchServer$ } from '../../store';
	import Tooltip from '../Tooltip.svelte';
	import CaddyPluginForm from './CaddyPluginForm.svelte';
	import { Server, ServerConfigType, ServerForm, ServerInput, ServerTier } from '../../types';
	import billingService from '../../services/billing-service';

	export let server: Server = null;
	export let isEdit = false;
	export let tier: ServerTier = ServerTier.BASIC;
	export let launchReady = false;

	let aRecord = false,
		aaaaRecord = false,
		cnameRecord = false;

	const dispatch = createEventDispatcher();

	let data: ServerForm = isEdit
		? serverToForm(server)
		: JSON.parse(localStorage.getItem('caddy-form')) || serverToForm(server);

	let selectedConfigTypeIndex = 0;
	$: data.configType =
		selectedConfigTypeIndex === 0 ? ServerConfigType.CADDYFILE : ServerConfigType.JSON;

	function onSubmit() {
		const validation = validateForm(data);
		console.log('data', validation, data);
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

	function onLaunch(): void {
		dispatch('launch', server);
	}
</script>

<section class="block">
	<Accordion align="start" size="xl">
		<AccordionItem title="">
			<svelte:fragment slot="title">
				<h5>Important info about our managed Caddy instances</h5>
			</svelte:fragment>
			<p style="margin-left: 20px">
				<UnorderedList>
					<ListItem
						>We're currently deploying
						<Link href="https://github.com/caddyserver/caddy/releases/tag/v2.6.0" target="_blank">
							Caddy v2.6.0
						</Link>
					</ListItem>

					<ListItem>
						You can't configure <a href="https://caddyserver.com/docs/json/admin" target="_blank"
							>admin</a
						>
						or <a href="https://caddyserver.com/docs/json/storage" target="_blank">storage</a>
					</ListItem>
					<ListItem>Ports other than 80 and 443 are not yet supported.</ListItem>
					<ListItem>Environment variables are not yet supported</ListItem>
					<ListItem
						>API access to managed Caddy deployments is undocumented. Let us know if you want API
						access!</ListItem
					>
				</UnorderedList>
			</p>
			<p class="block">
				If you have an advanced use case we're not supporting, <Link href="/dashboard/help"
					>let us know!</Link
				>.
			</p>
		</AccordionItem>
	</Accordion>
</section>

<section class="large-container">
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
					disabled={launchReady}
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
						<p>🚀 Choose regions close to your customers for optimal performance!</p>
					</Tooltip>
				</div>
				<p>
					Choose which regions to deploy your server (${products[tier].monthlyPrice}/region/month).
				</p>
				<div class="region-tile-grid" role="group" aria-label="selectable tiles">
					{#each flyRegions as region}
						<SelectableTile
							disabled={launchReady}
							bind:selected={data.regions[region.id]}
							value={region.id}>{region.label}</SelectableTile
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
							Object.values(data.regions).filter(Boolean).length
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
							Object.values(data.regions).filter(Boolean).length
						)}.00 USD per
					month (1 month of total usage is free!)`}
					/>
				{/if}
			</div>

			<div class="block">
				<h4>Caddy Config</h4>

				<div class="caddy-select-container">
					<Dropdown
						helperText="Are you using a Caddyfile or a JSON config?"
						disabled={launchReady}
						bind:selectedIndex={selectedConfigTypeIndex}
						items={[
							{ id: 'caddy', text: 'Caddyfile' },
							{ id: 'json', text: 'JSON Config' }
						]}
					/>
					<CaddyServerHelp />
				</div>
			</div>
			{#if data.configType === ServerConfigType.CADDYFILE}
				<div class="block">
					<TextArea
						labelText="Caddyfile"
						disabled={launchReady}
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
						disabled={launchReady}
						bind:value={data.caddyJSONConfig}
						rows={10}
						hideLabel={true}
						placeholder={caddyJSONConfigPlaceholder}
						helperText="Paste your Caddy JSON config here"
					/>
				</div>
			{/if}

			{#if $createServer$.isError || $updateServer$.isError}
				<div class="block">
					<InlineMessage title="Error" kind="error" state={$createServer$ || $updateServer$} />
				</div>
			{/if}

			<div class="block">
				<Accordion align="start">
					<AccordionItem>
						<svelte:fragment slot="title">
							<h5>Caddy Plugins</h5>
						</svelte:fragment>
						<CaddyPluginForm bind:plugins={data.plugins} readonly={isEdit || launchReady} />
					</AccordionItem>
				</Accordion>
			</div>

			<h4 class="block">IP Addresses</h4>

			{#if isEdit && !launchReady}
				<div class="block form-medium">
					<DataTable
						headers={[
							{ key: 'ipAddress', value: 'IP Address' },
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
				</div>
			{/if}

			{#if !launchReady && !isEdit}
				<div class="block">
					<InlineNotification
						title="DNS: "
						subtitle="After creation, the IP addresses will be generated for you to point your domains' DNS records."
						kind="warning"
						hideCloseButton
					/>
				</div>
			{/if}

			<div class="block">
				{#if launchReady}
					<AsyncButton
						on:click={onSubmit}
						isLoading={isEdit ? $updateServer$.isLoading : $createServer$.isLoading}
						icon={isEdit ? CloudUpload32 : AddAlt32}
					>
						{isEdit ? 'Update Server' : 'Create Server'}
					</AsyncButton>
				{:else}
					<div class="block">
						<InlineNotification
							title="Update your DNS Records!"
							subtitle={`Before launching you must add DNS records for any domains used in your Caddyfile, if applicable.
								Check the box below once you've set your DNS records.`}
							kind="warning-alt"
							hideCloseButton
						/>
					</div>
					<Form on:submit={onLaunch}>
						<FormGroup>
							<!-- {#if server?.ipv4Address}
								<div class="checkbox-row">
									<div>
										<Checkbox id="a-record" bind:checked={aRecord} labelText="A record, value:" />
									</div>
									<CodeSnippet
										type="inline"
										code={server?.ipv4Address}
										feedback="Copied to clipboard!"
									/>
									<div>(shared)</div>
								</div>
							{/if} -->
							<div class="checkbox-row">
								<div>
									<Checkbox
										id="aaaa-record"
										bind:checked={aaaaRecord}
										labelText="AAAA record, value:"
									/>
								</div>
								<CodeSnippet
									type="inline"
									code={server?.ipv6Address}
									feedback="Copied to clipboard!"
								/>
							</div>
							<div class="checkbox-row">
								<div>
									<Checkbox
										id="cname-record"
										bind:checked={cnameRecord}
										labelText="CNAME record, value:"
									/>
								</div>
								<CodeSnippet
									type="inline"
									code={server?.appId + '.fly.dev'}
									feedback="Copied to clipboard!"
								/>
							</div>
							<div class="block">
								<AsyncButton
									type="submit"
									disabled={!aRecord && !aaaaRecord && !cnameRecord}
									isLoading={$launchServer$.isLoading || $createServer$.isLoading}
									icon={CloudUpload32}
								>
									Launch Server
								</AsyncButton>
							</div>
							</FormGroup
						>
					</Form>
				{/if}
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
	.checkbox-row {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: 5px;
	}
</style>
