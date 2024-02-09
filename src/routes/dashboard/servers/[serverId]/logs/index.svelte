<script lang="ts" context="module">
	import type { LoadInput, LoadOutput } from '@sveltejs/kit';

	export async function load(params: LoadInput): Promise<LoadOutput> {
    if (!hasAuthenticatedWithDashboard.value) {
      await backendCall('/server/log-access').then(res => {
        hasAuthenticatedWithDashboard.value = true;
      });
    }
    return {};
	}
</script>

<script lang="ts">
	import { backendCall } from '../../../../../api';

	import { onMount } from 'svelte';
	import { hasAuthenticatedWithDashboard } from '../../_utils';

	export let src = `https://opensearch.appmasker.com/app/discover#/?_g=(filters:!(),refreshInterval:(pause:!t,value:0),time:(from:now-2m,to:now))&_a=(columns:!(_source),filters:!(),index:'4af18ab0-c49c-11ee-9d49-d5afa8551964',interval:auto,query:(language:kuery,query:''),sort:!())`;

	function authenticateWithDashboard() {
		return backendCall('/server/log-access');
	}
	// onMount(async () => {
	//   authenticateWithDashboard();
	// });
</script>

<div class="frame-container">
	<iframe {src} title="log viewer" frameborder="0" width="100%" height="100%" />
</div>

<style>
	.frame-container {
		/* margin: 2em auto; */
		width: 100%;
		height: 80vh;
	}
</style>
