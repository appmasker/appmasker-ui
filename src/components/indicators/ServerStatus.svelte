<script lang="ts">
	import { InlineLoading, TooltipIcon } from 'carbon-components-svelte';

	import CheckmarkFilled20 from 'carbon-icons-svelte/lib/CheckmarkFilled20';
	import CloseFilled20 from 'carbon-icons-svelte/lib/CloseFilled20';
	import UnknownFilled20 from 'carbon-icons-svelte/lib/UnknownFilled20';
	import {
		Server,
		ServerAppState,
		ServerAppStatus,
		ServerDisplayStatus,
		ServerStatus
	} from '../../types';

	export let server: Server;

	$: serverStatus = getServerStatus(server);

	function getFlyStatus(appState: ServerAppState): ServerDisplayStatus {
		switch (appState) {
			case ServerAppState.PENDING:
				return ServerDisplayStatus.PENDING;
			case ServerAppState.SUSPENDED:
				return ServerDisplayStatus.FAILURE;
			case ServerAppState.DEPLOYED:
				return ServerDisplayStatus.GOOD;
			default:
				return ServerDisplayStatus.UNKNOWN;
		}
	}

	function getServerStatus(server: Server): ServerDisplayStatus {
		const flyStatus = getFlyStatus(server.app?.state);
		if (flyStatus === ServerDisplayStatus.FAILURE) {
			return ServerDisplayStatus.FAILURE;
		}
		switch (server.status) {
			case ServerStatus.GOOD:
				return flyStatus;
			case ServerStatus.ERROR:
				return ServerDisplayStatus.FAILURE;
			default:
				return ServerDisplayStatus.PENDING;
		}
	}
</script>

{#if serverStatus === ServerDisplayStatus.FAILURE}
	<div class="server-status fail-svg">
		<TooltipIcon
			tooltipText={`Something is wrong.
			Build Status: ${server.status?.toUpperCase()}
			App Status: ${getFlyStatus(server.app?.state)}
			Message: ${server.error}`}
			icon={CloseFilled20}
			direction="right"
		/>
	</div>
{:else if serverStatus === ServerDisplayStatus.PENDING}
	<InlineLoading />
{:else if serverStatus === ServerDisplayStatus.GOOD}
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
			tooltipText={`Your server status is in flux, try waiting a bit. Status: ${serverStatus}, State: ${server.status?.toUpperCase()}`}
			icon={UnknownFilled20}
			direction="right"
		/>
	</div>
{/if}

<style>
	.server-status {
		display: flex;
	}
</style>
