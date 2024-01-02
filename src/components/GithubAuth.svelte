<script lang="ts">
  import { Link, Button } from "carbon-components-svelte";
  import { BACKEND_HOST } from "../utils/environment";
  import { credentials$, getCredentials } from "../store";
  import { formatRelative } from 'date-fns';
  import CheckmarkFilled from 'carbon-icons-svelte/lib/CheckmarkFilled16';
	import { onDestroy } from "svelte";
	import { CredentialType } from "../types";

  export let user = null;

  const fetchCredentials = () => {
    getCredentials.dispatch({
      user: user?.id,
      type: CredentialType.GITHUB_ACCESS_TOKEN
    });
  }

  $: user && fetchCredentials();

  const visibilitychangeCb = () => {
    if (!document.hidden) {
      console.log('focus changed')
      fetchCredentials();
    }
  }
  document.addEventListener("visibilitychange", visibilitychangeCb);

  onDestroy(() => {
    document.removeEventListener("visibilitychange", visibilitychangeCb);
  });
</script>

<div>

  {#if !$credentials$?.data?.length}
    Connect to private repos by logging in with GitHub:
  {:else}
    <div class="block login-success">
      <CheckmarkFilled />
      &nbsp;
      We can access your private repos!
      You logged in with GitHub {formatRelative(new Date($credentials$?.data?.[0]?.createdDate), new Date())}
    </div>
  {/if}

  <Link
      href={`${BACKEND_HOST}/oauth/github/login?scopes=repo&state=${user?.id}`}
      target="_blank">
      <Button kind="secondary" size="field">
        <img
          class="github-logo"
          src="/images/3rd-party/github-mark-white.svg"
          alt="GitHub Logo"
        />
        Login to GitHub
      </Button>
    </Link>
</div>
<style>
  .login-success {
    display: flex;
    align-items: center;
  }
  .github-logo {
		height: 1em;
		margin-right: 10px;
	}
</style>