<script lang="ts">
	import { page } from '$app/stores';
	import { Stripe, loadStripe } from '@stripe/stripe-js';
	import { Button, Tile } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	let clientSecret = $page.query.get('setup_intent_client_secret');
	let message = 'Loading...';
	let stripe: Stripe = null;

	onMount(async () => {
		stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);
		stripe.retrieveSetupIntent(clientSecret).then(({ setupIntent }) => {
			// Inspect the SetupIntent `status` to indicate the status of the payment
			// to your customer.
			//
			// Some payment methods will [immediately succeed or fail][0] upon
			// confirmation, while others will first enter a `processing` state.
			//
			// [0]: https://stripe.com/docs/payments/payment-methods#payment-notification
			switch (setupIntent.status) {
				case 'succeeded': {
					message = 'Success! Your payment method has been saved securely.';
					break;
				}

				case 'processing': {
					message = "Processing payment details. We'll update you when processing is complete.";
					break;
				}

				case 'requires_payment_method': {
					message = 'Failed to process payment details. Please try another payment method.';

					// Redirect your user back to your payment page to attempt collecting
					// payment again

					break;
				}
			}
		});
	});
</script>

<h1>Billing</h1>

<div class="block">
	<Tile>
		<h3>{message}</h3>
		<br />
		<p>You will be billed at an hourly rate at the conclusion of each month.</p>
		<p>
			Reach out to <a
				target="_blank"
				href="mailto:support@appmasker.com?subject=Help%20with%20Caddy%20configuration&body=Hi!%20I%20need%20help%20writing%20a%20Caddy%20config%20file.%20Here%20is%20my%20use-case%3A"
			>
				support@appmasker.com
			</a> with questions.
		</p>
		<br />

		<Button href="/dashboard/servers/create">Return to launch Caddy</Button>
	</Tile>
</div>

<style>
</style>
