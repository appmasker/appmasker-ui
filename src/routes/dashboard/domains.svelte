<script lang="ts">
	import { CodeSnippet, Tile } from 'carbon-components-svelte';
	import { onDestroy, onMount } from 'svelte';
	import DomainTable from '../../components/tables/DomainTable.svelte';
	import { accountDomains$, getDomains, dnsStatus$, getDnsStatus } from '../../store';
	import { APPMASKER_IPV4_ADDRESS, APPMASKER_IPV6_ADDRESS } from '../../utils/environment';

	onMount(() => {
		getDomains.dispatch();
	});

	const unsub = accountDomains$.subscribe((data) => {
		if (data.data.count && !data.isLoading && data.data.domains.every((d) => d.name)) {
			getDnsStatus.dispatch({ domains: data.data.domains.map((domain) => domain.name) });
		}
	});

	onDestroy(unsub);
</script>

<h1>Domains</h1>

<div class="block">
	<Tile>
		<h3>Getting Started</h3>
		<p>Here are some things that you can configure for a domain:</p>
		<br />
		<ul class="app">
			<li>
				<p>
					<b>Address of your backend service.</b> Choose the IP Address or a domain name plus the port
					number (probably :443).
				</p>
				<p>
					For example: <code>example.com:443</code> or <code>188.38.2.1:443</code>.
				</p>
			</li>

			<!-- <li>
				<b>Custom JSON data.</b> Query this data from our <Link href="/dashboard/api">API</Link> later.
				Use it to adjust your app's UI for the tenant or enable other dynamic functionality.
			</li> -->
			<li>
				<b>Path Redirects.</b>&nbsp;For example, you could have the <code>/logo</code> path redirect
				to the tenant's logo.
			</li>
		</ul>
	</Tile>
	<br />
	<Tile>
		<h4>DNS Records</h4>
		<br />
		<ul class="app">
			<li>
				Each custom domain needs an A record pointed to <CodeSnippet
					type="inline"
					code={APPMASKER_IPV4_ADDRESS}
				/>
				and / or an AAAA record pointed to <CodeSnippet
					type="inline"
					code={APPMASKER_IPV6_ADDRESS}
				/>.
			</li>
		</ul>
	</Tile>
	<br />
	{#if $accountDomains$.data.domains?.length}
		<Tile>
			<h4>Verify that it worked</h4>
			<br />
			<ul class="app">
				<li>
					Check the "Status" column in the table below to verify that you created the proper DNS
					records
				</li>
				<li>
					If the status is good but your domain still doesn't work, give the DNS changes 24 hours to
					update
				</li>
				<li>Try your domain in an incognito tab or on a different device</li>
			</ul>
			<p />
		</Tile>
	{/if}
</div>

{#if accountDomains$ && dnsStatus$ && accountDomains$}
	<div class="block">
		<DomainTable
			rows={$accountDomains$.data.domains}
			dnsStatus={$dnsStatus$.data}
			isLoading={$accountDomains$.isLoading}
		/>
	</div>
{/if}
