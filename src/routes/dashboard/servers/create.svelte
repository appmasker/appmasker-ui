<script lang="ts">
	import { Breadcrumb, BreadcrumbItem } from 'carbon-components-svelte';
	import UpdateBillingDialog from '../../../components/dialogs/UpdateBillingDialog.svelte';
	import ServerCreationForm from '../../../components/forms/ServerCreationForm.svelte';
	import { Server, ServerInput, ServerTier } from '../../../types';
	import billingService from '../../../services/billing-service';
	import {
		getServers,
		regionCount,
		getCurrentUser,
		createServer,
		createServer$,
		launchServer
	} from '../../../store';

	let billingDialogIsOpen = false;
	let price: number = 0;
	let tier: ServerTier = ServerTier.BASIC;
	let isEditMode = false;
	let launchReady = false;

	getServers.dispatch();

	function onSubmit(submission: CustomEvent<ServerInput>): void {
		getCurrentUser.dispatch(null, (err) => {
			const newRegionCount = $regionCount + submission.detail.regions.length;
			if (billingService.accountIsGood() || newRegionCount <= 1) {
				createServer.dispatch(submission.detail);
				isEditMode = true;
				launchReady = true;
				localStorage.removeItem('caddy-form');
			} else {
				// set the price for the billing dialog
				price = billingService.computeMonthlySubtotal(tier, submission.detail.regions.length);
				billingDialogIsOpen = true;
			}
		});
	}

	function onLaunch(server: CustomEvent<Server>): void {
		launchServer.dispatch(server.detail);
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
	<ServerCreationForm
		isEdit={isEditMode}
		{launchReady}
		{tier}
		server={$createServer$.data}
		on:submit={(event) => onSubmit(event)}
		on:launch={(event) => onLaunch(event)}
	/>
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
