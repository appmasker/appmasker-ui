<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Tile } from 'carbon-components-svelte';

	const checkoutSecret = $page.query.get('checkoutSecret');
</script>

<h1>Billing</h1>

<div class="block">
	<Tile>
		<h3>Your Payment Method was stored securely.</h3>
		<br />
		<p>You will be billed at an hourly rate at the conclusion of each month.</p>
		<p>
			Reach out to <a
				target="_blank"
				href="mailto:support@appmasker.com?subject=Help%20with%20Caddy%20configuration&body=Hi!%20I%20need%20help%20writing%20a%20Caddy%20config%20file.%20Here%20is%20my%20use-case%3A"
			>
				support@appmasker.com
			</a> with questions.
		</p>
		<br />

		<Button href="/dashboard/servers/create">Return to launch Caddy</Button>
	</Tile>
</div>

<style>
</style>
