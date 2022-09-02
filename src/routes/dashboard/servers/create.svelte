<script lang="ts">
	import { Breadcrumb, BreadcrumbItem } from 'carbon-components-svelte';
	import { products } from '../../../utils/billing';
	import UpdateBillingDialog from '../../../components/dialogs/UpdateBillingDialog.svelte';
	import ServerCreationForm from '../../../components/forms/ServerCreationForm.svelte';
	import { ServerInput, ServerTier } from '../../../types';
	import billingService from '../../../services/billing-service';
	import { getServers, accountServers$, launchServer, regionCount } from '../../../store';

	let billingDialogIsOpen = false;
	let price: number = 0;
	let tier: ServerTier = ServerTier.BASIC;

	getServers.dispatch();

	function onSubmit(submission: CustomEvent<ServerInput>): void {
		console.log('submission', submission);
		console.log('plan active', billingService.planIsActive());
		console.log('req payment', $regionCount);
		const newRegionCount = $regionCount + submission.detail.regions.length;
		if (billingService.planIsActive() || newRegionCount <= 1) {
			launchServer.dispatch(submission.detail);
			localStorage.removeItem('caddy-form');
		} else {
			// set the price for the billing dialog
			price = billingService.computeMonthlySubtotal(
				tier,
				$accountServers$.data,
				submission.detail.regions.length
			);
			billingDialogIsOpen = true;
		}
	}
</script>

<div class="server-form-container">
	<div class="block">
		<Breadcrumb noTrailingSlash>
			<BreadcrumbItem href="/dashboard/servers">Servers</BreadcrumbItem>
			<BreadcrumbItem isCurrentPage>Create</BreadcrumbItem>
		</Breadcrumb>
	</div>

	<h1>Deploy a Caddy Web Server</h1>
	<ServerCreationForm isEdit={false} {tier} on:submit={(event) => onSubmit(event)} />
</div>

<UpdateBillingDialog
	modalIsOpen={billingDialogIsOpen}
	{price}
	on:close={() => (billingDialogIsOpen = false)}
/>

<style>
	.server-form-container {
		max-width: 1000px;
	}
</style>
