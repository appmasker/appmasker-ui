<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Form, Link, PasswordInput, TextInput, Tile } from 'carbon-components-svelte';
	import { getCurrentUser, showNotification$ } from '../../store';
	import { backendCall } from '../../api';
	import type { User } from '../../types';

	let email = '';
	let password = '';

	function onSubmit() {
		// signIn.dispatch({ email, password });
		backendCall<User, { email: string; password: string }>('/auth/login', 'POST', {
			email,
			password
		})
			.then((result) => {
				goto('/');
			})
			.catch((err) => {
				showNotification$.set({
					message: err?.message || 'Make sure your credentials are correct',
					title: 'Login Failed'
				});
			});
	}
</script>

<div class="auth-container">
	<Tile>
		<Form on:submit={onSubmit}>
			<TextInput bind:value={email} required type="email" autofocus labelText="Email" />
			<PasswordInput bind:value={password} required labelText="Password" />
			<div class="actions-row">
				<Button type="submit">Log In</Button>
				<Link kind="tertiary" href="/auth/signup">Create an Account</Link>
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
