<script lang="ts">
	import { Button, Tile } from 'carbon-components-svelte';
	import CheckmarkFilled16 from 'carbon-icons-svelte/lib/CheckmarkFilled16';
	import CurrencyDollar32 from 'carbon-icons-svelte/lib/CurrencyDollar32';
	import { onMount } from 'svelte';
	import { currentUser$ } from '../../store';
	import { isSubscribed } from '../../utils/billing';
	import { BACKEND_HOST, BUSINESS_STANDARD_PRICE_ID } from '../../utils/environment';
	import { getCurrentUser } from './../../store/effects';

	onMount(() => {
		getCurrentUser.dispatch();
	});
</script>

<h1>Billing</h1>

<div class="block">
	<Tile>
		<h3>Your Account</h3>
		<p>
			{$currentUser$?.data?.email}
		</p>
	</Tile>
	<br />
	<Tile>
		<h3>Free Trial</h3>
		<ul class="block">
			<li>Create 2 domains to try out AppMasker</li>
			<li>No Credit Card required</li>
		</ul>
	</Tile>
	<br />
	<Tile>
		<h3>Business - $50/mo</h3>
		<ul class="block">
			<li>Includes 10 domains</li>
			<li>Additional domains at $3 / domain per month</li>
			<li>Refunds and deleted domains will be prorated</li>
			<li>All charges are made annually.</li>
			<li>
				For example, if you request an 11th domain 6 months into your billing cycle, you'll be
				charged $18 ($3 x 12 months x 0.5)
			</li>
		</ul>

		{#if !isSubscribed($currentUser$?.data?.account?.type)}
			<form
				action={`${BACKEND_HOST}/stripe/create-checkout-session/${BUSINESS_STANDARD_PRICE_ID}`}
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
	.stripe-logo {
		height: 3em;
		width: auto;
	}

	.subscribed {
		display: flex;
		align-items: center;
	}
</style>
