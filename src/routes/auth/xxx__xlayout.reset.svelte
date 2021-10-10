<script lang="ts">
	import { Column, Content, Grid, Header, Row } from 'carbon-components-svelte';
</script>

<svelte:head>
	<title>AppMasker</title>
</svelte:head>

<Header company="AppMasker">
	<div slot="skip-to-content">
		<!-- <SkipToContent /> -->
	</div>
</Header>

<Content>
	<Grid>
		<Row>
			<Column>
				<div class="auth-container">
					<slot />
				</div>
			</Column>
		</Row>
	</Grid>
</Content>

<style>
	.auth-container {
		margin: 2em auto;
		max-width: 400px;
	}
</style>
