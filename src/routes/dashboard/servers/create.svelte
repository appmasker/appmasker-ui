<script lang="ts">
	import { Breadcrumb, BreadcrumbItem } from 'carbon-components-svelte';
	import ServerCreationForm from '../../../components/forms/ServerCreationForm.svelte';
	import { launchServer } from '../../../store';
	import type { ServerInput } from '../../../types';

	function onSubmit(submission: CustomEvent<ServerInput>): void {
		launchServer.dispatch(submission.detail);
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

	<ServerCreationForm on:submit={(event) => onSubmit(event)} />
</div>

<style>
	.server-form-container {
		max-width: 1000px;
	}
</style>
