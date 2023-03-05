<script lang="ts">
	import { ToastNotification } from 'carbon-components-svelte';
	import { onDestroy } from 'svelte';
	import { showNotification$ } from '../store';

	let showNotification = false;
	const timeout = 7500;
	const sub = showNotification$.subscribe((state) => {
		if (state?.title || state?.message) {
			showNotification = true;

			setTimeout(() => {
				showNotification = false;
			}, timeout);
		}
	});

	onDestroy(sub);
</script>

{#if showNotification}
	<div class="notification-container">
		<ToastNotification
			title={$showNotification$.title}
			kind={$showNotification$.kind}
			subtitle={$showNotification$.message}
			{timeout}
		/>
	</div>
{/if}

<style>
	.notification-container {
		z-index: 100000;
		position: fixed;
		top: 50px;
		right: 2rem;
	}
</style>
