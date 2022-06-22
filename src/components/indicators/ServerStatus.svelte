<script lang="ts">
	import { InlineLoading, TooltipIcon } from 'carbon-components-svelte';

	import CheckmarkFilled20 from 'carbon-icons-svelte/lib/CheckmarkFilled20';
	import CloseFilled20 from 'carbon-icons-svelte/lib/CloseFilled20';
	import UnknownFilled20 from 'carbon-icons-svelte/lib/UnknownFilled20';
	import { ServerAppState, ServerAppStatus, ServerStatus } from '../../types';

	export let status: ServerAppStatus = null;
	export let state: ServerAppState = null;

	$: serverStatus = getServerStatus(status, state);

	function getServerStatus(status: ServerAppStatus, state: ServerAppState): ServerStatus {
		switch (state) {
			case ServerAppState.PENDING:
				return ServerStatus.PENDING;
			case ServerAppState.SUSPENDED:
				return ServerStatus.FAILURE;
			case ServerAppState.DEPLOYED:
				return status === ServerAppStatus.RUNNING ? ServerStatus.GOOD : ServerStatus.FAILURE;
			default:
				return ServerStatus.UNKNOWN;
		}
	}
</script>

{#if serverStatus === ServerStatus.FAILURE}
	<div class="server-status fail-svg">
		<TooltipIcon
			tooltipText={`Something is wrong. Status: ${status}, State: ${state}`}
			icon={CloseFilled20}
			direction="right"
		/>
	</div>
{:else if serverStatus === ServerStatus.PENDING}
	<InlineLoading />
{:else if serverStatus === ServerStatus.GOOD}
	<div class="server-status good-svg">
		<TooltipIcon
			tooltipText={`Your server is available at the displayed IP addresses`}
			icon={CheckmarkFilled20}
			direction="right"
		/>
	</div>
{:else}
	<div class="server-status">
		<TooltipIcon
			tooltipText={`Your server status is in flux, try waiting a bit. Status: ${status}, State: ${state}`}
			icon={UnknownFilled20}
			direction="right"
		/>
	</div>
{/if}

<style>
	.server-status {
		display: flex;
	}
	.fail-svg svg {
		fill: red !important;
	}
	.good-svg svg {
		fill: green !important;
	}
</style>
