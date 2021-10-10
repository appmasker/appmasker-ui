<script lang="ts">
	import { goto } from '$app/navigation';

	import { session } from '$app/stores';

	import { Button, Form, Link, PasswordInput, TextInput, Tile } from 'carbon-components-svelte';
	import { backendCall } from '../../api';
	import type { AppSession, User } from '../../types';

	// function logout() {
	//   backendCall('/')
	// }
</script>

<h1>Account</h1>

<div class="block">
	<!-- <Tile>
		<Button on:click=></Button>
	</Tile> -->
</div>

<style>
</style>
