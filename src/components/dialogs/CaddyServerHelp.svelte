<script>
	import { Link, Modal } from 'carbon-components-svelte';

	let showHelpDialog = false;
</script>

<Link kind="tertiary" style="cursor: pointer" on:click={() => (showHelpDialog = true)}>
	I need help!
</Link>

<Modal
	bind:open={showHelpDialog}
	modalHeading="Deploy a Caddy Server Instance"
	primaryButtonText="Okay"
	on:click:button--primary={() => (showHelpDialog = false)}
	on:open
	on:close
>
	<p class="block">
		Deploy a <a target="_blank" href="https://caddyserver.com">Caddy</a> server instance using our simple
		UI!
	</p>
	<p class="block">
		If you need help writing your Caddy configuration, please contact <a
			target="_blank"
			href="mailto:support@appmasker.com?subject=Help%20with%20Caddy%20configuration&body=Hi!%20I%20need%20help%20writing%20a%20Caddy%20config%20file.%20Here%20is%20my%20use-case%3A"
		>
			support@appmasker.com
		</a> with your use case.
	</p>
</Modal>
