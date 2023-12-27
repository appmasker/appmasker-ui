<script>
	import { Button, Tile } from 'carbon-components-svelte';
	import { currentUser$ } from '../store';
</script>

<div class="block">
	<Tile>
		<h3>Your Account</h3>
		<p>
			{$currentUser$?.data?.email}
		</p>
		<form method="POST" action="/stripe/create-portal-session">
			<Button type="submit" kind="secondary">Manage billing with Stripe</Button>
		</form>
	</Tile>
</div>
