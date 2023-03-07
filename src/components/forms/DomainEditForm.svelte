<script lang="ts">
	import {
		Accordion,
		AccordionItem,
		Button,
		Checkbox,
		Form,
		TextInput,
		TextArea,
		Link
	} from 'carbon-components-svelte';
	import ArrowRight16 from 'carbon-icons-svelte/lib/ArrowRight16';
	import TrashCan16 from 'carbon-icons-svelte/lib/TrashCan16';
	import { jsonPlaceholder } from '../../utils/consts';
	import { createEventDispatcher } from 'svelte';
	import { IDomainForm, Redirect } from '../../types';
	import {
		domainNameValidator,
		ipAddressValidator,
		redirectFromValidator,
		redirectToValidator,
		domainDataValidator,
		rewriteUriValidator
	} from '../../utils/validators';
	import Validator from './Validator.svelte';

	export let data = {} as IDomainForm;
	export let isEdit = false;
	const dispatch = createEventDispatcher();

	function onSubmit(): void {
		dispatch('submit', data);
	}

	function addAddress(): void {
		data.ipAddresses = [...data.ipAddresses, ''];
	}

	function removeAddress(index: number): void {
		data.ipAddresses = data.ipAddresses.filter((value, i) => i !== index);
	}

	function addRedirect(): void {
		data.redirects = [...data.redirects, new Redirect()];
	}

	function removeRedir(index: number): void {
		data.redirects = data.redirects.filter((value, i) => i !== index);
	}

	function addHeader(): void {
		data.headersDownstream = [...data.headersDownstream, ['', '']];
	}

	function removeHeader(index: number): void {
		data.headersDownstream = data.headersDownstream.filter((value, i) => i !== index);
	}
</script>

