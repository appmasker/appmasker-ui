<script lang="ts">
	import { CodeSnippet, Link, Tile } from 'carbon-components-svelte';
	import { APPMASKER_IPV4_ADDRESS, APPMASKER_IPV6_ADDRESS } from '../../utils/environment';
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
				<p>
					<b>Address of your backend service.</b> Choose the IP Address or a domain name plus the port
					number (probably :443).
				</p>
				<p>
					For example: <code>example.com:443</code> or <code>188.38.2.1:443</code>.
				</p>
			</li>

			<li>
				<b>Custom JSON data.</b> Query this data from our <Link href="/dashboard/api">API</Link> later.
				Use it to adjust your app's UI for the tenant or enable other dynamic functionality.
			</li>
			<li>
				<b>Path Redirects.</b>&nbsp;For example, you could have the <code>/logo</code> path redirect
				to the tenant's logo.
			</li>
		</ul>
	</Tile>
	<br />
	<Tile>
		<h4>DNS Records</h4>
		<p>
			Your tenants will need to create an A record pointed to <CodeSnippet
				type="inline"
				code={APPMASKER_IPV4_ADDRESS}
			/>
			and / or an AAAA record pointed to <CodeSnippet
				type="inline"
				code={APPMASKER_IPV6_ADDRESS}
			/>.
		</p>
		<p>This will point their domains to AppMasker so that we can manage TLS certs and redirects.</p>
	</Tile>
	<br />
	<Tile>
		<h4>Having Trouble?</h4>
		<p>
			Send an email to <Link
				href="mailto:support@appmasker.com?subject=Help%20with%20AppMasker&body=I%20have%20a%20question%20about%20AppMasker."
			>
				support@appmasker.com</Link
			>
		</p>
	</Tile>
</div>
<div class="block">
	<DomainTable rows={$accountDomains$.data.domains} isLoading={$accountDomains$.isLoading} />
</div>
