<script lang="ts">
	import { goto } from '$app/navigation';

	import { Button, Form, Link, PasswordInput, TextInput, Tile } from 'carbon-components-svelte';
	import { backendCall } from '../../api';
	import type { User } from '../../types';

	let email: string;
	let password: string;

	function onSubmit() {
		// signIn.dispatch({ email, password });
		backendCall<User, { email: string; password: string }>('/auth/signup', 'POST', {
			email,
			password
		}).then((result) => {
			console.log('updating session with', result);
			goto('/');
		});
	}
</script>

<div class="auth-container">
	<Tile>
		<Form on:submit={onSubmit}>
			<TextInput
				bind:value={email}
				type="email"
				placeholder="your@email.com"
				autofocus
				required
				labelText="Email"
			/>
			<PasswordInput
				bind:value={password}
				required
				placeholder="create a password"
				labelText="Password"
			/>
			<div class="actions-row">
				<Button type="submit">Sign Up</Button>
				<Link kind="tertiary" href="/auth/login">Log In</Link>
			</div>
		</Form>
	</Tile>
</div>

<style>
	.auth-container {
		margin: 2em auto;
		max-width: 400px;
	}
</style>
