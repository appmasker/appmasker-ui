<script>
	import { Tile } from 'carbon-components-svelte';
	import { currentUser$ } from '../store';
</script>

<div class="block">
	<Tile>
		<h3>Your Account</h3>
		<p>
			{$currentUser$?.data?.email}
		</p>
	</Tile>
</div>
