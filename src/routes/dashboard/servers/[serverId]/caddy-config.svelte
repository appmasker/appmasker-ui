<script lang="ts">
	import { CodeSnippet, Dropdown, TextArea } from 'carbon-components-svelte';
	import CloudUpload32 from 'carbon-icons-svelte/lib/CloudUpload32';
	import CaddyServerHelp from '../../../../components/dialogs/CaddyServerHelp.svelte';
	import {
		caddyFilePlaceholder,
		caddyJSONConfigPlaceholder,
		currentServer,
		serverToForm,
		validateCaddyFileConfig
	} from '../../../../routes/dashboard/servers/_utils';
	import { ServerConfigType, ServerForm, ServerInput } from '../../../../types';
	import AsyncButton from '../../../../components/AsyncButton.svelte';
	import { showNotification$, updateServer, updateServer$ } from '../../../../store';
	import { createEventDispatcher } from 'svelte';

	let isEdit = true;
	let selectedConfigTypeIndex = 0;

	$: data = (
		isEdit
			? serverToForm($currentServer)
			: JSON.parse(localStorage.getItem('caddy-form')) || serverToForm($currentServer)
	) as ServerForm;

	$: data.configType =
		selectedConfigTypeIndex === 0 ? ServerConfigType.CADDYFILE : ServerConfigType.JSON;

	function onSubmit(submittedData: ServerForm) {
		const validation = validateCaddyFileConfig(submittedData);
		// console.log('data', validation, data);
		const invalidText = Object.values(validation).find(Boolean);
		if (invalidText) {
			showNotification$.set({
				message: invalidText,
				title: 'Form Validation Error',
				kind: 'error'
			});
		} else {
			localStorage.setItem('caddy-form', JSON.stringify(submittedData));
      // updateServer.dispatch({
      //   id: $currentServer.id,
      //   uriEncodedCaddyfile:
			// 		submittedData.configType === ServerConfigType.CADDYFILE ? submittedData.caddyFileConfig : undefined,
			// 	caddyJSONConfig:
			// 		submittedData.configType === ServerConfigType.JSON ? JSON.parse(submittedData.caddyJSONConfig) : undefined,
      // });
			// dispatch('submit', {
			// 	name: submittedData.name,
			// 	regions: submittedData.regions,
			// 	uriEncodedCaddyfile:
			// 		submittedData.configType === ServerConfigType.CADDYFILE ? submittedData.caddyFileConfig : undefined,
			// 	caddyJSONConfig:
			// 		submittedData.configType === ServerConfigType.JSON ? JSON.parse(submittedData.caddyJSONConfig) : undefined,
			// 	plugins: submittedData.plugins,
			// 	staticContent: submittedData.staticContent,
			// 	variables: submittedData.variables
			// } as ServerInput);
		}
	}
</script>

<div class="block">
	<h4>Caddy Config</h4>

	<div class="caddy-select-container">
		<Dropdown
			style="width: 150px"
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
		<p>
			You can use <CodeSnippet
				type="inline"
				code={`{$FLY_APP_NAME}.fly.dev`}
				feedback="Copied to clipboard!"
			/> for your host if you don't have a domain.
		</p>
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
		<p>
			You can use <CodeSnippet
				type="inline"
				code={`{env.FLY_APP_NAME}.fly.dev`}
				feedback="Copied to clipboard!"
			/> for your host if you don't have a domain.
		</p>
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

<AsyncButton
	on:click={() => onSubmit(data)}
	isLoading={$updateServer$.isLoading}
	icon={CloudUpload32}
>
	{isEdit ? 'Update Server' : 'Create Server'}
</AsyncButton>
