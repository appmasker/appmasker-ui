<script lang="ts" context="module">
	export async function load(params: LoadInput): Promise<LoadOutput> {
    return {
				props: {
					serverId: params.page.params['serverId']
			}
		};
	}
</script>

<script lang="ts">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';
	import {
		ComposedModal,
		ModalBody,
		ModalFooter,
		ModalHeader
	} from 'carbon-components-svelte';
	import TrashCan32 from 'carbon-icons-svelte/lib/TrashCan32';
	import AsyncButton from '../../../../components/AsyncButton.svelte';
	import ServerCreationForm from '../../../../components/forms/ServerCreationForm.svelte';
	import { deleteServer, deleteServer$, launchServer, updateServer } from '../../../../store';
	import { Server, ServerInput, ServerStatus } from '../../../../types';
	import { currentServer } from '../_utils';

  export let serverId: string;
	let openDeleteConfirm = false;

	function onEditServer(form: ServerInput) {
		console.log('form', form);
		updateServer.dispatch({
			id: $currentServer.id,
			...form
		});
		localStorage.removeItem('caddy-form');
	}
	function onLaunchServer(server: Server): void {
		launchServer.dispatch(server);
	}
	function onDeleteServer() {
		openDeleteConfirm = false;
		deleteServer.dispatch($currentServer.id);
		localStorage.removeItem('caddy-form');
	}
</script>

<ServerCreationForm
	server={$currentServer}
	launchReady={$currentServer.status === ServerStatus.AWAITING_DNS}
	isEdit={true}
	on:submit={(event) => onEditServer(event.detail)}
	on:launch={(event) => onLaunchServer(event.detail)}
/>

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

<ComposedModal bind:open={openDeleteConfirm} danger={true} on:submit={onDeleteServer}>
	<ModalHeader title={`Delete ${$currentServer.name}?`} />
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
	.footer-buttons {
		margin-top: 70px;
	}
</style>