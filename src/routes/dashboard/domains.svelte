<script lang="ts">
	import { Tile } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	import DomainTable from '../../components/tables/DomainTable.svelte';
	import { accountDomains$, getDomains } from '../../store';

	onMount(() => {
		getDomains.dispatch();
	});
</script>

<h1>Domains</h1>

<div class="block">
	<Tile>
		<h3>Getting Started</h3>
		<p>
			Configure the domains that you manage on behalf of your tenants. All domains automatically
			have TLS certificates.
		</p>
		<p>
			Check a row to edit or delete 1 or more domains. Here are some things that you can configure
			for a domain:
		</p>
		<br />
		<ul>
			<li>
				<b>The IP Address of your backend service.</b> If you enter more than 1, AppMasker will load
				balance between them. Your tenants will need to create either a CNAME (for subdomains) or A/AAAA
				(for root domains) record pointed to xxx.xx.xx.x
			</li>
			<!-- TODO: replace with public anycast IP -->
			<li>
				<b>Enter custom JSON data.</b> You can query this data from our API later. Use it to adjust your
				app's UI for the tenant or enable other dynamic functionality.
			</li>
			<li>
				<b>Create Redirects.</b>&nbsp;For example, you could have the <code>/logo</code> path for any
				domain redirect to the tenant's logo (some url).
			</li>
		</ul>
	</Tile>
</div>
<div class="block">
	<DomainTable rows={$accountDomains$.data.domains} isLoading={$accountDomains$.isLoading} />
</div>
