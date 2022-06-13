<script lang="ts">
	import { Loading, TooltipIcon } from 'carbon-components-svelte';
	import ErrorFilled from 'carbon-icons-svelte/lib/ErrorFilled16';
	import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled16';
	import WarningAltFilled from 'carbon-icons-svelte/lib/WarningAltFilled16';
	import { DNS_RECORD_STATUS, DomainDNSRecordData } from '../types';
	import { chooseDNSStatus } from '../utils/domain';

	export let status: DomainDNSRecordData;

	$: dnsStatus = status ? chooseDNSStatus(status) : null;
	console.log('status', status, dnsStatus);
</script>

{#if !dnsStatus}
	<Loading withOverlay={false} small />
{:else if dnsStatus.status === DNS_RECORD_STATUS.ERROR}
	<TooltipIcon tooltipText={dnsStatus.message} direction="left" align="start">
		<ErrorFilled fill="red" class="error" />
	</TooltipIcon>
{:else if dnsStatus.status === DNS_RECORD_STATUS.WARNING}
	<TooltipIcon tooltipText={dnsStatus.message} direction="left" align="start">
		<WarningAltFilled />
	</TooltipIcon>
{:else if dnsStatus.status === DNS_RECORD_STATUS.GOOD}
	<TooltipIcon tooltipText={dnsStatus.message} direction="left" align="start">
		<CheckmarkFilled />
	</TooltipIcon>
{/if}
