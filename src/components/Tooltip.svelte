<script>
	import { Tooltip } from 'carbon-components-svelte';

	export let text = `What's this?`;
	let open = false;
</script>

<span on:mouseleave={() => (open = false)} on:mouseenter={() => (open = true)}>
	<Tooltip bind:open triggerText={text} align="start">
		<slot />
	</Tooltip>
</span>
