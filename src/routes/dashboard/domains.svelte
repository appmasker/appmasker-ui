<script lang="ts">
	import DomainTable from '../../components/tables/DomainTable.svelte';
	import type { DomainConfig } from '../../types';

	let rows: DomainConfig[] = [
		{
			id: '1234',
			name: 'example.com',
			createdAt: 12349595,
			ipAddresses: ['182.199.2.2', '182.199.2.2'],
			data: { foo: 'bar', fizz: 'buzz' },
			redirects: [
				{ from: '/logo', to: 'https://google.com' },
				{ from: '/logo', to: 'https://google.com' },
				{ from: '/logo', to: 'https://google.com' }
			]
		},
		{
			id: '12345',
			name: 'example2.com',
			createdAt: 12349595,
			ipAddresses: ['182.199.2.2', '182.199.2.2'],
			data: { foo: 'bar', fizz: 'bat', name: 'cory' },
			redirects: [
				{ from: '/logo', to: 'https://google.com' },
				{ from: '/logo', to: 'https://google.com' },
				{ from: '/logo', to: 'https://google.com' }
			]
		}
	];

	function submitConfigChange(data) {
		console.log('final submit now', data);
	}
</script>

<h1>Domains</h1>

<p>
	Configure the domains that you manage on behalf of your tenants. All domains automatically have
	TLS certificates.
</p>
<p>
	Check a row to edit or delete 1 or more domains. Here are some things that you can configure for a
	domain:
</p>
<br />
<ul>
	<li>
		<b>The IP Address of your backend service.</b> If you enter more than 1, AppMasker will load balance
		between them. Your tenants will need to create either a CNAME (for subdomains) or A/AAAA (for root
		domains) record pointed to xxx.xx.xx.x
	</li>
	<li>
		<b>Enter custom JSON data.</b> You can query this data from our API later. Use it to adjust your
		app's UI for the tenant or enable other dynamic functionality.
	</li>
	<li>
		<b>Create Redirects.</b>&nbsp;For example, you could have the <code>/logo</code> path for any domain
		redirect to the tenant's logo (some url).
	</li>
</ul>

<div class="block">
	<DomainTable {rows} />
</div>
