<script lang="ts">
	import { Tooltip } from 'carbon-components-svelte';
	export let icon;
	export let direction;
	let open = false;
</script>

<span on:mouseenter={() => (open = true)} on:mouseleave={() => (open = false)}>
	<Tooltip {icon} {open} {direction}>
		<slot />
	</Tooltip>
</span>
