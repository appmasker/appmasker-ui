<script lang="ts">
	import { Button, Tile } from 'carbon-components-svelte';
	import CheckmarkFilled16 from 'carbon-icons-svelte/lib/CheckmarkFilled16';
	import CurrencyDollar32 from 'carbon-icons-svelte/lib/CurrencyDollar32';
	import YourAccount from '../../components/YourAccount.svelte';
	import { currentUser$ } from '../../store';
	import { isSubscribed } from '../../utils/billing';
	import { BACKEND_HOST, ENVIRONMENT, PRICES } from '../../utils/environment';
	import { page } from '$app/stores';
	import { backendCall } from '../../api';

	const priceId = $page.query.get('checkout');
	console.log();
	if (priceId) {
		try {
			backendCall(`/stripe/create-checkout-session/${priceId}`, 'POST');
		} catch (error) {
			console.error('failed to make stripe session', error);
		}
	}
</script>

<h1>Billing</h1>

<div class="block">
	<YourAccount />
	<br />
	<Tile>
		<h3>Free Trial</h3>
		<ul class="block app">
			<li>Create 2 domains to try out AppMasker</li>
			<li>No Credit Card required</li>
		</ul>
	</Tile>
	<br />
	<Tile>
		<h3>Business - $49/month</h3>
		<ul class="block app">
			<li>Includes 10 domains</li>
			<li>Additional domains at $2.99 / domain / month</li>
			<li>Domain count is assessed monthly at the billing cycle conclusion</li>
		</ul>

		{#if !isSubscribed($currentUser$?.data?.account?.type)}
			<form
				action={`${BACKEND_HOST}/stripe/create-checkout-session/${PRICES.DOMAIN_STANDARD_MONTHLY[ENVIRONMENT]}`}
				method="POST"
			>
				<div class="block">
					<Button type="submit" icon={CurrencyDollar32}>Checkout</Button>
				</div>
				<div class="block">
					<img
						class="stripe-logo"
						src="/images/3rd-party/powered-by-stripe.svg"
						alt="Powered by Stripe"
					/>
				</div>
			</form>
		{:else}
			<div class="block subscribed">
				<CheckmarkFilled16 /> &nbsp; You're subscribed!
			</div>
		{/if}
	</Tile>
</div>

<style>
	.subscribed {
		display: flex;
		align-items: center;
	}
</style>
