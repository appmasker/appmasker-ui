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
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import {
		Breadcrumb,
		BreadcrumbItem,
		ComposedModal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from 'carbon-components-svelte';
	import TrashCan32 from 'carbon-icons-svelte/lib/TrashCan32';
	import { onMount } from 'svelte';
	import { backendCall } from '../../../api';
	import AsyncButton from '../../../components/AsyncButton.svelte';
	import ServerCreationForm from '../../../components/forms/ServerCreationForm.svelte';
	import { deleteServer, deleteServer$, updateServer } from '../../../store';
	import type { Server, ServerInput } from '../../../types';

	export let server: Server;
	let openDeleteConfirm = false;

	onMount(() => {
		updateServer.store.set({ isLoading: false, isError: false, data: null }); // clear the state
	});

	function onEditServer(form: ServerInput) {
		console.log('form', form);
		updateServer.dispatch({
			id: server.id,
			...form
		});
		localStorage.removeItem('caddy-form');
	}
	function onDeleteServer() {
		openDeleteConfirm = false;
		deleteServer.dispatch(server.id);
		localStorage.removeItem('caddy-form');
	}
</script>

<div class="server-details-container">
	<div class="block">
		<Breadcrumb noTrailingSlash>
			<BreadcrumbItem href="/dashboard/servers">Servers</BreadcrumbItem>
			<BreadcrumbItem isCurrentPage>Details</BreadcrumbItem>
		</Breadcrumb>
	</div>

	<h1>Manage <b>{server?.name}</b></h1>

	<ServerCreationForm {server} isEdit={true} on:submit={(event) => onEditServer(event.detail)} />

	<div class="footer-buttons">
		<AsyncButton
			kind="danger"
			isLoading={$deleteServer$.isLoading}
			on:click={() => (openDeleteConfirm = true)}
			icon={TrashCan32}
		>
			Delete Server
		</AsyncButton>
	</div>
</div>

<ComposedModal bind:open={openDeleteConfirm} danger={true} on:submit={onDeleteServer}>
	<ModalHeader title={`Delete ${server.name}?`} />
	<ModalBody>
		Your server will be immediately destroyed and you'll be refunded for this month pro-rata.
	</ModalBody>
	<ModalFooter
		primaryButtonText="Delete Server"
		secondaryButtonText="Cancel"
		danger={true}
		on:click:button--secondary={() => {
			openDeleteConfirm = false;
		}}
	/>
</ComposedModal>

<style>
	.server-details-container {
		max-width: 1000px;
	}
	.footer-buttons {
		margin-top: 70px;
	}
</style>
