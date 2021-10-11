<script lang="ts">
	import { getCurrentUser } from './../../store/effects';
	import { Button, Tile } from 'carbon-components-svelte';
	import CurrencyDollar32 from 'carbon-icons-svelte/lib/CurrencyDollar32';
	import { currentUser$ } from '../../store';
	import { BACKEND_HOST, BUSINESS_STANDARD_PRICE_ID } from '../../utils/environment';
	import { isSubscribed } from '../../utils/billing';
	import CheckmarkFilled16 from 'carbon-icons-svelte/lib/CheckmarkFilled16';
	import { onMount } from 'svelte';

	onMount(() => {
		getCurrentUser.dispatch();
	});
</script>

<h1>Billing</h1>

<div class="block">
	<Tile>
		<h3>Free Trial</h3>
		<ul class="block">
			<li>Create 2 domains to try out AppMasker</li>
			<li>No Credit Card required</li>
		</ul>
	</Tile>
</div>
<div class="block">
	<Tile>
		<h3>Business - $50/mo</h3>
		<ul class="block">
			<li>Includes 10 domains</li>
			<li>Additional domains at $3 / domain per month</li>
			<li>Refunds and deleted domains will be prorated</li>
			<li>All charges are made annually</li>
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
