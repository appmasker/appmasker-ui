<script lang="ts">
	import { Button, InlineLoading } from 'carbon-components-svelte';

	export let isLoading = false;
	export let icon = null;
	export let kind:
		| 'primary'
		| 'secondary'
		| 'tertiary'
		| 'ghost'
		| 'danger'
		| 'danger-tertiary'
		| 'danger-ghost' = 'primary';
</script>

<Button {kind} disabled={isLoading} {icon} on:click>
	<div class="async-button-content">
		<slot />
		{#if isLoading}
			<div class="loading-container">
				<InlineLoading />
			</div>
		{/if}
	</div>
</Button>

<style>
	.async-button-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
	}
	.loading-container {
		margin-left: 20px;
	}
</style>
