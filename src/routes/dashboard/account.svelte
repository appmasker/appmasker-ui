<script lang="ts">
	import { Button, Tile } from 'carbon-components-svelte';
	import { backendCall } from '../../api';
	import YourAccount from '../../components/YourAccount.svelte';
	import { BACKEND_HOST } from '../../utils/environment';

	function logout() {
		backendCall('/auth/logout', 'POST').then;
	}
</script>

<h1>Account</h1>

<div class="block">
	<YourAccount />
</div>

<div class="block">
	<Tile>
		<form action={`${BACKEND_HOST}/auth/logout`} method="post">
			<Button on:click={logout} kind="tertiary" type="submit">Log Out</Button>
		</form>
	</Tile>
</div>

<style>
</style>
