<script lang="ts">
	import { TextInput } from 'carbon-components-svelte';

	export let value = '';
</script>

<div class="backend-address-container">
	<TextInput
		bind:value
		labelText="Your Service IP Address / Domain name"
		placeholder="example.com:443 or 199.28.2.1:443"
		helperText="You should include the port number. For a typical HTTPS connection, it will be :443"
	/>
</div>

<style>
</style>
