<script>
	import { Link, Tile } from 'carbon-components-svelte';
</script>

<h1>Help</h1>

<div class="block">
	<Tile>
		<h3>Questions?</h3>
		<div class="block">
			<p>
				Send an email to <Link
					href="mailto:support@appmasker.com?subject=Help%20with%20AppMasker&body=I%20have%20a%20question%20about%20AppMasker."
				>
					support@appmasker.com</Link
				>
				or send us a Tweet:
			</p>
			<br />
			<a
				class="twitter-timeline"
				data-width="350"
				data-height="600"
				data-theme="light"
				href="https://twitter.com/AppMasker?ref_src=twsrc%5Etfw">Tweets by AppMasker</a
			> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
		</div>
	</Tile>
</div>
