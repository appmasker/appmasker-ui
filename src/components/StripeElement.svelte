<script lang="ts">
	import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
	import CurrencyDollar32 from 'carbon-icons-svelte/lib/CurrencyDollar32';
	import { STRIPE_PUBLIC_KEY } from '../utils/environment';
	import { onMount } from 'svelte';
	import { backendCall } from '../api';
	import AsyncButton from './AsyncButton.svelte';

	let stripe: Stripe = null;
	let elements: StripeElements = null;
	let errorMessage = null;
	let isLoadingSubmit = false;

	function onPaymentSubmit() {
		if (!stripe?.elements) {
			return;
		}
		isLoadingSubmit = true;
		stripe
			.confirmSetup({
				//`Elements` instance that was used to create the Payment Element
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/dashboard/billing/setup-complete`
				}
			})
			.then(({ error }) => {
				if (error) {
					// This point will only be reached if there is an immediate error when
					// confirming the payment. Show error to your customer (for example, payment
					// details incomplete)
					errorMessage = error.message;
				} else {
					// Your customer will be redirected to your `return_url`. For some payment
					// methods like iDEAL, your customer will be redirected to an intermediate
					// site first to authorize the payment, then redirected to the `return_url`.
				}
				isLoadingSubmit = false;
			});
	}

	onMount(async () => {
		stripe = await loadStripe(STRIPE_PUBLIC_KEY);
		const clientSecret = (
			await backendCall<{ checkoutSecret: string }>('/stripe/create-setup-intent', 'POST')
		).data?.checkoutSecret;
		const options = {
			clientSecret
		};
		elements = stripe.elements(options);
		const paymentElement = elements.create('payment');
		paymentElement.mount('#payment-element');
	});
</script>

<form id="payment-setup-form" on:submit|preventDefault={onPaymentSubmit}>
	<div id="payment-element">
		<!-- Elements will create form elements here -->
	</div>

	<div class="submit-button">
		<AsyncButton on:click={onPaymentSubmit} isLoading={isLoadingSubmit} icon={CurrencyDollar32}>
			Save Payment Info
		</AsyncButton>
	</div>

	<div id="error-message">
		{errorMessage ? errorMessage : ''}
	</div>
</form>

<style>
	#payment-element {
		background: #f4f4f4;
		border-radius: 5px;
		padding: 10px;
	}
	.submit-button {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		margin-top: 50px;
	}
</style>
