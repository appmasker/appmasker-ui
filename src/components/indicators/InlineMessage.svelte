<script lang="ts">
	import { ToastNotification } from 'carbon-components-svelte';
	import type { AsyncState } from '../../types';

	export let state: AsyncState<any>;
	export let title: string;
	export let kind: 'error' | 'info' | 'info-square' | 'success' | 'warning' | 'warning-alt' =
		'error';
	console.log('error state', state);
</script>

<ToastNotification {title} {kind} subtitle={state.message} />
