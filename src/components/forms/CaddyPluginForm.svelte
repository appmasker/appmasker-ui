<script lang="ts">
	import { Button, InlineNotification, Link, TextInput } from 'carbon-components-svelte';
	import TrashCan16 from 'carbon-icons-svelte/lib/TrashCan16';
	import Validator from './Validator.svelte';
	import { goModuleValidator } from '../../utils/validators';

	export let plugins = [''];
	export let readonly = false;
</script>

<p>
	Please enter the <strong>Go Module</strong> path for your desired Caddy plugin.
</p>
<p>
	See a list of common plugins here: <Link href="https://caddyserver.com/download" target="_blank"
		>https://caddyserver.com/download</Link
	>
</p>
<p>
	You can specify a version of the module like so: <code
		>github.com/caddyserver/ntlm-transport@v0.1.1</code
	>
</p>
{#if readonly}
	<InlineNotification
		title=""
		subtitle="Changing plugins for an existing server will be supported soon!"
		kind="warning"
		hideCloseButton
	/>
{/if}

{#each plugins as plugin, index}
	<div class="block input-row">
		<Validator value={plugin} fn={goModuleValidator} let:onBlur let:invalid let:invalidText>
			<TextInput
				bind:value={plugin}
				id={`plugin-${index}`}
				labelText=""
				helperText="enter a go module path like: github.com/caddy-dns/cloudflare"
				placeholder="github.com/caddy-dns/cloudflare"
				size="xl"
				{readonly}
				on:blur={onBlur}
				{invalid}
				{invalidText}
			/>
		</Validator>
		<Button
			kind="danger-tertiary"
			size="field"
			iconDescription="Delete"
			icon={TrashCan16}
			on:click={() => (plugins = plugins.filter((p, i) => i !== index))}
			disabled={readonly}
		/>
	</div>
{/each}

<div class="block">
	<Button
		kind="tertiary"
		size="field"
		on:click={() => (plugins = [...plugins, ''])}
		disabled={readonly}
	>
		+ Add A Plugin
	</Button>
</div>

<style>
	.input-row {
		display: flex;
		justify-content: space-evenly;
		align-items: flex-start;
		gap: 16px;
	}
</style>
