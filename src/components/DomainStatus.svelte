<script lang="ts">
	import { Loading } from 'carbon-components-svelte';
	import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled16';
	import ErrorFilled from 'carbon-icons-svelte/lib/ErrorFilled16';
	import WarningAltFilled from 'carbon-icons-svelte/lib/WarningAltFilled16';
	import { DNS_RECORD_STATUS, DomainDNSRecordData } from '../types';
	import { chooseDNSStatus } from '../utils/domain';
	import TooltipHover from './TooltipHover.svelte';

	export let status: DomainDNSRecordData;

	$: dnsStatus = status ? chooseDNSStatus(status) : null;
	console.log('status', status, dnsStatus);
</script>

{#if !status}
	<Loading withOverlay={false} small />
{:else if dnsStatus.status === DNS_RECORD_STATUS.ERROR}
	<TooltipHover direction="top" icon={ErrorFilled}><p>{dnsStatus.message}</p></TooltipHover>
{:else if dnsStatus.status === DNS_RECORD_STATUS.WARNING}
	<TooltipHover direction="top" icon={WarningAltFilled}><p>{dnsStatus.message}</p></TooltipHover>
{:else if dnsStatus.status === DNS_RECORD_STATUS.GOOD}
	<TooltipHover direction="top" icon={CheckmarkFilled}><p>{dnsStatus.message}</p></TooltipHover>
{/if}