<Form on:submit={onSubmit}>
	<div class="block bottom-margin">
		<div class="block">
			<h5>Custom Domain Name</h5>

			<Validator value={data.name} fn={domainNameValidator} let:onBlur let:invalid let:invalidText>
				<TextInput
					bind:value={data.name}
					id="domain-name"
					disabled={isEdit}
					hideLabel={true}
					labelText="Domain name"
					placeholder="example.com or tenant.yoursite.com"
					helperText="Enter a root domain or subdomain that your tenant will use to access your service"
					required
					on:blur={onBlur}
					{invalid}
					{invalidText}
				/>
			</Validator>
		</div>
	</div>
	<div class="block bottom-margin">
		<div class="block">
			<h5>Your Service Addresses</h5>
			<p>
				Enter your service's IP Address or a domain name with the port number (probably :443). More
				than 1 address enables loadbalancing.
			</p>
		</div>
		{#each data.ipAddresses as addr, index}
			<div class="block redirect-form-row">
				<Validator value={addr} fn={ipAddressValidator} let:onBlur let:invalid let:invalidText>
					<div class="backend-address-container">
						<TextInput
							id="ipAddress"
							bind:value={addr}
							labelText="Your Service IP Address / Domain name"
							placeholder="example.com:443 or 199.28.2.1:443"
							helperText="You should include the port number (likely :443). Don't include https://"
							required
							on:blur={onBlur}
							{invalid}
							{invalidText}
						/>
					</div>
				</Validator>
				<div class="row-inline-container">
					<Button
						kind="danger-tertiary"
						size="field"
						iconDescription="Delete"
						icon={TrashCan16}
						on:click={() => removeAddress(index)}
					/>
				</div>
			</div>
		{/each}
		<Button kind="tertiary" size="field" on:click={addAddress}>+ Add Address</Button>
	</div>
	<div class="block bottom-margin">
		<div class="block">
			<h5>Redirects</h5>
			<p>
				Redirect from a path on the tenant's domain to some url that returns the relevant content
				for the tenant.
			</p>
		</div>
		{#each data.redirects as redir, index}
			<div class="block redirect-form-row">
				<div class="redirect-from">
					<Validator
						value={redir.from}
						fn={redirectFromValidator}
						let:onBlur
						let:invalid
						let:invalidText
					>
						<TextInput
							bind:value={redir.from}
							labelText="From"
							placeholder="/logo"
							on:blur={onBlur}
							{invalid}
							{invalidText}
						/>
					</Validator>
				</div>
				<div>
					<ArrowRight16 style="position:relative; top:2.5em" />
				</div>
				<div class="redirect-to">
					<Validator
						value={redir.to}
						fn={redirectToValidator}
						let:onBlur
						let:invalid
						let:invalidText
					>
						<TextInput
							bind:value={redir.to}
							labelText="To"
							placeholder="https://s3.aws.com/example-customer-logo.png"
							on:blur={onBlur}
							{invalid}
							{invalidText}
						/>
					</Validator>
				</div>
				<div class="row-inline-container">
					<Button
						kind="danger-tertiary"
						size="field"
						iconDescription="Delete"
						icon={TrashCan16}
						on:click={() => removeRedir(index)}
					/>
				</div>
			</div>
		{/each}
		<Button kind="tertiary" size="field" on:click={addRedirect}>+ Add A Redirect</Button>
	</div>

	<div class="block bottom-margin">
		<div class="block">
			<h5>Metadata</h5>
			<p>
				Optional. You can query this data from our <Link href="/dashboard/api" target="_blank"
					>API</Link
				> later.
			</p>
			<div class="block" on:keydown|stopPropagation>
				<Validator
					bind:value={data.data}
					fn={domainDataValidator}
					let:onBlur
					let:invalid
					let:invalidText
				>
					<TextArea
						bind:value={data.data}
						on:blur={onBlur}
						{invalid}
						{invalidText}
						rows={10}
						labelText="Tenant Data"
						hideLabel={true}
						placeholder={jsonPlaceholder}
						helperText="Generally the structure of this object will be consistent with all your tenants but the values should vary."
					/>
				</Validator>
			</div>
		</div>
	</div>

	<div class="block bottom-margin">
		<Accordion>
			<AccordionItem title="Advanced...">
				<div class="block bottom-margin">
					<div class="block">
						<h5>Client Headers</h5>
						<p>
							Rewrite "downstream" headers. Downstream refers to the client making the call to this
							domain (such as a user's browser). You might need to overwrite headers if you don't
							control the server at the service address you listed above.
						</p>
					</div>
					{#each data.headersDownstream as header, index}
						<div class="block redirect-form-row">
							<div class="header-name">
								<TextInput
									bind:value={header[0]}
									labelText="Header Name"
									placeholder="Access-Control-Allow-Origin"
									required
								/>
							</div>
							<div class="header-value">
								<TextInput
									bind:value={header[1]}
									labelText="Header Value"
									placeholder="*"
									helperText="Mutiple values should be comma-delimited (no spaces)."
									required
								/>
							</div>
							<div class="row-inline-container">
								<Button
									kind="danger-tertiary"
									size="field"
									iconDescription="Delete"
									icon={TrashCan16}
									on:click={() => removeHeader(index)}
								/>
							</div>
						</div>
					{/each}
					<Button kind="tertiary" size="field" on:click={addHeader}>+ Add A Header</Button>
				</div>

				<div class="block bottom-margin">
					<div class="block">
						<h5>URI Rewrites</h5>
						<p>
							If you want to have all requests to your backend include a path or query param, enter
							that here.
						</p>
						<p>
							For example, say your backend "address" is <code>mysite.com:443</code>. If you
							navigate to
							<br />
							<code>https://customdomain.com/help?foo=bar</code><br /> and your URI rewrite value is
							<br /><code>/home?fizz=buzz</code>
							then the final address that AppMasker would proxy to would be:
							<br /><code>mysite.com:443/home/help?fizz=buzz&foo=bar</code> (the paths and query params
							get merged).
						</p>
						<div class="block">
							<Validator
								bind:value={data.rewriteUri}
								fn={rewriteUriValidator}
								let:onBlur
								let:invalid
								let:invalidText
							>
								<TextInput
									bind:value={data.rewriteUri}
									on:blur={onBlur}
									{invalid}
									{invalidText}
									labelText="Rewrite URI"
									hideLabel={true}
									placeholder="/dashboard?tenant=1234"
									helperText="Enter either a path and / or a query string."
								/>
							</Validator>
						</div>
					</div>

					<div class="block bottom-margin">
						<div class="block">
							<p>Enable this if you're running into HTTPS errors when using this domain.</p>
						</div>

						<Checkbox labelText="Ignore TLS Insecure Verify" bind:checked={data.skipTLSVerify} />
					</div>

					<div class="block bottom-margin">
						<div class="block">
							<p>
								Checking this allows you to navigate to http://yourdomain.com without automatically
								redirecting to https://
							</p>
						</div>

						<Checkbox labelText="Disable Automatic HTTPS" bind:checked={data.disableAutoHttps} />
					</div>
				</div></AccordionItem
			>
		</Accordion>
	</div>
</Form>

<style>
	.redirect-form-row {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1em;
	}

	.row-inline-container {
		height: 64px;
		display: flex;
		align-items: flex-end;
	}

	.backend-address-container {
		min-width: 45%;
	}

	.redirect-from {
		flex: 1;
	}
	.redirect-to {
		flex: 2;
	}

	.header-name {
		flex: 6;
	}
	.header-value {
		flex: 7;
	}

	.bottom-margin {
		margin-bottom: 4em;
	}
</style>
