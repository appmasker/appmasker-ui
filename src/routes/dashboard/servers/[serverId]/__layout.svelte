<script lang="ts" context="module">
	export async function load(params: LoadInput): Promise<LoadOutput> {
		try {
			const resp = await backendCall(`/server/${params.page.params['serverId']}`);
			return {
				props: {
					server: resp.data
				}
			};
		} catch (error) {
			return {
				status: 404
			};
		}
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import {
		Breadcrumb,
		BreadcrumbItem,
		Tab,
		Tabs
	} from 'carbon-components-svelte';
	import { onMount } from 'svelte';
	import { backendCall } from '../../../../api';
	import { updateServer } from '../../../../store';
	import type { Server } from '../../../../types';
	import { currentServer } from '../_utils';

	export let server: Server;

	$: currentServer.update((_server) => server);

	const tabs = [
		'status',
		'logs',
		// 'caddy-config',
		'build'
	];
	// subscribe to navigation route to update tab index
	$: tabIndex = tabs.findIndex((tabName) => $page.path.split('/').pop() === tabName);

	onMount(() => {
		updateServer.store.set({ isLoading: false, isError: false, data: null }); // clear the state
	});

	function onTabClick(tabName: string) {
		const basePath = `/dashboard/servers/${server.id}`;
		goto(`${basePath}/${tabName}`);
	}
</script>

<div class="server-details-container">
	<div class="block">
		<Breadcrumb noTrailingSlash>
			<BreadcrumbItem href="/dashboard/servers">Servers</BreadcrumbItem>
			<BreadcrumbItem isCurrentPage>Details</BreadcrumbItem>
		</Breadcrumb>
	</div>

	<h1>{server?.name}</h1>

	<Tabs type="container" bind:selected={tabIndex}>
		<Tab label="Status" on:click={() => onTabClick('status')} />
		<Tab label="Logs" on:click={() => onTabClick('logs')} />
		<!-- <Tab label="Caddy Config" on:click={() => onTabClick('caddy-config')} /> -->
		<Tab label="Configuration" on:click={() => onTabClick('build')} />
	</Tabs>
	<slot />
</div>

<style>
	.server-details-container {
		/* max-width: 1000px; */
	}
	.footer-buttons {
		margin-top: 70px;
	}
</style>
