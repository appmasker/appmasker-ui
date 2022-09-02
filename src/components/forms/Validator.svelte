<script lang="ts">
	import type { ValidatorFunction } from '../../utils/validators';

	export let value;
	export let fn: ValidatorFunction<any>;

	let hasBlurred = false;

	function handleBlur(event) {
		hasBlurred = true;
	}

	$: validation = hasBlurred ? fn(value) : null;
</script>

<slot onBlur={handleBlur} invalid={!!validation} invalidText={validation} />
